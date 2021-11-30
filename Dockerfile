
FROM node:17.1.0

COPY . /src-wrs-bot
WORKDIR /src-wrs-bot
CMD [ "npm", "start" ]
