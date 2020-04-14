import { getAccessorType } from 'nuxt-typed-vuex';
import { ActionContext, Store } from 'vuex';
import { queries } from './queries';
import { Graph, GraphData } from '@/types';

export const state = () => ({
  personId: 0,
  email: '',
  loggedIn: false,
  graphs: [] as Graph[],
  env: {
    API_PORT: '',
  } as Record<string, string>,
});

export type RootState = ReturnType<typeof state>;

export const getters = {
  email: (state: RootState) => state.email,
  fullEmail: (state: RootState) => state.email,
};

export const mutations = {
  setPersonId(state: RootState, newValue: number) {
    state.personId = newValue;
  },

  setEmail(state: RootState, newValue: string) {
    state.email = newValue;
  },

  setLoggedIn(state: RootState, newValue: boolean) {
    state.loggedIn = newValue;
  },

  setGraphs(state: RootState, newGraphs: (Graph | GraphData)[]) {
    state.graphs = newGraphs.map((g) => new Graph(g));
  },

  upsertGraph(state: RootState, graph: Graph | GraphData) {
    const { graphs } = state;
    // If graph exists, do update.
    if (graphs.find((g) => g.id === graph.id)) {
      state.graphs = graphs.map((g) => (g.id === graph.id ? new Graph(graph) : g));
    }
    // Else insert
    else {
      state.graphs = [...graphs, new Graph(graph)];
    }
  },

  removeGraph(state: RootState, graphToRemove: Graph | GraphData) {
    state.graphs = state.graphs.filter((g) => g.id !== graphToRemove.id);
  },

  setEnv(state: RootState, env: Record<string, string>) {
    state.env = env;
  },
};

export type ActionCtx = ActionContext<RootState, RootState>;
type StoreState = Store<RootState>;
export const actions = {
  nuxtServerInit(this: StoreState): void {
    // process.env is not available on client side -> save it to store on
    const { API_PORT = '' } = process.env;
    this.app.$accessor.setEnv({ API_PORT });
  },
  resetState(this: StoreState): void {
    this.app.$accessor.setPersonId(0);
    this.app.$accessor.setEmail('');
    this.app.$accessor.setGraphs([]);
    this.app.$accessor.setLoggedIn(false);
  },
  logout(this: StoreState, { state }: ActionCtx): void {
    if (state.loggedIn) {
      this.app.$accessor.resetState(undefined);
      this.app.$cookies.remove('authToken', { sameSite: true });
      this.$router.push('/');
    }
  },
  async register(
    this: StoreState,
    _ctx: ActionCtx,
    { email, password }: { email: string; password: string }
  ): Promise<boolean> {
    const { data, error } = await queries.registerPerson(this.app, email, password);
    if (error) {
      console.log(error);
    } else if (data?.authToken) {
      const { authToken } = data;
      this.app.$cookies.set('authToken', authToken, { sameSite: true });
      await this.app.$accessor.fetchData(undefined);
      this.$router.push('/graphs');
      return true;
    }
    return false;
  },
  async unRegister(
    this: StoreState,
    _ctx: ActionCtx,
    { email, password }: { email: string; password: string }
  ): Promise<boolean> {
    const { data, error } = await queries.removePerson(this.app, email, password);
    if (error) {
      console.log(error);
    } else if (data?.success) {
      this.app.$accessor.logout(undefined);
      return true;
    }
    return false;
  },
  async login(
    this: StoreState,
    _ctx: ActionCtx,
    { email, password }: { email: string; password: string }
  ): Promise<boolean> {
    const { data, error } = await queries.loginPerson(this.app, email, password);
    if (error) {
      console.log(error);
    } else if (data?.authToken) {
      const { authToken } = data;
      this.app.$cookies.set('authToken', authToken, { sameSite: true });
      await this.app.$accessor.fetchData(undefined);
      this.$router.push('/graphs');
      return true;
    }
    return false;
  },
  async fetchData(this: StoreState, { state }: ActionCtx) {
    const { data, error } = await queries.fetchAllResources(this.app);
    if (error) {
      console.log(error);
    } else if (data?.personId) {
      const { personId, email, graphs } = data;
      const tempGraphs = state.graphs.filter((g) => g.isTemp);
      this.app.$accessor.setLoggedIn(true);
      this.app.$accessor.setPersonId(personId);
      this.app.$accessor.setEmail(email);
      this.app.$accessor.setGraphs([...graphs, ...tempGraphs]);
    }
  },
  async createGraph(this: StoreState, { state }: ActionCtx, graph: Graph) {
    const { personId } = state;
    const { data, error } = await queries.createGraph(this.app, personId, graph);
    if (error) {
      console.log(error);
    } else if (data) {
      // Remove temporary graph from store and add the new graph from database.
      this.app.$accessor.removeGraph(graph);
      this.app.$accessor.upsertGraph(data.graph);
      // Set route to the new graph.
      this.$router.push(`/graphs/${data.graph.id}`);
    }
  },
  async updateGraph(this: StoreState, _ctx: ActionCtx, graph: Graph) {
    const { data, error } = await queries.updateGraph(this.app, graph);
    if (error) {
      console.log(error);
    } else if (data) {
      // Set updated graph to store.
      this.app.$accessor.upsertGraph(data.graph);
    }
  },
  async deleteGraph(this: StoreState, _ctx: ActionCtx, graph: Graph) {
    const { data, error } = await queries.deleteGraph(this.app, graph);
    if (error) {
      console.log(error);
    } else if (data?.success) {
      // Set updated graph to store and set route to /graphs.
      // The middleware will then redirect to an existing graph or create a new temporary graph
      this.app.$accessor.removeGraph(graph);
      this.$router.push('/graphs');
    }
  },
};

export const accessorType = getAccessorType({
  actions,
  getters,
  mutations,
  state,
});
