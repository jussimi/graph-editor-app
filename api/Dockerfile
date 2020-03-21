FROM node:10.16.3-alpine

RUN apk add --no-cache bash
RUN apk add nano

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/

RUN npm install

COPY . /usr/src/app

EXPOSE 3000
CMD ["npm", "run", "dev"]