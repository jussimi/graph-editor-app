import { RequestHandler } from 'express';
import gql from 'graphql-tag';

// This map can be extended to contain functions which return errors and custom data.
const mockedResponses = {
  fetchAllResources: {},
  registerPerson: {},
  loginPerson: {},
  removePerson: {},
  createGraph: {},
  deleteGraphById: {},
  updateGraphById: {},
};

const mockedPostgraphile: RequestHandler = (req, res, next) => {
  // NOTE: If the request has gotten this far, we know for sure that "query" exists in req.body.
  //  - look at the graphqlInterceptor in app.ts
  const { query } = req.body;
  // Parse the query name from the query string.
  const parsedQuery = gql`
    ${query}
  `;
  const queryName = (parsedQuery.definitions[0] as any).name.value; // eslint-disable-line @typescript-eslint/no-explicit-any
  const responseData = mockedResponses[queryName];
  res.send({ data: responseData });
  next();
};
export default jest.fn(mockedPostgraphile);
