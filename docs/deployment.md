# EasyAI Deployment Notes

This document describes the deployment and packaging paths that are real today. It intentionally avoids claiming desktop-equivalent parity for web and Docker where the implementation still degrades.

## Supported Delivery Shapes

| Shape | Best use | Command |
| --- | --- | --- |
| Desktop dev | Full local development | `pnpm dev` |
| Desktop package | End-user desktop validation / release | `pnpm package` |
| Local web launcher | Local browser-based runtime without Electron shell | `pnpm build && pnpm web:start` |
| npm package | Publishable local launcher | `easyai start` |
| Docker image | Build validation and packaging of the standalone web payload | `docker build -t easyai:local .` |

## Local Web Launcher

Build first, then start:

```bash
pnpm install
pnpm build
pnpm web:start
```

Useful environment variables:

```bash
EASYAI_DATA_DIR=/path/to/data
EASYAI_API_PORT=4318
EASYAI_API_HOST=127.0.0.1
```

Notes:

- data defaults to `~/.easyai`
- renderer static assets are served from `apps/renderer/dist`
- API and UI are hosted by the same Fastify process

## npm Launcher

The published package exposes the same standalone runtime:

```bash
easyai doctor
easyai init
easyai start
```

Expected behavior:

- `doctor` verifies the packaged payload exists
- `init` prepares `EASYAI_DATA_DIR`
- `start` launches the same web runtime shape as `pnpm web:start`

## Docker Build

The root `Dockerfile` expects repository builds to already exist:

```bash
pnpm install
pnpm build
docker build -t easyai:local .
```

What the Docker build validates:

- root runtime manifest `package.docker.json`
- packaged CLI entrypoint `bin/easyai.mjs`
- built API / renderer / gateway / channel outputs
- production dependency closure for the standalone runtime

Recommended current wording for Docker support:

- "Docker image build is supported and CI-validated"
- "The image packages the current standalone web runtime"
- "External serving parity is not complete yet"

## Current Web/Docker Degradations

Compared with desktop:

- no Electron `safeStorage`
- no native file picker or Finder/Explorer reveal
- no Electron-managed gateway/keyring lifecycle
- server settings persist as local JSON files in `EASYAI_DATA_DIR`

Docker-specific caveat:

- the current API bootstrap still binds `127.0.0.1`
- because of that, `docker run -p 4318:4318 ...` should not yet be documented as fully equivalent to the local web launcher

## CI Expectations

The repository workflows should validate at least:

- monorepo build
- web runtime smoke on Linux
- desktop package validation on macOS and Windows
- Docker build of the root `Dockerfile`

If a future runtime mode is added, document its parity and degradation here before advertising it in the README.
