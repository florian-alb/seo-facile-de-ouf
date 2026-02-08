FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /src

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY backend/api-gateway ./backend/api-gateway

RUN pnpm install --filter api-gateway...

WORKDIR /src/backend/api-gateway

EXPOSE 4000

CMD ["pnpm", "run", "dev"]
