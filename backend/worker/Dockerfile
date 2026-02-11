FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /src

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY backend/shared ./backend/shared
COPY backend/worker ./backend/worker

RUN pnpm install --filter worker...

WORKDIR /src/backend/worker

CMD ["pnpm", "run", "dev"]
