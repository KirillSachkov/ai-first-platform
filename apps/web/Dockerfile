# Development image for compose.yaml; build context is the repository root.
FROM node:26.13.0-alpine3.24 AS development

# Node 26 images no longer bundle Corepack; install the pnpm version pinned in package.json.
RUN npm install --global pnpm@12.16.1 && mkdir /pnpm /workspace && chown node:node /pnpm /workspace
USER node
WORKDIR /workspace

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node packages ./packages
COPY --chown=node:node apps/web/package.json ./apps/web/package.json
RUN --mount=type=cache,id=ai-first-platform-pnpm,target=/pnpm/store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile --filter @platform/web... --store-dir=/pnpm/store --package-import-method=copy

COPY --chown=node:node apps/web ./apps/web
CMD ["pnpm", "--filter", "@platform/web", "dev"]
