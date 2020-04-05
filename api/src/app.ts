import express from 'express';
import cors from 'cors';
import postgraphile, { PostGraphileOptions } from 'postgraphile';

const { PORT, JWT_SECRET, GRAPH_EDITOR_SCHEMA } = process.env;

console.log(process.env.NODE_ENV);

const CONNECTION_STRING = process.env.GRAPHILE_DB_URL;
console.log(PORT);
console.log(CONNECTION_STRING);

const postgraphileOptions = {
  retryOnInitFail: true,
  jwtPgTypeIdentifier: `${GRAPH_EDITOR_SCHEMA}.auth_token`,
  jwtSecret: JWT_SECRET,
  graphqlRoute: '/graphql',
  subscriptions: true,
  watchPg: false,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  ignoreIndexes: true,
  showErrorStack: 'json',
  extendedErrors: ['hint', 'detail', 'errcode'],
  // exportGqlSchemaPath: "schema.graphql",
  pgDefaultRole: `${GRAPH_EDITOR_SCHEMA}_anonymous`,
  graphiql: true,
  enhanceGraphiql: true,
  // allowExplain(): boolean {
  //   // TODO: customise condition!
  //   return true;
  // },
  enableQueryBatching: true,
  legacyRelations: 'omit',
  enableCors: true,
  // pgSettings(req) {
  //   /* TODO */
  // },
};

/* eslint-disable */
const whitelist = ['http://0.0.0.0:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
/* eslint-enable */

const app = express();

const logger = (req: express.Request, _res: express.Response, next: Function): void => {
  if (req.method !== 'OPTIONS') console.log(`${req.method} ${req.path}`);
  next();
};

app.use(logger);

app.use(postgraphile(CONNECTION_STRING, GRAPH_EDITOR_SCHEMA, postgraphileOptions as PostGraphileOptions));

app.use(cors(corsOptions));

app.listen(PORT, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`
    -------------------------------
      server is listening on ${PORT}
    -------------------------------
  `);
});
