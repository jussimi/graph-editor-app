import { NuxtAppOptions } from '@nuxt/types';
import { Graph } from '~/types';

const graphqlQuery = async (app: NuxtAppOptions, query: string, useAuth = false) => {
  let url;
  if (process.client) {
    url = 'http://0.0.0.0:4000/graphql';
  } else {
    // WHen called from server side, the api is called from the docker container.
    // Thus we change the api-url to the url in the docker-network.
    url = 'http://api:4000/graphql';
  }
  let headers = {};
  if (useAuth) {
    const authToken = app.$cookies.get('authToken');
    headers = { Authorization: `Bearer ${authToken}` };
  }
  let data: any;
  let error: any;
  try {
    const response = await app.$axios.$post(url, { query }, { headers });
    if (response.errors) {
      error = response.errors[0];
    } else {
      data = response.data;
    }
    // console.log(response);
  } catch (err) {
    // console.log(err);
    error = err;
  }
  return { data, error };
};
export default graphqlQuery;

export const fetchAllResources = async (app: NuxtAppOptions) => {
  const query = `
    {
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
  `;
  let data: { personId: number; email: string; graphs: Graph[] } | undefined;
  let error: any;
  const response = await graphqlQuery(app, query, true);
  if (response.data) {
    const person = response.data.allPeople?.nodes?.[0];
    if (person) {
      data = {
        personId: person.id,
        email: person.email,
        graphs: person.graphsByPersonId.nodes || []
      };
    }
  } else if (response.error) {
    error = response.error;
  }
  // console.log(data, error);
  return { data, error };
};

export const registerPerson = async (app: NuxtAppOptions, email: string, password: string) => {
  const query = `
    mutation RegisterPerson {
      registerPerson(
        input: { email: "${email}", password: "${password}" }
      ) {
        authToken
      }
    }
  `;
  let data: { authToken: string } | undefined;
  let error: any;
  const response = await graphqlQuery(app, query);
  if (response.data) {
    const authToken = response.data.registerPerson?.authToken;
    if (authToken) {
      data = { authToken };
    }
  } else if (response.error) {
    error = response.error;
  }
  // console.log(data, error);
  return { data, error };
};

export const loginPerson = async (app: NuxtAppOptions, email: string, password: string) => {
  const query = `
    mutation Authenticate {
      authenticate(input: {email: "${email}", password: "${password}"}) {
        authToken
      }
    }
  `;
  let data: { authToken: string } | undefined;
  let error: any;
  const response = await graphqlQuery(app, query);
  if (response.data) {
    const authToken = response.data.authenticate?.authToken;
    if (authToken) {
      data = { authToken };
    }
  } else if (response.error) {
    error = response.error;
  }
  // console.log(data, error);
  return { data, error };
};
