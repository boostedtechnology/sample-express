FROM node:20-alpine

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node package*.json ./

RUN npm i

COPY --chown=node . ./
RUN npm run build

CMD ["npm", "run", "serve"]