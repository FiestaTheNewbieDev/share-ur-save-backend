FROM node:23 AS builder

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

FROM node:23 AS runner

WORKDIR /app

COPY package*.json .

RUN npm ci --production

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules/share-ur-save-common ./node_modules/share-ur-save-common

EXPOSE 3000

CMD ["node", "dist/main"]