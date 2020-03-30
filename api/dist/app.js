"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const postgraphile_1 = __importDefault(require("postgraphile"));
const { PORT, DB_HOST, JWT_SECRET, DB_PORT, DB_NAME, GRAPH_EDITOR_USER, GRAPH_EDITOR_USER_PASS, GRAPH_EDITOR_SCHEMA, } = process.env;
const CONNECTION_STRING = `postgres://${GRAPH_EDITOR_USER}:${GRAPH_EDITOR_USER_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
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
    showErrorStack: 'json',
    extendedErrors: ['hint', 'detail', 'errcode'],
    // exportGqlSchemaPath: "schema.graphql",
    pgDefaultRole: 'graph_editor_anonymous',
    graphiql: true,
    enhanceGraphiql: true,
    // allowExplain(): boolean {
    //   // TODO: customise condition!
    //   return true;
    // },
    enableQueryBatching: true,
    legacyRelations: 'omit',
    enableCors: true,
};
/* eslint-disable */
const whitelist = ['http://0.0.0.0:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};
/* eslint-enable */
const app = express_1.default();
const logger = (req, _res, next) => {
    if (req.method !== 'OPTIONS')
        console.log(`${req.method} ${req.path}`);
    next();
};
app.use(logger);
app.use(postgraphile_1.default(CONNECTION_STRING, GRAPH_EDITOR_SCHEMA, postgraphileOptions));
app.use(cors_1.default(corsOptions));
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
//# sourceMappingURL=app.js.map