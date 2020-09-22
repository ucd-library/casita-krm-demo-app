FROM node:12

RUN mkdir app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install --production

COPY controllers controllers
COPY lib lib
COPY server.js .

COPY client/dist client/dist
COPY client/public/package.json client/public/package.json

CMD node server.js