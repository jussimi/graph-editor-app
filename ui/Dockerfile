FROM node:10.16.3-alpine AS base
COPY package*.json ./
# install node packages for production
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install

# Development image
FROM node:10.16.3-alpine AS dev
RUN apk add --no-cache bash
WORKDIR /usr/src/app
COPY --from=base node_modules ./node_modules
COPY . /usr/src/app
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build image
FROM node:10.16.3-alpine AS build
WORKDIR /usr/src/app
COPY --from=base node_modules ./node_modules
COPY . /usr/src/app
RUN npm run build

# Production image
FROM node:10.16.3-alpine AS prod
WORKDIR /usr/src/app
COPY --from=base prod_node_modules ./node_modules
COPY --from=build /usr/src/app/.nuxt .nuxt
COPY package*.json /usr/src/app/
COPY static /usr/src/app/static
COPY assets /usr/src/app/assets
EXPOSE 3000
CMD ["npm", "run", "start"]
