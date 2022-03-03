FROM node:17

RUN npm install -g typescript
RUN npm install nodemon -g
RUN npm install -g ts-node

WORKDIR /usr/app

COPY entrypoint.sh /
ENTRYPOINT [ "/entrypoint.sh" ]
