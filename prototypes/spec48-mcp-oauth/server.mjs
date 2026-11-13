// PROTOTYPE, throwaway. Platform as the MCP OAuth authorization server, Keycloak as the employee login.
// Everything lives in memory. Not production code: no CSRF hardening, no admin auth, no persistence.
import http from 'node:http';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import * as oidc from 'openid-client';
import * as z from 'zod';
import { McpServer, legacyStatelessFallback, LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/server';

const DAY = 24 * 60 * 60;

export function configFromEnv(env = process.env) {
  const port = Number(env.PORT ?? 18481);
  const base = env.BASE_URL ?? `http://127.0.0.1:${port}`;
  return {
    port,
    base,
    resource: `${base}/mcp`,
    kcIssuer: env.KC_ISSUER ?? 'http://127.0.0.1:18480/realms/spec48',
    kcClientId: env.KC_CLIENT_ID ?? 'platform',
    kcClientSecret: env.KC_CLIENT_SECRET ?? 'proto-platform-secret',
    kcTimeoutMs: Number(env.KC_TIMEOUT_MS ?? 3000),
    accessTtlSec: Number(env.ACCESS_TTL_SEC ?? 15 * 60),
    idleTtlSec: Number(env.IDLE_TTL_SEC ?? 30 * DAY),
    codeTtlSec: 60,
    staticClient: {
      client_id: env.STATIC_CLIENT_ID ?? 'spec48-opencode',
      client_name: 'OpenCode (заранее зарегистрированный клиент)',
      redirect_uris: ['http://127.0.0.1/callback', 'http://127.0.0.1/mcp/oauth/callback'],
      token_endpoint_auth_method: 'none',
    },
    quiet: env.QUIET === '1',
  };
}

// Valid while now < lastUsed + N. Exactly at the boundary the connection is already expired.
export function isIdleExpired(lastUsedAtMs, nowMs, idleTtlMs) {
  return !(nowMs < lastUsedAtMs + idleTtlMs);
}

const sha256 = (s) => createHash('sha256').update(s).digest('base64url');
const token = () => randomBytes(32).toString('base64url');
const isLoopbackHost = (h) => h === '127.0.0.1' || h === '[::1]' || h === 'localhost';

// RFC 8252 7.3: for loopback redirects the port is chosen at runtime, so compare everything but the port.
// Only loopback redirects are accepted at all (decided design: code goes to a loopback listener).
export function redirectAllowed(registered, requested) {
  let req;
  try { req = new URL(requested); } catch { return false; }
  if (req.protocol !== 'http:' || !isLoopbackHost(req.hostname)) return false;
  return registered.some((r) => {
    const reg = new URL(r);
    return reg.protocol === req.protocol && reg.hostname === req.hostname && reg.pathname === req.pathname && reg.search === req.search;
  });
}

const PROJECTS = {
  'anna@example.test': [
    { id: 'alpha', name: 'Альфа', summary: 'Портал заявок', pointers: ['docs/alpha/brief.md', 'adr/0001-alpha.md'] },
    { id: 'beta', name: 'Бета', summary: 'Мобильное приложение', pointers: ['docs/beta/requirements.md'] },
  ],
  'boris@example.test': [{ id: 'gamma', name: 'Гамма', summary: 'Внутренний биллинг', pointers: ['docs/gamma/overview.md'] }],
};

export async function start(cfg = configFromEnv()) {
  const log = (...a) => { if (!cfg.quiet) console.log(new Date().toISOString(), ...a); };
  const state = {
    clients: new Map(),        // DCR clients by client_id
    cimd: new Map(),           // CIMD documents by URL
    authTx: new Map(),         // authorize transactions (Keycloak login + consent)
    codes: new Map(),          // authorization codes
    accessTokens: new Map(),   // sha256(access token) -> { connectionId, exp }
    refreshTokens: new Map(),  // sha256(refresh token) -> { connectionId, current }
    connections: new Map(),
    events: [],
  };
  const event = (type, data = {}) => {
    const e = { at: new Date().toISOString(), type, ...data };
    state.events.push(e);
    if (state.events.length > 300) state.events.shift();
    log(type, JSON.stringify(data));
    return e;
  };

  const kc = await oidc.discovery(new URL(cfg.kcIssuer), cfg.kcClientId, cfg.kcClientSecret, oidc.ClientSecretPost(cfg.kcClientSecret), {
    execute: [oidc.allowInsecureRequests],
    timeout: cfg.kcTimeoutMs / 1000,
  });
  kc.timeout = cfg.kcTimeoutMs / 1000;

  // ---------- client resolution: pre-registered, DCR, CIMD ----------
  async function resolveClient(clientId) {
    if (!clientId) throw new Error('client_id отсутствует');
    if (clientId === cfg.staticClient.client_id) return { registration: 'static', ...cfg.staticClient };
    if (state.clients.has(clientId)) return { registration: 'dcr', ...state.clients.get(clientId) };
    if (clientId.startsWith('https://')) return { registration: 'cimd', ...(await fetchCimd(clientId)) };
    if (clientId.startsWith('http://')) throw new Error('CIMD client_id должен быть HTTPS URL');
    throw new Error(`неизвестный client_id ${clientId}`);
  }

  async function fetchCimd(url) {
    const cached = state.cimd.get(url);
    if (cached && cached.until > Date.now()) return cached.doc;
    const u = new URL(url);
    if (u.protocol !== 'https:' || u.pathname === '/' || u.hash) throw new Error('CIMD URL должен быть https с путём');
    const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(5000), headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`CIMD ${url} ответил ${res.status}`);
    const text = await res.text();
    if (text.length > 5 * 1024) throw new Error('CIMD документ больше 5 КБ');
    const doc = JSON.parse(text);
    if (doc.client_id !== url) throw new Error('client_id в CIMD документе не совпадает с URL');
    if (!Array.isArray(doc.redirect_uris) || doc.redirect_uris.length === 0) throw new Error('в CIMD нет redirect_uris');
    if ((doc.token_endpoint_auth_method ?? 'none') !== 'none') throw new Error('прототип принимает только public CIMD client');
    if (doc.client_secret) throw new Error('CIMD документ не может содержать client_secret');
    state.cimd.set(url, { doc, until: Date.now() + 5 * 60 * 1000, fetchedAt: new Date().toISOString() });
    event('cimd.fetched', { url, client_name: doc.client_name, redirect_uris: doc.redirect_uris });
    return doc;
  }

  // ---------- tokens ----------
  function issueTokens(conn) {
    const access = token();
    const refresh = token();
    const exp = Date.now() + cfg.accessTtlSec * 1000;
    state.accessTokens.set(sha256(access), { connectionId: conn.id, exp });
    for (const [h, r] of state.refreshTokens) if (r.connectionId === conn.id) r.current = false;
    state.refreshTokens.set(sha256(refresh), { connectionId: conn.id, current: true });
    conn.accessExpiresAt = new Date(exp).toISOString();
    return { access_token: access, token_type: 'Bearer', expires_in: cfg.accessTtlSec, refresh_token: refresh };
  }

  // Checked on EVERY MCP request: token known, not expired, connection active, not idle-expired.
  function verifyAccess(header) {
    const m = /^Bearer (.+)$/i.exec(header ?? '');
    if (!m) return { error: 'missing', description: 'нужен Bearer token' };
    const rec = state.accessTokens.get(sha256(m[1]));
    if (!rec) return { error: 'invalid_token', description: 'неизвестный токен' };
    if (Date.now() >= rec.exp) return { error: 'invalid_token', description: 'токен истёк' };
    const conn = state.connections.get(rec.connectionId);
    if (!conn || conn.state !== 'active') return { error: 'invalid_token', description: `подключение в состоянии ${conn?.state}` };
    if (isIdleExpired(conn.lastUsedMs, Date.now(), cfg.idleTtlSec * 1000)) {
      conn.state = 'expired';
      event('connection.expired', { connection: conn.id, lastUsedAt: new Date(conn.lastUsedMs).toISOString() });
      return { error: 'invalid_token', description: 'подключение истекло по неактивности' };
    }
    conn.lastUsedMs = Date.now();
    return { conn, rec, raw: m[1] };
  }

  const prmUrl = `${cfg.base}/.well-known/oauth-protected-resource/mcp`;
  const unauthorized = (res, v) => {
    const parts = [`resource_metadata="${prmUrl}"`];
    if (v.error !== 'missing') parts.unshift(`error="${v.error}"`, `error_description="${encodeURIComponent(v.description)}"`);
    res.writeHead(401, { 'WWW-Authenticate': `Bearer ${parts.join(', ')}`, 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: v.error === 'missing' ? 'invalid_request' : v.error, error_description: v.description }));
  };

  // ---------- MCP ----------
  const mcp = legacyStatelessFallback(({ authInfo }) => {
    const email = authInfo?.extra?.email;
    const server = new McpServer({ name: 'spec48-platform-prototype', version: '0.0.1' });
    const mine = PROJECTS[email] ?? [];
    server.registerTool('list_projects', {
      description: 'Проекты, в которых участвует сотрудник этого подключения (только чтение).',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    }, async () => ({
      content: [{ type: 'text', text: JSON.stringify({ employee: email, projects: mine.map(({ id, name, summary }) => ({ id, name, summary })) }) }],
    }));
    server.registerTool('get_project_context', {
      description: 'Метаданные и указатели на контекст проекта (только чтение).',
      inputSchema: z.object({ project_id: z.string() }),
      annotations: { readOnlyHint: true },
    }, async ({ project_id }) => {
      const p = mine.find((x) => x.id === project_id);
      if (!p) return { isError: true, content: [{ type: 'text', text: `Нет доступа к проекту ${project_id}` }] };
      return { content: [{ type: 'text', text: JSON.stringify({ employee: email, project: p }) }] };
    });
    return server;
  }, (err) => event('mcp.error', { message: err.message }));

  async function handleMcp(req, res) {
    const v = verifyAccess(req.headers.authorization);
    if (!v.conn) {
      event('mcp.rejected', { reason: v.description });
      return unauthorized(res, v);
    }
    const authInfo = {
      token: v.raw,
      clientId: v.conn.clientId,
      scopes: [],
      expiresAt: Math.floor(v.rec.exp / 1000),
      resource: new URL(cfg.resource),
      extra: { email: v.conn.email, sub: v.conn.sub, connectionId: v.conn.id },
    };
    const request = new Request(new URL(req.url, cfg.base), {
      method: req.method,
      headers: Object.entries(req.headers).flatMap(([k, val]) => (Array.isArray(val) ? val.map((x) => [k, x]) : [[k, val]])),
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Readable.toWeb(req),
      duplex: 'half',
    });
    const response = await mcp(request, { authInfo });
    v.conn.requests += 1;
    event('mcp.request', { connection: v.conn.id, email: v.conn.email, status: response.status, protocolVersion: req.headers['mcp-protocol-version'] ?? '(initialize)' });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(res);
    else res.end();
  }

  // ---------- OAuth endpoints ----------
  const asMetadata = () => ({
    issuer: cfg.base,
    authorization_endpoint: `${cfg.base}/authorize`,
    token_endpoint: `${cfg.base}/token`,
    registration_endpoint: `${cfg.base}/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    client_id_metadata_document_supported: true,
    authorization_response_iss_parameter_supported: true,
  });
  const prm = () => ({
    resource: cfg.resource,
    authorization_servers: [cfg.base],
    bearer_methods_supported: ['header'],
    resource_name: 'Платформа (прототип spec48)',
  });

  async function handleAuthorize(url, res) {
    const p = Object.fromEntries(url.searchParams);
    let client;
    try { client = await resolveClient(p.client_id); } catch (e) { return page(res, 400, 'Ошибка клиента', esc(e.message)); }
    if (!redirectAllowed(client.redirect_uris, p.redirect_uri)) {
      event('authorize.bad_redirect', { client_id: p.client_id, redirect_uri: p.redirect_uri });
      return page(res, 400, 'Ошибка клиента', `redirect_uri не разрешён: ${esc(p.redirect_uri)}`);
    }
    const fail = (error, description) => redirect(res, withParams(p.redirect_uri, { error, error_description: description, state: p.state, iss: cfg.base }));
    if (p.response_type !== 'code') return fail('unsupported_response_type', 'нужен code');
    if (!p.code_challenge || p.code_challenge_method !== 'S256') return fail('invalid_request', 'нужен PKCE S256');
    if (sameResource(p.resource ?? '') === false) return fail('invalid_target', `resource должен быть ${cfg.resource}`);
    event('authorize.start', { registration: client.registration, client_id: p.client_id, client_name: client.client_name, redirect_uri: p.redirect_uri, resource: p.resource ?? null });
    const tx = { id: randomUUID(), params: p, client, created: Date.now(), kcVerifier: oidc.randomPKCECodeVerifier(), kcNonce: oidc.randomNonce() };
    state.authTx.set(tx.id, tx);
    // The Keycloak SSO cookie is the employee's web session: an existing one skips the password form.
    // Every connection still gets its own Keycloak code exchange and therefore its own refresh token.
    const kcUrl = oidc.buildAuthorizationUrl(kc, {
      redirect_uri: `${cfg.base}/login/callback`,
      scope: 'openid email profile offline_access',
      state: tx.id,
      nonce: tx.kcNonce,
      code_challenge: await oidc.calculatePKCECodeChallenge(tx.kcVerifier),
      code_challenge_method: 'S256',
    });
    redirect(res, kcUrl.href);
  }

  function sameResource(r) {
    if (!r) return null; // absent
    return r.replace(/\/$/, '') === cfg.resource;
  }

  async function handleLoginCallback(url, res) {
    const tx = state.authTx.get(url.searchParams.get('state'));
    if (!tx || tx.employee) return page(res, 400, 'Вход', 'Неизвестная или уже использованная попытка входа.');
    try {
      const tokens = await oidc.authorizationCodeGrant(kc, url, { pkceCodeVerifier: tx.kcVerifier, expectedState: tx.id, expectedNonce: tx.kcNonce });
      const c = tokens.claims();
      if (!c.email || c.email_verified !== true) return page(res, 403, 'Вход', 'Нужен подтверждённый email.');
      if (!tokens.refresh_token) return page(res, 500, 'Вход', 'Keycloak не выдал refresh token (offline_access).');
      tx.employee = { sub: c.sub, email: c.email, iss: c.iss };
      tx.kcRefreshToken = tokens.refresh_token;
      tx.kcScope = tokens.scope;
      event('login.ok', { email: c.email, sub: c.sub, kcScope: tokens.scope, kcRefreshTyp: decodeTyp(tokens.refresh_token) });
      redirect(res, `${cfg.base}/consent?tx=${tx.id}`);
    } catch (e) {
      event('login.failed', { error: e.error ?? e.code ?? e.message, description: e.error_description });
      page(res, 400, 'Вход', `Вход не удался: ${esc(e.error_description ?? e.message)}`);
    }
  }

  function handleConsentPage(url, res) {
    const tx = state.authTx.get(url.searchParams.get('tx'));
    if (!tx?.employee) return page(res, 400, 'Подключение', 'Попытка подключения не найдена.');
    const name = tx.client.client_name ?? tx.params.client_id;
    page(res, 200, 'Подключение агента', `
      <h1>Подключить ${esc(name)} от имени ${esc(tx.employee.email)}?</h1>
      <p>Клиент: <code>${esc(tx.params.client_id)}</code> (способ регистрации: ${esc(tx.client.registration)})</p>
      <p>Агент получит доступ только на чтение к контексту ваших проектов. Подключение можно отозвать на странице <a href="/connections">подключений</a>.</p>
      <form method="post" action="/consent" style="display:inline"><input type="hidden" name="tx" value="${tx.id}"><button name="decision" value="approve">Подключить</button></form>
      <form method="post" action="/consent" style="display:inline"><input type="hidden" name="tx" value="${tx.id}"><button name="decision" value="deny">Отказать</button></form>`);
  }

  function handleConsent(form, res) {
    const tx = state.authTx.get(form.get('tx'));
    if (!tx?.employee) return page(res, 400, 'Подключение', 'Попытка подключения не найдена.');
    state.authTx.delete(tx.id);
    const p = tx.params;
    if (form.get('decision') !== 'approve') {
      event('consent.denied', { email: tx.employee.email, client_id: p.client_id });
      return redirect(res, withParams(p.redirect_uri, { error: 'access_denied', state: p.state, iss: cfg.base }));
    }
    const code = token();
    state.codes.set(sha256(code), {
      clientId: p.client_id, client: tx.client, redirectUri: p.redirect_uri, challenge: p.code_challenge,
      resource: p.resource, employee: tx.employee, kcRefreshToken: tx.kcRefreshToken,
      exp: Date.now() + cfg.codeTtlSec * 1000, used: false,
    });
    event('consent.approved', { email: tx.employee.email, client_id: p.client_id, registration: tx.client.registration });
    redirect(res, withParams(p.redirect_uri, { code, state: p.state, iss: cfg.base }));
  }

  async function handleToken(form, res) {
    const json = (status, body) => { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(body)); };
    const grant = form.get('grant_type');
    const clientId = form.get('client_id');
    if (form.has('resource') && sameResource(form.get('resource')) === false) return json(400, { error: 'invalid_target', error_description: 'чужой resource' });

    if (grant === 'authorization_code') {
      const h = sha256(form.get('code') ?? '');
      const c = state.codes.get(h);
      if (!c) return json(400, { error: 'invalid_grant', error_description: 'неизвестный код' });
      if (c.used) {
        // Code replay: revoke whatever that code produced.
        const conn = state.connections.get(c.connectionId);
        if (conn) { conn.state = 'revoked'; conn.revokedReason = 'повтор кода авторизации'; }
        event('token.code_replay', { connection: c.connectionId });
        return json(400, { error: 'invalid_grant', error_description: 'код уже использован' });
      }
      c.used = true;
      if (Date.now() > c.exp) return json(400, { error: 'invalid_grant', error_description: 'код истёк' });
      if (clientId !== c.clientId) return json(400, { error: 'invalid_grant', error_description: 'код выдан другому клиенту' });
      if (form.get('redirect_uri') !== c.redirectUri) return json(400, { error: 'invalid_grant', error_description: 'redirect_uri не совпадает' });
      const verifier = form.get('code_verifier') ?? '';
      if (createHash('sha256').update(verifier).digest('base64url') !== c.challenge) return json(400, { error: 'invalid_grant', error_description: 'PKCE не сошёлся' });
      if (c.resource && form.has('resource') && form.get('resource').replace(/\/$/, '') !== c.resource.replace(/\/$/, '')) return json(400, { error: 'invalid_target', error_description: 'resource отличается от запроса авторизации' });
      const conn = {
        id: `conn-${randomUUID().slice(0, 8)}`,
        sub: c.employee.sub, email: c.employee.email,
        clientId, clientName: c.client.client_name ?? clientId, registration: c.client.registration,
        createdMs: Date.now(), lastUsedMs: Date.now(), state: 'active', requests: 0, refreshes: 0,
        kcRefreshToken: c.kcRefreshToken, providerChecks: [],
      };
      c.connectionId = conn.id;
      state.connections.set(conn.id, conn);
      event('connection.created', { connection: conn.id, email: conn.email, client_id: clientId, registration: conn.registration });
      return json(200, issueTokens(conn));
    }

    if (grant === 'refresh_token') {
      const rec = state.refreshTokens.get(sha256(form.get('refresh_token') ?? ''));
      if (!rec) return json(400, { error: 'invalid_grant', error_description: 'неизвестный refresh token' });
      const conn = state.connections.get(rec.connectionId);
      if (!rec.current) {
        event('token.refresh_reuse', { connection: conn.id });
        return json(400, { error: 'invalid_grant', error_description: 'refresh token уже заменён' });
      }
      if (clientId !== conn.clientId) return json(400, { error: 'invalid_grant', error_description: 'другой клиент' });
      if (conn.state !== 'active') {
        event('token.refresh_refused', { connection: conn.id, reason: conn.state });
        return json(400, { error: 'invalid_grant', error_description: `подключение в состоянии ${conn.state}` });
      }
      if (isIdleExpired(conn.lastUsedMs, Date.now(), cfg.idleTtlSec * 1000)) {
        conn.state = 'expired';
        event('connection.expired', { connection: conn.id });
        return json(400, { error: 'invalid_grant', error_description: 'подключение истекло по неактивности' });
      }
      // Provider check: refresh at Keycloak first. Refusal ends the connection; unreachable fails closed.
      const check = { at: new Date().toISOString() };
      try {
        const kt = await oidc.refreshTokenGrant(kc, conn.kcRefreshToken);
        if (kt.refresh_token) conn.kcRefreshToken = kt.refresh_token;
        check.result = 'ok';
      } catch (e) {
        if (e instanceof oidc.ResponseBodyError) {
          check.result = 'refused';
          check.keycloak = { status: e.status, error: e.error, error_description: e.error_description };
          conn.providerChecks.push(check);
          conn.state = 'provider_refused';
          conn.revokedReason = `Keycloak: ${e.error} (${e.error_description})`;
          event('provider.refused', { connection: conn.id, email: conn.email, keycloak: check.keycloak });
          return json(400, { error: 'invalid_grant', error_description: `провайдер отказал: ${e.error}: ${e.error_description}` });
        }
        check.result = 'unreachable';
        check.detail = `${e.name}: ${e.code ?? ''} ${e.message} ${e.cause?.code ?? e.cause?.message ?? ''}`.trim();
        conn.providerChecks.push(check);
        event('provider.unreachable', { connection: conn.id, detail: check.detail });
        res.setHeader('Retry-After', '30');
        return json(503, { error: 'temporarily_unavailable', error_description: 'провайдер личности недоступен, обновление отклонено' });
      }
      conn.providerChecks.push(check);
      if (conn.providerChecks.length > 20) conn.providerChecks.shift();
      conn.refreshes += 1;
      conn.lastUsedMs = Date.now();
      event('token.refreshed', { connection: conn.id, email: conn.email });
      return json(200, issueTokens(conn));
    }
    return json(400, { error: 'unsupported_grant_type' });
  }

  function handleRegister(body, res) {
    const json = (status, b) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(b)); };
    let meta;
    try { meta = JSON.parse(body); } catch { return json(400, { error: 'invalid_client_metadata', error_description: 'не JSON' }); }
    const uris = meta.redirect_uris;
    if (!Array.isArray(uris) || uris.length === 0) return json(400, { error: 'invalid_redirect_uri', error_description: 'нужны redirect_uris' });
    for (const u of uris) {
      let x; try { x = new URL(u); } catch { return json(400, { error: 'invalid_redirect_uri', error_description: u }); }
      if (x.protocol !== 'http:' || !isLoopbackHost(x.hostname)) return json(400, { error: 'invalid_redirect_uri', error_description: `только loopback http: ${u}` });
    }
    const method = meta.token_endpoint_auth_method ?? 'none';
    if (method !== 'none') return json(400, { error: 'invalid_client_metadata', error_description: 'только public client (none)' });
    const info = {
      client_id: `dcr-${randomUUID()}`,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: meta.client_name ?? 'DCR client',
      redirect_uris: uris,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    };
    state.clients.set(info.client_id, info);
    event('dcr.registered', { client_id: info.client_id, client_name: info.client_name, redirect_uris: uris });
    json(201, info);
  }

  // ---------- admin page ----------
  const fmt = (ms) => (ms ? new Date(ms).toISOString().replace('T', ' ').slice(0, 19) : '');
  function publicState() {
    return {
      settings: { accessTtlSec: cfg.accessTtlSec, idleTtlSec: cfg.idleTtlSec, protocolVersion: LATEST_PROTOCOL_VERSION, resource: cfg.resource },
      connections: [...state.connections.values()].map((c) => ({
        id: c.id, email: c.email, sub: c.sub, client: c.clientName, clientId: c.clientId, registration: c.registration,
        state: c.state, reason: c.revokedReason, created: fmt(c.createdMs), lastUsed: fmt(c.lastUsedMs),
        idleExpiresAt: fmt(c.lastUsedMs + cfg.idleTtlSec * 1000), accessExpiresAt: c.accessExpiresAt,
        requests: c.requests, refreshes: c.refreshes, providerChecks: c.providerChecks,
        keycloakRefreshToken: c.kcRefreshToken ? `${c.kcRefreshToken.slice(0, 12)}… (скрыт)` : null,
      })),
      accessTokens: [...state.accessTokens].map(([h, r]) => ({ sha256: `${h.slice(0, 10)}…`, connection: r.connectionId, exp: fmt(r.exp) })),
      refreshTokens: [...state.refreshTokens].map(([h, r]) => ({ sha256: `${h.slice(0, 10)}…`, connection: r.connectionId, current: r.current })),
      dcrClients: [...state.clients.values()],
      cimdCache: [...state.cimd].map(([url, c]) => ({ url, fetchedAt: c.fetchedAt, client_name: c.doc.client_name })),
      events: state.events.slice(-60),
    };
  }
  const STATE_RU = { active: 'активно', revoked: 'отозвано', provider_refused: 'отказ провайдера', expired: 'истекло' };
  function connectionsPage(res) {
    const rows = [...state.connections.values()].map((c) => `<tr>
      <td>${esc(c.email)}</td><td>${esc(c.clientName)}<br><small>${esc(c.registration)}</small></td><td>${fmt(c.createdMs)}</td><td>${fmt(c.lastUsedMs)}</td>
      <td>${STATE_RU[c.state] ?? c.state}${c.revokedReason ? `<br><small>${esc(c.revokedReason)}</small>` : ''}</td>
      <td>${c.state === 'active' ? `<form method="post" action="/connections/${c.id}/revoke"><button>Отозвать</button></form>` : ''}</td></tr>`).join('');
    page(res, 200, 'Подключения агентов', `<h1>Подключения агентов</h1>
      <p>Срок access token: ${cfg.accessTtlSec} с. Неактивность: ${cfg.idleTtlSec} с. MCP: ${LATEST_PROTOCOL_VERSION}. Страница обновляется каждые 5 с.</p>
      <table border="1" cellpadding="4"><tr><th>Сотрудник</th><th>Клиент</th><th>Создано</th><th>Последнее использование</th><th>Состояние</th><th></th></tr>${rows || '<tr><td colspan="6">Подключений пока нет</td></tr>'}</table>
      <h2>Полное состояние</h2><pre>${esc(JSON.stringify(publicState(), null, 2))}</pre>
      <script>setTimeout(() => location.reload(), 5000)</script>`);
  }

  // ---------- http plumbing ----------
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, cfg.base);
    const path = url.pathname;
    try {
      if (path === '/mcp') return await handleMcp(req, res);
      if (req.method === 'GET' && (path === '/.well-known/oauth-protected-resource/mcp' || path === '/.well-known/oauth-protected-resource')) return sendJson(res, prm());
      if (req.method === 'GET' && path === '/.well-known/oauth-authorization-server') return sendJson(res, asMetadata());
      if (req.method === 'GET' && path === '/authorize') return await handleAuthorize(url, res);
      if (req.method === 'GET' && path === '/login/callback') return await handleLoginCallback(url, res);
      if (req.method === 'GET' && path === '/consent') return handleConsentPage(url, res);
      if (req.method === 'POST' && path === '/consent') return handleConsent(new URLSearchParams(await readBody(req)), res);
      if (req.method === 'POST' && path === '/token') return await handleToken(new URLSearchParams(await readBody(req)), res);
      if (req.method === 'POST' && path === '/register') return handleRegister(await readBody(req), res);
      if (req.method === 'GET' && (path === '/' || path === '/connections')) return connectionsPage(res);
      if (req.method === 'GET' && path === '/state.json') return sendJson(res, publicState());
      const m = /^\/connections\/([^/]+)\/revoke$/.exec(path);
      if (req.method === 'POST' && m) {
        const conn = state.connections.get(m[1]);
        if (conn && conn.state === 'active') { conn.state = 'revoked'; conn.revokedReason = 'отозвано на странице подключений'; event('connection.revoked', { connection: conn.id, email: conn.email }); }
        return redirect(res, '/connections');
      }
      res.writeHead(404).end('not found');
    } catch (e) {
      event('server.error', { path, message: e.message });
      if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`ошибка: ${e.message}`);
    }
  });
  await new Promise((r) => server.listen(cfg.port, '127.0.0.1', r));
  log(`платформа слушает ${cfg.base}; MCP ${cfg.resource}; Keycloak ${cfg.kcIssuer}; access ${cfg.accessTtlSec} с; неактивность ${cfg.idleTtlSec} с`);
  return { server, state, cfg, publicState, close: () => new Promise((r) => { server.closeAllConnections(); server.close(r); }) };
}

function decodeTyp(jwt) {
  try { return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url')).typ; } catch { return 'opaque'; }
}
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const readBody = (req) => new Promise((resolve, reject) => { let b = ''; req.setEncoding('utf8'); req.on('data', (d) => (b += d)); req.on('end', () => resolve(b)); req.on('error', reject); });
const sendJson = (res, body) => { res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(JSON.stringify(body, null, 2)); };
const redirect = (res, location) => { res.writeHead(302, { location }); res.end(); };
const withParams = (base, params) => { const u = new URL(base); for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) u.searchParams.set(k, v); return u.href; };
const page = (res, status, title, body) => {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(title)}</title>
  <style>body{font-family:system-ui;margin:2rem;max-width:72rem}pre{background:#f4f4f4;padding:1rem;overflow:auto;font-size:12px}td,th{text-align:left;vertical-align:top}</style></head>
  <body><p><b>ПРОТОТИП spec48</b>, не для использования в работе.</p>${body}</body></html>`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start().catch((e) => { console.error('Не удалось запустить. Keycloak поднят? docker compose -p proto-spec48-mcp up -d\n', e); process.exit(1); });
}
