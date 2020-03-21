import express from 'express';
import postgraphile from 'postgraphile';

const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const JWT_SECRET = 'my_super_secret_secret';
const DB_PORT = '5432';
const DB_NAME = 'testdb';
const DB_USER = 'graph_editor_postgraphile';
const DB_PASS = 'graph_editor_postgraphile_pass';
const DB_SCHEMA = 'graph_editor';

const CONNECTION_STRING = `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const app = express();

const postgraphileOptions = {
  jwtPgTypeIdentifier: `${DB_SCHEMA}.auth_token`,
  jwtSecret: JWT_SECRET,
  graphqlRoute: '/graphql',
  subscriptions: true,
  watchPg: false,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  ignoreIndexes: false,
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
    DB_SCHEMA,
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
