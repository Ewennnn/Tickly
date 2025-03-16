FROM node:22-alpine AS builder

# Copie des fichiers package dans /build
WORKDIR /build
COPY ./package*.json ./

# Téléchargement des dépendances
RUN npm ci --production

#
COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package*.json ./

EXPOSE 3000

CMD ["node", "./dist/index.js"]