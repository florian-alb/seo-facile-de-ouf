FROM node:22-alpine

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]