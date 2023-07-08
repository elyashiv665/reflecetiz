FROM node:latest
RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY ./package.json /usr/src/
COPY ./updateData.js /usr/src/
COPY ../mongo/models.js /usr/src/mongo/
RUN npm install
CMD ["node", "updateData.js"]