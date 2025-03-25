FROM node:22-alpine AS builder

WORKDIR /build
COPY ./package.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app

# Sources compilés
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./

COPY src/assets/ ./dist/src/assets

CMD ["node", "./dist/src/index.js"]