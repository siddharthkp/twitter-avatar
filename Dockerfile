FROM node:lts-alpine

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

ENV NODE_ENV=production
RUN yarn install --production

COPY . /app

CMD yarn start
