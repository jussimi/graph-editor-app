import { NuxtAppOptions } from '@nuxt/types';
import { Graph, GraphData } from '@/types';

const graphqlQuery = async (
  app: NuxtAppOptions,
  { query, variables }: { query: string; variables: any },
  useAuth = false
) => {
  const { API_PORT } = app.$accessor.env;
  let url;

  if (process.client) {
    const { hostname, protocol } = window.location;
    url = `${protocol}//${hostname}:${API_PORT}/graphql`;
    // If running Cypress from inside docker, the hostname gets set as 'ui'.
    // Thus we change the api-url to match the url inside the docker-network.
    const isCypress = typeof (window as any).Cypress !== 'undefined';
    if (isCypress && hostname === 'ui') {
      url = `http://api:${API_PORT}/graphql`;
    }
  } else {
    // When called from server side, the call is made from within the docker container.
    // Thus we change the api-url to the url in the docker-network.
    url = `http://api:${API_PORT}/graphql`;
  }
  let headers = {} as Record<string, string>;
  if (useAuth) {
    const authToken = app.$cookies.get('authToken');
    headers = { Authorization: `Bearer ${authToken}` };
  }
  if (process.server) {
    headers.origin = `http://ui:${process.env.PORT}`;
  }
  let data: any;
  let error: any;
  try {
    const response = await app.$axios.$post(url, { query, variables }, { headers });
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

const registerPerson = async (app: NuxtAppOptions, email: string, password: string) => {
  const query = 'registerPerson';
  const variables = { email, password };
  let data: { authToken: string } | undefined;
  let error: any;
  const response = await graphqlQuery(app, { query, variables });
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

const loginPerson = async (app: NuxtAppOptions, email: string, password: string) => {
  const query = 'loginPerson';
  const variables = { email, password };
  let data: { authToken: string } | undefined;
  let error: any;
  const response = await graphqlQuery(app, { query, variables });
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

const removePerson = async (app: NuxtAppOptions, email: string, password: string) => {
  const query = 'removePerson';
  const variables = { email, password };
  let data: { success: boolean } | undefined;
  let error: any;
  const response = await graphqlQuery(app, { query, variables }, true);
  if (response.data?.removePerson) {
    const success = response.data.removePerson.boolean;
    data = { success };
  } else if (response.error) {
    error = response.error;
  }
  // console.log(data, error);
  return { data, error };
};

const fetchAllResources = async (app: NuxtAppOptions) => {
  const query = 'fetchAllResources';
  let data: { personId: number; email: string; graphs: GraphData[] } | undefined;
  let error: any;
  const response = await graphqlQuery(app, { query, variables: {} }, true);
  if (response.data) {
    const person = response.data.allPeople?.nodes?.[0];
    if (person) {
      data = {
        personId: person.id,
        email: person.email,
        graphs: person.graphsByPersonId.nodes || [],
      };
    }
  } else if (response.error) {
    error = response.error;
  }
  // console.log(data, error);
  return { data, error };
};

const createGraph = async (app: NuxtAppOptions, personId: number, graph: Graph | GraphData) => {
  const { name, edges, nodes } = graph;
  const query = 'createGraph';
  const variables = {
    edges,
    nodes,
    personId,
    name,
  };
  console.log(query);
  let data: { graph: GraphData } | undefined;
  let error: any;
  const response = await graphqlQuery(app, { query, variables }, true);
  if (response.data) {
    const graph = response.data.createGraph?.graph;
    if (graph) {
      data = {
        graph,
      };
    }
  } else if (response.error) {
    error = response.error;
  }
  // console.log(data, error);
  return { data, error };
};

const updateGraph = async (app: NuxtAppOptions, graph: Graph | GraphData) => {
  const { id, name, nodes, edges } = graph;
  const query = 'updateGraphById';
  const variables = {
    id,
    edges,
    nodes,
    name,
  };
  let data: { graph: GraphData } | undefined;
  let error: any;
  const response = await graphqlQuery(app, { query, variables }, true);
  if (response.data) {
    const graph = response.data.updateGraphById?.graph;
    if (graph) {
      data = {
        graph,
      };
    }
  } else if (response.error) {
    error = response.error;
  }
  // console.log(data, error);
  return { data, error };
};

const deleteGraph = async (app: NuxtAppOptions, graph: Graph | GraphData) => {
  const { id } = graph;
  const query = 'deleteGraphById';
  const variables = { id };
  let data: { success: boolean } | undefined;
  let error: any;
  const response = await graphqlQuery(app, { query, variables }, true);
  if (response.data) {
    const graph = response.data.deleteGraphById?.graph;
    if (graph?.id) {
      data = {
        success: true,
      };
    }
  } else if (response.error) {
    error = response.error;
  }
  // console.log(data, error);
  return { data, error };
};

export const queries = {
  registerPerson,
  loginPerson,
  fetchAllResources,
  createGraph,
  updateGraph,
  deleteGraph,
  removePerson,
};
