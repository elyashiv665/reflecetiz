FROM node:latest
RUN mkdir -p /usr/src/domains
WORKDIR /usr/src/domains
COPY ./package.json /usr/src/domains/
COPY ./server/server.js /usr/src/domains/
COPY ./server/mongo/models.js /usr/src/domains/mongo/
RUN npm install
CMD ["node", "server.js"]