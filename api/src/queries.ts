/**
 * The ui makes requests with the keys of this object. Anything else is not permitted.
 * For example a request body colud be like body = { query: 'registerPerson', variables: { email, password } }
 */
export const queryWhiteListMap: Record<string, string> = {
  fetchAllResources: `
    query fetchAllResources {
      allPeople(orderBy:ID_ASC, last:1) {
        nodes {
          id
          email
          graphsByPersonId {
            nodes {
              id
              name
              edges
              nodes
            }
          }
        }
      }
    }
  `,
  registerPerson: `
    mutation registerPerson($email: String!, $password: String!) {
      registerPerson(input: { email: $email, password: $password }) {
        authToken
      }
    }
  `,
  loginPerson: `
    mutation loginPerson($email: String!, $password: String!) {
      authenticate(input: { email: $email, password: $password }) {
        authToken
      }
    }
  `,
  removePerson: `
    mutation removePerson($email: String!, $password: String!) {
      removePerson(input: { email: $email, password: $password }) {
        boolean
      }
    }
  `,
  createGraph: `
    mutation createGraph($edges: JSON!, $nodes: JSON!, $personId: Int!, $name: String!) {
      createGraph(input: { graph: { personId: $personId, name: $name, nodes: $nodes, edges: $edges } }) {
        graph {
          id
          name
          nodes
          edges
        }
      }
    }
  `,
  deleteGraphById: `
    mutation deleteGraphById($id: Int!) {
      deleteGraphById(input: { id: $id }) {
        graph {
          id
        }
      }
    }
  `,
  updateGraphById: `
    mutation updateGraphById($id: Int!, $edges: JSON!, $nodes: JSON!, $name: String!) {
      updateGraphById(input: { id: $id, graphPatch: { edges: $edges, nodes: $nodes, name: $name } }) {
        graph {
          id
          edges
          nodes
          name
        }
      }
    }
  `,
};
