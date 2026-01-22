FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /src

# Copier les fichiers workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copier shared
COPY shared ./shared

# Copier le service
COPY backend/users-api ./backend/users-api

# Installer les dépendances
RUN pnpm install --filter public-api...

WORKDIR /src/backend/users-api

# Prisma
RUN pnpm prisma generate

EXPOSE 5001

CMD ["pnpm", "run", "dev"]
