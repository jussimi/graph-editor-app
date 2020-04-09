import postgraphile, { PostGraphileOptions } from 'postgraphile';

const { JWT_SECRET, GRAPH_EDITOR_SCHEMA } = process.env;
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
  disableQueryLog: process.env.NODE_ENV !== 'development',
  enableQueryBatching: true,
  legacyRelations: 'omit',
  enableCors: true,
  // pgSettings(req) {
  //   /* TODO */
  // },
};

export default postgraphile(CONNECTION_STRING, GRAPH_EDITOR_SCHEMA, postgraphileOptions as PostGraphileOptions);
