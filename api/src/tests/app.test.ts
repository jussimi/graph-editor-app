import { agent as request } from 'supertest';
import { RequestHandler } from 'express';
import app from '../app';
import postgraphileServer from '../postgraphileServer';
import { queryWhiteListMap } from '../queries';

const { SERVER_IP, UI_PORT } = process.env;
const uiHost = `http://${SERVER_IP}:${UI_PORT}`;

// Mock the postgraphile middleware, since it is probably well tested on its own.
//  - we can trust that it works as expected.
jest.mock('../postgraphileServer', () => {
  const mockedPostgraphile: RequestHandler = (_req, res, next) => {
    res.send(JSON.stringify({ data: {} }));
    next();
  };
  return jest.fn(mockedPostgraphile);
});

describe('Test /graphql route errors.', () => {
  it('It should fail when request origin is not whitelisted.', async () => {
    const result = await request(app).post('/graphql');
    expect(result.text).toEqual('Not allowed by CORS');
    expect(result.status).toEqual(401);
  });
  it('It should return error when a query is not specified.', async () => {
    const result = await request(app)
      .post('/graphql')
      .set('origin', uiHost);
    expect(result.text).toEqual('query not allowed');
    expect(result.status).toEqual(400);
  });
  it('It should return error when a query is not whitelisted.', async () => {
    const result = await request(app)
      .post('/graphql')
      .send({ query: 'someNotExistingQuery' })
      .set('origin', uiHost);
    expect(result.text).toEqual('query not allowed');
    expect(result.status).toEqual(400);
  });
});

describe('Test /graphql route queries.', () => {
  beforeEach(() => {
    (postgraphileServer as any).mockClear(); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });
  const queryTests = Object.keys(queryWhiteListMap).map(key => [key]);
  it.each(queryTests)('It should work when a query is "%s".', async query => {
    const result = await request(app)
      .post('/graphql')
      .send({ query })
      .set('origin', uiHost);
    const responseData = JSON.parse(result.text);
    expect(responseData.data).toEqual({});
    expect(result.status).toEqual(200);
    expect(postgraphileServer).toHaveBeenCalledTimes(1);
  });
});
