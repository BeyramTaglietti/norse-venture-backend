FROM node:18-alpine

WORKDIR /

COPY package*.json ./

COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

ENV PORT "8080"

EXPOSE ${PORT}

CMD [ "npm", "run", "start:prod"]