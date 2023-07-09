FROM node:latest
RUN mkdir -p /usr/src/domains
WORKDIR /usr/src/domains
COPY ./package.json /usr/src/domains/
COPY ./server.js /usr/src/domains/
COPY ./mongo/models.js /usr/src/domains/mongo/
RUN npm install
CMD ["node", "server.js"]