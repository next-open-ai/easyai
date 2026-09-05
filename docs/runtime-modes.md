# EasyAI Runtime Modes

EasyAI currently ships in four practical runtime shapes:

1. `desktop` via Electron
2. `web launcher` from this repository
3. `npm` package / CLI (`easyai`)
4. `Docker` image from the repository root `Dockerfile`

This page describes what is actually supported today, what is shared, and where behavior degrades outside the desktop shell.

## Capability Matrix

| Runtime | Entry | What it starts | Current status |
| --- | --- | --- | --- |
| Desktop | `pnpm dev` / packaged app | Electron main + local API + gateway + renderer | Full experience |
| Web launcher | `pnpm build && pnpm web:start` | Local API + built renderer static hosting | Supported with degraded desktop-native features |
| npm CLI | `npx easyai` / `easyai start` | Same as web launcher, using the published package payload | Supported with the same degradations as web launcher |
| Docker | `docker build` + `docker run` | Published web runtime layout inside a container | Build-validated; runtime parity is partial |

## Shared Core

All four modes share the same major non-UI layers:

- `apps/api` serves the HTTP/SSE APIs and `/api/orch/**`
- `packages/orchestrator` owns session/project state machines
- `packages/agent-core` remains the only model-execution layer
- `apps/renderer` is the UI for desktop and web launcher
- `apps/gateway` is reusable, but only the desktop shell auto-manages its lifecycle with native secret handoff

The intention is "same orchestration core, different shell capabilities".

## Desktop

Desktop is still the reference runtime.

Available here and not fully matched elsewhere:

- Electron IPC bridge
- `safeStorage`-backed model/search/channel secret handling
- Native file/directory pickers
- "Reveal in Finder/Explorer" and best-effort local open flows
- Desktop-managed gateway lifecycle and credential handoff

When documentation says "full EasyAI", it refers to this mode.

## Web Launcher

The repository web launcher is started by:

```bash
pnpm build
pnpm web:start
```

or directly:

```bash
node scripts/start-web.mjs
```

What it does:

- starts `apps/api/dist/main.cjs`
- serves `apps/renderer/dist` from the same Fastify process
- persists data under `EASYAI_DATA_DIR` or `~/.easyai`

Current degradations versus desktop:

- no Electron IPC bridge
- no `safeStorage`; server settings are written under `EASYAI_DATA_DIR` JSON files
- no native directory picker; managed project workspaces are created server-side
- asset/project file actions fall back to browser open/download instead of OS reveal
- channel/gateway settings are handled by server routes and local files rather than desktop keyring plumbing

What still works well:

- built renderer UI
- API health and REST/SSE endpoints
- orchestration project flows
- server-backed settings for models, search, MCP, knowledge bases, skills, and policies

## npm Package / CLI

The published package exposes `easyai`:

```bash
easyai doctor
easyai init
easyai start
```

`easyai start` is intentionally the same runtime shape as the repository web launcher. That means:

- it is suitable for a local single-user launcher
- it does **not** magically become a desktop build
- all web-launcher degradations also apply here

`easyai doctor` is the quickest way to confirm the packaged API build and renderer build are present.

## Docker

The root `Dockerfile` packages the current web runtime payload:

- `bin/easyai.mjs`
- built `apps/api/dist`
- built `apps/renderer/dist`
- built `apps/gateway/dist`
- built `packages/channel/dist`
- `package.docker.json` production manifest

Today, Docker support should be interpreted as:

- the image is a valid build target and is CI-checked
- the image contains the same web runtime payload as the npm launcher path
- it is useful for packaging and build validation of the standalone runtime

Current Docker/runtime gap:

- `apps/api/src/main.ts` still listens on `127.0.0.1`
- the Dockerfile sets `EASYAI_API_HOST=0.0.0.0`, but the current API bootstrap does not consume that host value
- therefore container port publishing is **not yet equivalent** to the local web launcher experience

So for now, Docker should be documented as "build-supported, runtime partially degraded" rather than "fully deployable web server parity".

## Smoke Coverage

The current lightweight smoke target for web-compatible runtime behavior is:

- start the built API in headless mode with `EASYAI_WEB_STATIC_DIR=apps/renderer/dist`
- verify `/api/health` and `/`
- run `scripts/headless-gateway-smoke.mjs`

There is currently no separate "agentscope runtime" in this repository, so CI should not invent one.
