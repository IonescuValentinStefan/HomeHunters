FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --verbose

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
