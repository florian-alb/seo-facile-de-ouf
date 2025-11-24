FROM node:22-alpine

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 5555
CMD ["node", "dist/index.js"]
