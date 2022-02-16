FROM node:16

RUN npm install -g @angular/cli

WORKDIR /usr/app

COPY entrypoint.sh /
ENTRYPOINT [ "/entrypoint.sh" ]
