FROM node:22-alpine AS builder

WORKDIR /build
COPY ./package.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app
# Script de lancement du service
COPY scripts/start.sh ./start.sh

# Schema de migration
COPY src/db/schema.ts ./src/db/

# Configuration pour la migration
COPY drizzle.config.ts ./drizzle.config.ts

# Sources compilés
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./

CMD ["sh", "./start.sh"]