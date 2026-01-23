FROM node:20-alpine
 
WORKDIR /app
 
# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./
 
# Installer pnpm et les dépendances
RUN npm install -g pnpm && pnpm install --frozen-lockfile
 
# Copier le code source
COPY . .
 
# Lancer le worker
CMD ["pnpm", "start"]