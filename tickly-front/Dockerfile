FROM node:22-alpine
LABEL authors="ewenb"

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

ENTRYPOINT ["npm", "run", "dev"]