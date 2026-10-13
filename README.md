# market-agri-catalog-portal

Portal of the **catalog** domain of the **Marketplace Agrícola Huila** web interface: React 19,
TypeScript (strict) and Vite, a Module Federation **remote** of `market-agri-front` (Annex H,
ADR-021). UI of the products: browse and detail (anyone), publish, edit and delete (PRODUCER). Sub-tasks: HU-PLAT-008 (structure), HU-CAT-001…003, 005, 006.

The container mounts `./App` under `/catalogo/*`. The portal takes `shell/apiClient`,
`shell/session`, `shell/useSession`, `shell/RequireAuth` and `shell/ui` from it and never builds
its own HTTP client, session or styles (only `var(--…)`, `12-ux-ui/design-system.md`).

```
src/App.tsx            routes of the portal (./App) with its own 404; src/catalog/pages, model, api, components
src/shell.d.ts         types of what the container exposes · config/federation.ts: remote name, ./App, singletons
test/                  unit (rules, federation), component (doubles of shell/*), docker (image)
deploy/                Dockerfile (npm ci) and nginx.conf (remoteEntry never cached)
```

```bash
npm ci && npm run test:unit && npm run test:component && npm run build
npm run dev                  # :5175, opened inside the container: http://localhost:5173/catalogo
bash test/docker/image.sh    # the image builds and never carries node_modules, dist or .env
```

Branches: `develop` ← `feat/…`, `fix/…`, `chore/…`; `qa` ← `qa-<SUBTASK-ID>` (ADR-027); `main` ←
release and `hotfix/…`. Rules: `market-agri-docs/00-governance/git-conventions.md`.
