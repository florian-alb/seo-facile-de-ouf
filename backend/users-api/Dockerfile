FROM node:20-bullseye-slim

WORKDIR /src

# Ensure system libraries required by Prisma are available (libssl1.1)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl libssl1.1 \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 5001
CMD ["node", "dist/index.js"]
