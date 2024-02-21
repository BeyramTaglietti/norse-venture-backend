FROM node:18-alpine

WORKDIR /

COPY package*.json ./

COPY prisma ./prisma/

RUN npm i -g pnpm

RUN pnpm i

COPY . .

RUN pnpm build

CMD ["pnpm", "start:prod"]