import express, { RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import postgraphile, { PostGraphileOptions } from 'postgraphile';
import { queryWhiteListMap } from './queries';

const isDev = process.env.NODE_ENV === 'development';
const { PORT, JWT_SECRET, GRAPH_EDITOR_SCHEMA, UI_PORT, SERVER_IP } = process.env;
const CONNECTION_STRING = process.env.GRAPHILE_DB_URL;

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

// Configure cors.
// We don't wan't to allow requests from other origins than these.
type CorsCallback = (err: Error | null, allow?: boolean) => void;
const corsWhitelist = [
  `http://${SERVER_IP}:${UI_PORT}`, // The public ip of the UI.
  `http://ui:${UI_PORT}`, // Docker-service
];
if (isDev) {
  corsWhitelist.push(`http://localhost:${UI_PORT}`); // Localhost
  corsWhitelist.push(`http://${SERVER_IP}:${PORT}`); // Allow graphiql during development.
}
const corsOptions = {
  origin(origin: string, callback: CorsCallback): void {
    if (corsWhitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Intercepts incoming requests and set the query to match the one from the whitelist.
const graphqlInterceptor: RequestHandler = (req, _res, next) => {
  const { referer = '', origin } = req.headers;
  const isAcceptedGraphiql = referer.includes(`${PORT}/graphiql`) || origin.includes(`${SERVER_IP}:${PORT}`);
  if (isDev && isAcceptedGraphiql) {
    // Allow requests from /graphiql when on development.
    console.log('Allow graphiql in development!');
  } else {
    const queryFromWhitelist = queryWhiteListMap[req.body?.query || ''];
    if (queryFromWhitelist) {
      req.body.query = queryFromWhitelist;
    } else {
      return next(new Error('query not allowed'));
    }
  }
  next();
};

const logger: RequestHandler = (req, _res, next) => {
  if (req.method !== 'OPTIONS') console.log(`${req.method} ${req.path}`);
  next();
};

const app = express();

app.use(bodyParser.json());

app.use(logger);

// Set middleware for the graphql route.
app.use('/graphql', [cors(corsOptions), graphqlInterceptor]);

app.use(postgraphile(CONNECTION_STRING, GRAPH_EDITOR_SCHEMA, postgraphileOptions as PostGraphileOptions));

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
