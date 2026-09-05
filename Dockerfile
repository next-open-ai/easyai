FROM node:22-bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    EASYAI_DATA_DIR=/opt/easyai-data \
    EASYAI_API_HOST=0.0.0.0 \
    EASYAI_API_PORT=4318

WORKDIR /opt/easyai

COPY package.docker.json ./package.json
COPY README.md README.zh-CN.md ./
COPY bin ./bin
COPY scripts/lib ./scripts/lib
COPY apps/api/dist ./apps/api/dist
COPY apps/renderer/dist ./apps/renderer/dist
COPY apps/gateway/package.json ./apps/gateway/package.json
COPY apps/gateway/dist ./apps/gateway/dist
COPY packages/channel/package.json ./packages/channel/package.json
COPY packages/channel/dist ./packages/channel/dist

RUN npm install --omit=dev --no-audit --no-fund
RUN chmod +x bin/easyai.mjs
RUN mkdir -p /opt/easyai-data && EASYAI_DATA_DIR=/opt/easyai-data node bin/easyai.mjs init

EXPOSE 4318
VOLUME ["/opt/easyai-data"]

CMD ["node", "bin/easyai.mjs", "start"]
