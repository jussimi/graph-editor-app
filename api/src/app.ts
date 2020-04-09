import express, { RequestHandler, ErrorRequestHandler } from 'express';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { queryWhiteListMap } from './queries';
import postgraphileServer from './postgraphileServer';

const isDev = process.env.NODE_ENV === 'development';
const { PORT, UI_PORT, SERVER_IP } = process.env;

// Configure cors.
// We don't wan't to allow requests from other origins than these.
const corsWhitelist = [
  `http://${SERVER_IP}:${UI_PORT}`, // The public ip of the UI.
  `http://ui:${UI_PORT}`, // Docker-service
];
if (isDev) {
  corsWhitelist.push(`http://localhost:${UI_PORT}`); // Localhost
  corsWhitelist.push(`http://${SERVER_IP}:${PORT}`); // Allow graphiql during development.
}
const corsOptions: CorsOptions = {
  origin(origin: string, callback): void {
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

// Create a rate limiter for requests.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes,
  max: 100,
});

const logger: RequestHandler = (req, _res, next) => {
  if (req.method !== 'OPTIONS') {
    console.log(`${req.method} ${req.path}`);
    // console.log(req.headers);
  }
  next();
};

const errorHandler: ErrorRequestHandler = (err: Error, _req, res, next) => {
  if (err.message.includes('query not allowed')) {
    res.status(400).send({ error: err.message });
  }
  if (err.message.includes('Not allowed by CORS')) {
    res.status(401).send({ error: err.message });
  }
  next();
};

const app = express();

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
  app.use(logger);
}

// Set middleware for the graphql route.
app.use('/graphql', [cors(corsOptions), limiter, graphqlInterceptor]);

app.use(postgraphileServer);

app.use(errorHandler);

export default app;
