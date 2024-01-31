FROM node:18-alpine

WORKDIR /

COPY package*.json ./

COPY prisma ./prisma/

RUN npx pnpm i

COPY . .

RUN npx pnpm build

ENV PORT "8080"

EXPOSE ${PORT}

CMD [ "npx", "pnpm", "start:prod"]