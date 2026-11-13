// PROTOTYPE self-test. Drives the whole flow with the official MCP client SDK (@modelcontextprotocol/client 2.4.0,
// the same package OpenCode v2.2.7 uses) against a fresh platform instance on port 18482 and the Compose Keycloak.
// The Keycloak login form is scripted like a browser would submit it (no direct grant anywhere).
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, StreamableHTTPClientTransport, auth } from '@modelcontextprotocol/client';
import { start, configFromEnv, isIdleExpired } from './server.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const KC = 'http://127.0.0.1:18480';
const OPENCODE_CIMD = 'https://opencode.ai/oauth/opencode/client.json';
const results = [];
const findings = {};
let step = 0;

function check(question, name, ok, detail = '') {
  results.push({ question, name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} [Q${question}] ${name}${detail ? `\n       ${detail}` : ''}`);
}
const section = (t) => console.log(`\n=== ${++step}. ${t}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- a scripted browser with a cookie jar ----------
class Browser {
  jar = new Map();
  async go(url, init = {}) {
    const headers = { ...(init.headers ?? {}), cookie: [...this.jar].map(([k, v]) => `${k}=${v}`).join('; ') };
    const res = await fetch(url, { ...init, headers, redirect: 'manual' });
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(';');
      const i = pair.indexOf('=');
      this.jar.set(pair.slice(0, i).trim(), pair.slice(i + 1));
    }
    return res;
  }
  // Follows redirects from the authorization URL through Keycloak login and the consent page until the
  // platform redirects to the client's loopback callback. Returns that callback URL.
  async authorize(authUrl, { username, password, decision = 'approve', callbackPrefix, log }) {
    let url = authUrl;
    let res = await this.go(url);
    for (let i = 0; i < 20; i++) {
      if (res.status >= 300 && res.status < 400) {
        url = new URL(res.headers.get('location'), url).href;
        if (url.startsWith(callbackPrefix)) return url;
        res = await this.go(url);
        continue;
      }
      const html = await res.text();
      if (html.includes('kc-form-login')) {
        const kcError = /id="input-error[^"]*"[^>]*>([\s\S]*?)<\/span>|class="[^"]*(?:kc-feedback-text|pf-v5-c-alert__title)[^"]*"[^>]*>([\s\S]*?)<\//.exec(html);
        if (url.includes('login-actions/authenticate') && kcError) {
          const msg = (kcError[1] ?? kcError[2]).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          throw new Error(`Keycloak показал на форме входа: «${msg}»`);
        }
        const form = /<form[^>]*id="kc-form-login"[^>]*>/s.exec(html)[0];
        const action = /action="([^"]+)"/.exec(form)[1].replaceAll('&amp;', '&');
        log?.('  браузер: форма входа Keycloak, отправляю логин и пароль');
        res = await this.go(action, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ username, password, credentialId: '' }) });
        url = action;
        continue;
      }
      const tx = /name="tx" value="([^"]+)"/.exec(html);
      if (tx) {
        const h1 = /<h1>(.*?)<\/h1>/s.exec(html)?.[1];
        log?.(`  браузер: страница согласия «${h1}», нажимаю ${decision}`);
        findings.consentTitle ??= h1;
        res = await this.go(new URL('/consent', url).href, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ tx: tx[1], decision }) });
        continue;
      }
      throw new Error(`неожиданная страница ${res.status} ${url}: ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300)}`);
    }
    throw new Error('слишком много переходов');
  }
}

// ---------- an MCP OAuth client the way OpenCode wires it ----------
function makeProvider(mode, { callbackPort }) {
  const redirectUrl = `http://127.0.0.1:${callbackPort}/callback`;
  const store = { tokens: undefined, client: undefined, verifier: undefined, authUrl: undefined, state: undefined };
  if (mode === 'static') store.client = { client_id: 'spec48-opencode' };
  return {
    store,
    callbackPrefix: `http://127.0.0.1:${callbackPort}/callback`,
    ...(mode === 'cimd' ? { clientMetadataUrl: OPENCODE_CIMD } : {}),
    get redirectUrl() { return redirectUrl; },
    get clientMetadata() {
      return { client_name: `selftest-${mode}`, redirect_uris: [redirectUrl], grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'], token_endpoint_auth_method: 'none' };
    },
    state: () => (store.state = randomBytes(16).toString('hex')),
    clientInformation: () => store.client,
    saveClientInformation: (c) => { store.client = c; },
    tokens: () => store.tokens,
    saveTokens: (t) => { store.tokens = t; },
    redirectToAuthorization: (u) => { store.authUrl = u; },
    saveCodeVerifier: (v) => { store.verifier = v; },
    codeVerifier: () => store.verifier,
    saveDiscoveryState: (s) => { store.discovery = s; },
    discoveryState: () => store.discovery,
  };
}

async function connect({ base, mode, browser, username, password, callbackPort = 53100 + Math.floor(Math.random() * 800) }) {
  const serverUrl = `${base}/mcp`;
  const provider = makeProvider(mode, { callbackPort });
  const first = await auth(provider, { serverUrl });
  if (first !== 'REDIRECT') throw new Error(`ожидался REDIRECT, получено ${first}`);
  const authUrl = new URL(provider.store.authUrl);
  const callback = new URL(await browser.authorize(authUrl.href, { username, password, callbackPrefix: provider.callbackPrefix, log: console.log }));
  if (callback.searchParams.get('state') !== provider.store.state) throw new Error('state не совпал');
  if (callback.searchParams.get('error')) throw new Error(`callback с ошибкой ${callback.searchParams.get('error')}`);
  const second = await auth(provider, { serverUrl, authorizationCode: callback.searchParams.get('code'), iss: callback.searchParams.get('iss') ?? undefined });
  if (second !== 'AUTHORIZED') throw new Error(`ожидался AUTHORIZED, получено ${second}`);
  const client = new Client({ name: `selftest-${mode}`, version: '0.0.1' });
  await client.connect(new StreamableHTTPClientTransport(new URL(serverUrl), { authProvider: provider }));
  return { provider, client, authUrl, callback, mode };
}

const text = (r) => r.content?.[0]?.text ?? '';
async function listProjects(c) { return JSON.parse(text(await c.client.callTool({ name: 'list_projects', arguments: {} }))); }

async function rawMcp(base, accessToken) {
  const res = await fetch(`${base}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'raw', version: '0' } } }),
  });
  return { status: res.status, wwwAuthenticate: res.headers.get('www-authenticate'), body: await res.text() };
}
async function rawRefresh(base, c) {
  const res = await fetch(`${base}/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: c.provider.store.tokens.refresh_token, client_id: c.provider.store.client.client_id, resource: `${base}/mcp` }),
  });
  const body = await res.json();
  if (res.ok) c.provider.store.tokens = { ...c.provider.store.tokens, ...body };
  return { status: res.status, body };
}

// ---------- Keycloak admin API (test-only bootstrap admin) ----------
async function kcAdmin(method, path, body) {
  const t = await (await fetch(`${KC}/realms/master/protocol/openid-connect/token`, { method: 'POST', body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: 'admin', password: 'admin' }) })).json();
  const res = await fetch(`${KC}/admin/realms/spec48${path}`, { method, headers: { authorization: `Bearer ${t.access_token}`, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`admin ${method} ${path}: ${res.status} ${await res.text()}`);
  return res.status === 204 || res.status === 201 ? res.headers.get('location') : res.json();
}
const userId = async (username) => (await kcAdmin('GET', `/users?username=${username}&exact=true`))[0]?.id;
const setEnabled = async (username, enabled) => kcAdmin('PUT', `/users/${await userId(username)}`, { enabled });
const compose = (...args) => execFileSync('docker', ['compose', '-p', 'proto-spec48-mcp', ...args], { cwd: HERE, stdio: 'pipe' }).toString();

async function waitForKeycloak() {
  for (let i = 0; i < 90; i++) {
    try { if ((await fetch(`${KC}/realms/spec48/.well-known/openid-configuration`)).ok) return; } catch {}
    await sleep(2000);
  }
  throw new Error('Keycloak не поднялся на 127.0.0.1:18480; запустите docker compose -p proto-spec48-mcp up -d');
}

// ======================================================================
async function main() {
  await waitForKeycloak();
  await setEnabled('anna', true).catch(() => {});
  const cfg = configFromEnv({ ...process.env, PORT: '18482', ACCESS_TTL_SEC: '5', IDLE_TTL_SEC: '600', QUIET: process.env.VERBOSE ? '0' : '1' });
  const platform = await start(cfg);
  const base = cfg.base;
  const conn = (c) => platform.state.connections.get([...platform.state.connections.values()].find((x) => x.clientId === c.provider.store.client.client_id && x.email === c.email && x.createdMs >= c.since)?.id);
  try {
    section('Обнаружение (RFC 9728, RFC 8414)');
    const unauth = await rawMcp(base);
    check(1, '/mcp без токена отвечает 401 с resource_metadata', unauth.status === 401 && /resource_metadata="[^"]+oauth-protected-resource\/mcp"/.test(unauth.wwwAuthenticate ?? ''), `WWW-Authenticate: ${unauth.wwwAuthenticate}`);
    const prm = await (await fetch(`${base}/.well-known/oauth-protected-resource/mcp`)).json();
    const asm = await (await fetch(`${base}/.well-known/oauth-authorization-server`)).json();
    check(1, 'PRM называет платформу сервером авторизации', prm.authorization_servers?.[0] === base, JSON.stringify(prm));
    check(1, 'AS metadata: S256, CIMD, registration, none', asm.code_challenge_methods_supported?.join() === 'S256' && asm.client_id_metadata_document_supported === true && !!asm.registration_endpoint);

    section('Три способа регистрации клиента, сотрудник anna');
    const anna = new Browser();
    const since = Date.now();
    const paths = {};
    for (const mode of ['static', 'cimd', 'dcr']) {
      try {
        const c = await connect({ base, mode, browser: anna, username: 'anna', password: 'anna-pass' });
        c.email = 'anna@example.test'; c.since = since;
        const lp = await listProjects(c);
        const proto = c.client.getNegotiatedProtocolVersion?.();
        const regEvent = platform.state.events.filter((e) => e.type === 'authorize.start').at(-1);
        paths[mode] = c;
        check(1, `путь ${mode}: подключение, согласие, list_projects`, lp.projects.map((p) => p.id).join() === 'alpha,beta' && regEvent.registration === mode,
          `сервер записал registration=${regEvent.registration}, client_id=${regEvent.client_id}; redirect_uri=${regEvent.redirect_uri}; resource=${regEvent.resource}; протокол=${proto}; iss в callback=${c.callback.searchParams.get('iss')}`);
        if (mode === 'static') {
          check(2, 'согласован протокол 2025-11-25 (initialize, legacy)', proto === '2025-11-25', `client.getNegotiatedProtocolVersion() = ${proto}, эпоха ${c.client.getProtocolEra?.()}`);
          const ctx = JSON.parse(text(await c.client.callTool({ name: 'get_project_context', arguments: { project_id: 'alpha' } })));
          const foreign = await c.client.callTool({ name: 'get_project_context', arguments: { project_id: 'gamma' } });
          check(1, 'get_project_context: свой проект виден, чужой нет', ctx.project.id === 'alpha' && foreign.isError === true, text(foreign));
          const tools = (await c.client.listTools()).tools;
          check(1, 'только инструменты чтения', tools.every((t) => t.annotations?.readOnlyHint === true) && tools.length === 2, tools.map((t) => t.name).join(', '));
        }
      } catch (e) {
        check(1, `путь ${mode}`, false, e.stack);
      }
    }
    findings.registration = Object.keys(paths);

    section('Второй сотрудник boris');
    const borisBrowser = new Browser();
    const boris = await connect({ base, mode: 'static', browser: borisBrowser, username: 'boris', password: 'boris-pass' });
    boris.email = 'boris@example.test'; boris.since = since;
    check(1, 'boris видит только свой проект', (await listProjects(boris)).projects.map((p) => p.id).join() === 'gamma');

    section('Истечение access token и прозрачный refresh через SDK');
    const A1 = paths.static, A2 = paths.cimd, A3 = paths.dcr;
    const before = conn(A1).refreshes;
    await sleep(5500);
    const expired = await rawMcp(base, A1.provider.store.tokens.access_token);
    check(4, 'истёкший access token отклонён 401', expired.status === 401, expired.wwwAuthenticate);
    const lpAfter = await listProjects(A1);
    check(4, 'SDK сам обновил токен (refresh с проверкой Keycloak) и прочитал проекты', conn(A1).refreshes === before + 1 && lpAfter.projects.length === 2, `providerChecks: ${JSON.stringify(conn(A1).providerChecks.at(-1))}`);

    section('Отзыв одного подключения');
    const r1 = await rawRefresh(base, A1);
    const liveToken = A1.provider.store.tokens.access_token;
    const okBefore = await rawMcp(base, liveToken);
    await fetch(`${base}/connections/${conn(A1).id}/revoke`, { method: 'POST', redirect: 'manual' });
    const afterRevoke = await rawMcp(base, liveToken);
    check(3, 'неистёкший access token отозванного подключения получает 401', r1.status === 200 && okBefore.status === 200 && afterRevoke.status === 401, `до отзыва ${okBefore.status}, после ${afterRevoke.status}: ${afterRevoke.body}`);
    const refreshRevoked = await rawRefresh(base, A1);
    check(3, 'refresh отозванного подключения отклонён', refreshRevoked.status === 400 && refreshRevoked.body.error === 'invalid_grant', JSON.stringify(refreshRevoked.body));
    check(3, 'второе подключение anna (CIMD) продолжает работать', (await listProjects(A2)).projects.length === 2);
    check(3, 'третье подключение anna (DCR) продолжает работать', (await listProjects(A3)).projects.length === 2);

    section('Проверка провайдера: anna отключена в Keycloak');
    await setEnabled('anna', false);
    const tokenBeforeRefresh = A2.provider.store.tokens.access_token;
    const stillValid = await rawMcp(base, tokenBeforeRefresh);
    const disabledRefresh = await rawRefresh(base, A2);
    findings.kcDisabled = conn(A2).providerChecks.at(-1);
    check(4, 'до refresh старый access token ещё действует (окно не больше срока токена)', stillValid.status === 200);
    check(4, 'refresh после отключения пользователя отклонён', disabledRefresh.status === 400 && disabledRefresh.body.error === 'invalid_grant', `платформа: ${JSON.stringify(disabledRefresh.body)}\n       Keycloak: ${JSON.stringify(findings.kcDisabled?.keycloak)}`);
    const afterRefused = await rawMcp(base, tokenBeforeRefresh);
    check(4, 'после отказа провайдера и прежний access token отклонён (состояние подключения)', afterRefused.status === 401, afterRefused.body);
    const borisRefresh = await rawRefresh(base, boris);
    check(4, 'boris при этом обновляется', borisRefresh.status === 200);
    const newConsentWhileDisabled = await connect({ base, mode: 'static', browser: new Browser(), username: 'anna', password: 'anna-pass' }).then(() => 'подключилась', (e) => `отказ: ${e.message.slice(0, 160)}`);
    check(4, 'новое согласие отключённой anna невозможно', newConsentWhileDisabled.startsWith('отказ'), newConsentWhileDisabled);

    section('anna снова включена');
    await setEnabled('anna', true);
    const a3After = await rawRefresh(base, A3);
    findings.kcReenabledOldConn = { platform: a3After, keycloak: conn(A3).providerChecks.at(-1) };
    console.log(`  наблюдение: refresh старого DCR-подключения после выключения и включения: ${a3After.status} ${JSON.stringify(a3After.body.error ? a3After.body : 'ok')}; Keycloak ${JSON.stringify(findings.kcReenabledOldConn.keycloak)}`);
    const A4 = await connect({ base, mode: 'static', browser: new Browser(), username: 'anna', password: 'anna-pass' });
    check(4, 'новое согласие после включения работает', (await listProjects(A4)).projects.length === 2);
    A4.email = 'anna@example.test'; A4.since = Date.now() - 1000;
    check(4, 'отказанное подключение не ожило', conn(A2).state === 'provider_refused', conn(A2).state);

    section('Проверка провайдера: временный пользователь vera удалён');
    await kcAdmin('POST', '/users', { username: 'vera', email: 'vera@example.test', emailVerified: true, firstName: 'Вера', lastName: 'Временная', enabled: true, credentials: [{ type: 'password', value: 'vera-pass', temporary: false }] });
    try {
      const V = await connect({ base, mode: 'static', browser: new Browser(), username: 'vera', password: 'vera-pass' });
      V.email = 'vera@example.test'; V.since = since;
      await kcAdmin('DELETE', `/users/${await userId('vera')}`);
      const deletedRefresh = await rawRefresh(base, V);
      findings.kcDeleted = conn(V).providerChecks.at(-1);
      check(4, 'refresh после удаления пользователя отклонён', deletedRefresh.status === 400, `платформа: ${JSON.stringify(deletedRefresh.body)}\n       Keycloak: ${JSON.stringify(findings.kcDeleted?.keycloak)}`);
    } finally {
      const id = await userId('vera').catch(() => undefined);
      if (id) await kcAdmin('DELETE', `/users/${id}`);
    }

    section('Keycloak недоступен: fail closed');
    compose('pause', 'keycloak');
    let down;
    const t0 = Date.now();
    try { down = await rawRefresh(base, boris); } finally { compose('unpause', 'keycloak'); }
    findings.kcUnreachable = { platform: down, elapsedMs: Date.now() - t0, check: conn(boris).providerChecks.at(-1) };
    check(4, 'refresh при недоступном Keycloak отклонён отличимой ошибкой', down.status === 503 && down.body.error === 'temporarily_unavailable', `${down.status} ${JSON.stringify(down.body)} за ${findings.kcUnreachable.elapsedMs} мс; причина: ${findings.kcUnreachable.check.detail}`);
    check(4, 'подключение при этом осталось активным', conn(boris).state === 'active');
    await sleep(500);
    const back = await rawRefresh(base, boris);
    check(4, 'после возврата Keycloak refresh снова работает', back.status === 200, JSON.stringify(back.body.error ? back.body : 'ok'));

    section('Истечение по неактивности');
    const N = 600_000;
    check(5, 'граница: now = lastUsed + N - 1 ещё действует', isIdleExpired(0, N - 1, N) === false);
    check(5, 'граница: now = lastUsed + N уже истекло', isIdleExpired(0, N, N) === true);
    platform.cfg.idleTtlSec = 2;
    const fresh = await rawRefresh(base, boris);
    const usedNow = await rawMcp(base, boris.provider.store.tokens.access_token);
    await sleep(2100);
    const idle = await rawMcp(base, boris.provider.store.tokens.access_token);
    const idleRefresh = await rawRefresh(base, boris);
    check(5, 'после N простоя неистёкший access token отклонён', fresh.status === 200 && usedNow.status === 200 && idle.status === 401, idle.body);
    check(5, 'и refresh тоже', idleRefresh.status === 400, JSON.stringify(idleRefresh.body));
    check(5, 'состояние подключения expired', conn(boris).state === 'expired');
    platform.cfg.idleTtlSec = 600;

    section('Состояние платформы в конце');
    for (const c of platform.publicState().connections) console.log(`  ${c.id} ${c.email} ${c.registration} ${c.state}${c.reason ? ` (${c.reason})` : ''} запросов=${c.requests} refresh=${c.refreshes}`);
  } finally {
    await setEnabled('anna', true).catch(() => {});
    await platform.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== Итог: ${results.length - failed.length} из ${results.length} проверок прошли`);
  for (const q of [1, 2, 3, 4, 5]) {
    const rs = results.filter((r) => r.question === q);
    console.log(`  Q${q}: ${rs.filter((r) => r.ok).length}/${rs.length}`);
  }
  console.log(`  пути регистрации, прошедшие через SDK: ${findings.registration.join(', ')}`);
  console.log(`  заголовок согласия: ${findings.consentTitle}`);
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
