FROM node:22-alpine AS builder

# Copie des fichiers package dans /build
WORKDIR /build
COPY ./package*.json ./

# Téléchargement des dépendances
RUN npm i

# Copie du répertoire source dans le workdir
COPY . .

# Build du projet
RUN npm run build

# Image finale
FROM node:22-alpine

# Copie des sources finales
WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package*.json ./

COPY scripts/start.sh ./start.sh

# Exposition du port 3000 à l'extérieur du conteneur
ENV PORT=3000
EXPOSE 3000

# Commande de lancement du conteneur
CMD ["sh", "./start.sh"]