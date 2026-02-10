FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /src

# Copier les fichiers workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copier shared
COPY shared ./shared
COPY backend/shared ./backend/shared

# Copier le service
COPY backend/shop-api ./backend/shop-api

# Installer les dépendances
RUN pnpm install --filter shop-api...

WORKDIR /src/backend/shop-api

# Prisma
RUN pnpm prisma generate

EXPOSE 5003

CMD ["pnpm", "run", "dev"]
