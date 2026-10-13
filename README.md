# market-agri-catalog-portal

Portal of the **catalog** domain of the **Marketplace Agrícola Huila** web interface: React 19,
TypeScript (strict) and Vite, a Module Federation **remote** of `market-agri-front` (Annex H,
ADR-021). UI of the products: browse and detail (anyone), publish, edit and delete (PRODUCER). Sub-tasks: HU-PLAT-008 (structure), HU-CAT-001…003, 005, 006.

The container mounts `./App` under `/catalogo/*`. Its HTTP client, session and design system
(`shell/apiClient`, `shell/session`, `shell/useSession`, `shell/RequireAuth`, `shell/ui`) are the
only ones the portal uses, never its own; `src/shell.d.ts` declares each one when a page starts
using it (today `shell/apiClient` and `shell/ui`). Styles only through `var(--…)` (`12-ux-ui/design-system.md`).

```
src/App.tsx            routes of the portal (./App) with its own 404; src/catalog/pages, model, api, components
src/shell.d.ts         types of what the container exposes · config/federation.ts: remote name, ./App, singletons
test/                  unit (rules, federation), component (doubles of shell/*), docker (image)
deploy/                Dockerfile (npm ci) and nginx.conf (remoteEntry never cached)
```

```bash
npm ci && npm run test:unit && npm run test:component && npm run build
npm run dev                  # serves remoteEntry.js on :5175; open it inside the container:
                             # http://localhost:5173/catalogo (alone, :5175 is a blank page by design)
bash test/docker/image.sh    # the image builds and never carries node_modules, dist or .env
```

Branches: `develop` ← `feat/…`, `fix/…`, `chore/…`; `qa` ← `qa-<SUBTASK-ID>` (ADR-027); `main` ←
release and `hotfix/…`. Rules: `market-agri-docs/00-governance/git-conventions.md`.
