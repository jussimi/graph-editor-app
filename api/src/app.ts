import express from 'express';
import postgraphile from 'postgraphile';

const {
  PORT,
  DB_HOST,
  JWT_SECRET,
  DB_PORT,
  DB_NAME,
  GRAPH_EDITOR_USER,
  GRAPH_EDITOR_USER_PASS,
  GRAPH_EDITOR_SCHEMA
} = process.env;

const CONNECTION_STRING = `postgres://${GRAPH_EDITOR_USER}:${GRAPH_EDITOR_USER_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const app = express();

const postgraphileOptions = {
  jwtPgTypeIdentifier: `${GRAPH_EDITOR_SCHEMA}.auth_token`,
  jwtSecret: JWT_SECRET,
  graphqlRoute: '/graphql',
  subscriptions: true,
  watchPg: false,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  ignoreIndexes: true,
  showErrorStack: "json",
  extendedErrors: ["hint", "detail", "errcode"],
  // exportGqlSchemaPath: "schema.graphql",
  pgDefaultRole: 'graph_editor_anonymous',
  graphiql: true,
  enhanceGraphiql: true,
  allowExplain(req) {
    // TODO: customise condition!
    return true;
  },
  enableQueryBatching: true,
  legacyRelations: "omit",
  // pgSettings(req) {
  //   /* TODO */
  // },
};


app.use(
  postgraphile(
    CONNECTION_STRING,
    GRAPH_EDITOR_SCHEMA,
    postgraphileOptions as any,
  )
);

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
