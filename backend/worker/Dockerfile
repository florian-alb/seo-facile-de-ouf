FROM node:20-alpine
 
WORKDIR /app
 
# Copier les fichiers de dépendances
# NOTE: ce service n'a pas de pnpm-lock.yaml dédié, on copie uniquement package.json
COPY package.json ./
 
# Installer pnpm et les dépendances
# Pas de lockfile local, on installe sans contrainte de gel
RUN npm install -g pnpm && pnpm install
 
# Copier le code source
COPY . .
 
# Lancer le worker
CMD ["pnpm", "start"]