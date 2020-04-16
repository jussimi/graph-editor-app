# Ui

A `Nuxt.js` (Vue.js framework) project. The app is written with typescript and uses some additional modules:
  - `Vuetify` is a component-library for Vue. https://vuetifyjs.com/en/
  - `nuxt-typed-vuex` is a typescript friendly add-on for Vuex. https://nuxt-typed-vuex.danielcroe.com/
  - `nuxt-property-decorator` is a typescript add-on for writing vue-components in a class style. https://www.npmjs.com/package/nuxt-property-decorator
  - `cookie-universal-nuxt` is a cookie helper. https://www.npmjs.com/package/cookie-universal-nuxt

A local installation of npm packages is not required, but useful since the `intellisense` features won't work properly without it.

## Run with docker
The docker-image uses multistage builds in order to create a smaller image for production. Look in [README.md](../README.md) for info on how to run different build targets and environments.

```bash
# build
docker-compose build ui

# run
docker-compose up ui
```

## Local Setup
```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

