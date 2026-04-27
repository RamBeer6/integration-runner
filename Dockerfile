FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

ENTRYPOINT ["node", "src/index.js"]
CMD ["--input", "sample-data/orders.csv"]
