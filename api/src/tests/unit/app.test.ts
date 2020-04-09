import { apiCall } from '../test-helpers';
import postgraphileServer from '../../postgraphileServer';
import { queryWhiteListMap } from '../../queries';

// Mock the postgraphile middleware, since it is probably well tested on its own.
//  - we can trust that it works as expected.
jest.mock('../../postgraphileServer');

describe('Test /graphql route errors.', () => {
  it('It should fail when request origin is not whitelisted.', async () => {
    const { body, status } = await apiCall({}, { origin: null });
    expect(body.error).toEqual('Not allowed by CORS');
    expect(status).toEqual(401);
  });
  it('It should return error when a query is not specified.', async () => {
    const { body, status } = await apiCall({});
    expect(body.error).toEqual('query not allowed');
    expect(status).toEqual(400);
  });
  it('It should return error when a query is not whitelisted.', async () => {
    const { body, status } = await apiCall({ query: 'someNotExistingQuery' });
    expect(body.error).toEqual('query not allowed');
    expect(status).toEqual(400);
  });
});

describe('Person can run whitelisted queries', () => {
  beforeEach(async () => {
    (postgraphileServer as any).mockClear(); // eslint-disable-line @typescript-eslint/no-explicit-any
    jest.resetModules();
    jest.restoreAllMocks();
  });

  const queryTests = Object.keys(queryWhiteListMap).map(key => [key]);
  it.each(queryTests)('It should work when a query is "%s".', async query => {
    const { body, status } = await apiCall({ query });
    expect(body.data).toEqual({});
    expect(status).toEqual(200);
    expect(postgraphileServer).toHaveBeenCalledTimes(1);
  });
});
