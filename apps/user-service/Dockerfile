FROM node:22-alpine AS builder

WORKDIR /build
COPY ./package.json ./

RUN npm i --production

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
#COPY --from=builder /build/node_modules ./node_modules

#
COPY --from=builder /build/package.json ./

# Rebuild bcrypt due to missing natives libraries in alpine source image
RUN apk update &&  \
    apk upgrade --no-cache && \
    apk --no-cache add g++ gcc make python3 && \
    npm i && \
    npm rebuild bcrypt -build-from-source && \
    apk del make gcc g++ python3

CMD ["sh", "./start.sh"]