FROM node:17

RUN npm install -g typescript
RUN npm install nodemon -g

WORKDIR /usr/app

COPY entrypoint.sh /
ENTRYPOINT [ "/entrypoint.sh" ]
