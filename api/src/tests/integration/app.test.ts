import { apiCall, ApiCallResponse } from '../test-helpers';

const setAuth = (jwt: string): Record<string, string> => ({
  Authorization: `Bearer ${jwt}`,
});

const registerPersonCall = async (email: string, password: string): Promise<ApiCallResponse> => {
  return await apiCall({ query: 'registerPerson', variables: { email, password } });
};
const removePersonCall = async (email: string, password: string, jwt: string): Promise<ApiCallResponse> => {
  return await apiCall({ query: 'removePerson', variables: { email, password } }, setAuth(jwt));
};

describe('Integration tests', () => {
  const personEmail = 'test@test.test';
  const personPassword = 'testpass';

  test('Person should be able to register and unregister', async () => {
    // Create person
    const registerRes = await registerPersonCall(personEmail, personPassword);
    const authToken: string = registerRes.body?.data?.registerPerson?.authToken || '';
    expect(authToken).toBeTruthy();
    expect(registerRes.status).toBe(200);
    // Remove person
    const removeRes = await removePersonCall(personEmail, personPassword, authToken);
    expect(removeRes.status).toBe(200);
  });

  describe('Person actions', () => {
    let authToken = '';
    beforeAll(async () => {
      const registerRes = await registerPersonCall(personEmail, personPassword);
      authToken = registerRes.body?.data?.registerPerson?.authToken || '';
    });

    afterAll(async () => {
      await removePersonCall(personEmail, personPassword, authToken);
    });

    test('Person can login', async () => {
      const { body, status } = await apiCall({
        query: 'loginPerson',
        variables: { email: personEmail, password: personPassword },
      });
      const authToken = body?.data?.authenticate?.authToken || '';
      expect(authToken).toBeTruthy();
      expect(status).toEqual(200);
    });

    test('Person can fetch data', async () => {
      const { body, status } = await apiCall({ query: 'fetchAllResources' }, setAuth(authToken));
      const personData = body?.data?.allPeople?.nodes?.[0];
      expect(personData.id).toBeGreaterThan(100);
      expect(status).toEqual(200);
    });

    describe('Creating and editing graphs', () => {
      let personId = 0;
      beforeAll(async () => {
        const { body } = await apiCall({ query: 'fetchAllResources' }, setAuth(authToken));
        const personData = body?.data?.allPeople?.nodes?.[0];
        personId = personData.id;
      });

      test('Person can create, update and delete a graph', async () => {
        // Create
        const createGraphRes = await apiCall(
          { query: 'createGraph', variables: { personId, nodes: [], edges: [], name: 'test-graph' } },
          setAuth(authToken),
        );
        const createdGraph = createGraphRes.body?.data?.createGraph?.graph || {};
        const graphId = createdGraph.id;
        expect(createdGraph.id).toBeGreaterThan(100);
        expect(createGraphRes.status).toEqual(200);
        // Update
        const newName = 'update-graph-name';
        const updateGraphRes = await apiCall(
          { query: 'updateGraphById', variables: { id: graphId, nodes: [], edges: [], name: newName } },
          setAuth(authToken),
        );
        const updatedGraph = updateGraphRes.body?.data?.updateGraphById?.graph || {};
        expect(updatedGraph.id).toEqual(graphId);
        expect(updatedGraph.name).toEqual(newName);
        expect(updateGraphRes.status).toEqual(200);
        // Delete
        const deleteGraphRes = await apiCall(
          { query: 'deleteGraphById', variables: { id: graphId } },
          setAuth(authToken),
        );
        const deletedGraph = deleteGraphRes.body?.data?.deleteGraphById?.graph || {};
        expect(deletedGraph.id).toEqual(graphId);
        expect(deleteGraphRes.status).toEqual(200);
      });
    });
  });
});
