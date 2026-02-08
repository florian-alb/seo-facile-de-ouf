FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /src

# Copier les fichiers workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copier shared
COPY shared ./shared

# Copier le frontend
COPY frontend ./frontend

# Installer les dépendances
RUN pnpm install --filter frontend...

WORKDIR /src/frontend

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
