FROM node:20-bullseye-slim

WORKDIR /src

# Ensure system libraries required by Prisma are available (libssl1.1)
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# Set a placeholder DATABASE_URL for prisma generate during build
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npm install --legacy-peer-deps

COPY . .

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 5001

# Generate Prisma client, run migrations, and start the app
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/index.js"]
