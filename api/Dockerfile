FROM node:10.16.3-alpine AS builder

COPY package*.json ./

# install node packages for production
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install
# Run build
COPY . ./
RUN npm run build

# Development
FROM node:10.16.3-alpine AS dev
RUN apk add --no-cache bash
WORKDIR /usr/src/app
COPY --from=builder node_modules ./node_modules
COPY . /usr/src/app
EXPOSE 4000
CMD ["npm", "run", "dev"]


# Production image.
FROM node:10.16.3-alpine AS prod
WORKDIR /usr/src/app
COPY --from=builder prod_node_modules ./node_modules
COPY --from=builder dist ./dist
COPY package*.json /usr/src/app/
EXPOSE 4000
CMD ["npm", "run", "start"]