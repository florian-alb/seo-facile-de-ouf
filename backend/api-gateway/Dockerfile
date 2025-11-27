FROM node:22-alpine

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .

ENV GENERATIONS_API_URL=http://generations-api:5002
ENV USERS_API_URL=http://users-api:5001
ENV MONGO_EXPRESS_URL=http://mongo-express:8081

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]