FROM node:22-alpine AS builder

WORKDIR /build
COPY ./package*.json ./

RUN npm ci --production

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package*.json ./

CMD ["node", "./dist/index.js"]