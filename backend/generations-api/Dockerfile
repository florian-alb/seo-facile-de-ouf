FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /src

# Copier les fichiers workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copier shared
COPY shared ./shared
COPY backend/shared ./backend/shared

# Copier le service
COPY backend/generations-api ./backend/generations-api

# Installer les dépendances
RUN pnpm install --filter private-api...

WORKDIR /src/backend/generations-api

EXPOSE 5002

CMD ["pnpm", "run", "dev"]
