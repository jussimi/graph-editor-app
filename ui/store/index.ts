import { getAccessorType, mutationTree, actionTree } from 'nuxt-typed-vuex';
// import { Context } from '@nuxt/types';
// import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { queries } from '@/store-helpers/queries';
import { Graph, GraphData } from '@/types';

export const state = () => ({
  personId: 0,
  email: '',
  loggedIn: false,
  graphs: [] as Graph[]
});

type RootState = ReturnType<typeof state>;

export const getters = {
  email: (state: RootState) => state.email,
  fullEmail: (state: RootState) => state.email
};

export const mutations = mutationTree(state, {
  setPersonId(state, newValue: number) {
    state.personId = newValue;
  },

  setEmail(state, newValue: string) {
    state.email = newValue;
  },

  setLoggedIn(state, newValue: boolean) {
    state.loggedIn = newValue;
  },

  setGraphs(state, newGraphs: (Graph | GraphData)[]) {
    state.graphs = newGraphs.map(g => new Graph(g));
  },

  upsertGraph(state, graph: Graph | GraphData) {
    const { graphs } = state;
    // If graph exists, do update.
    if (graphs.find(g => g.id === graph.id)) {
      state.graphs = graphs.map(g => (g.id === graph.id ? new Graph(graph) : g));
    }
    // Else insert
    else {
      state.graphs = [...graphs, new Graph(graph)];
    }
  },

  removeGraph(state, graphToRemove: Graph | GraphData) {
    state.graphs = state.graphs.filter(g => g.id !== graphToRemove.id);
  }

  // initialiseStore() {
  //   console.log('initialised');
  // }
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    resetEmail() {
      this.app.$accessor.setEmail('a@a.com');
    },

    // async nuxtServerInit(_vuexContext, _nuxtContext: Context) {
    //   // console.log(nuxtContext.req);
    // },

    logout({ state }) {
      if (state.loggedIn) {
        this.app.$accessor.setEmail('');
        this.app.$accessor.setGraphs([]);
        this.app.$accessor.setLoggedIn(false);
        this.app.$cookies.remove('authToken');
        this.$router.push('/');
      }
    },

    async register(_vuexContext, { email, password }: { email: string; password: string }): Promise<boolean> {
      const { data, error } = await queries.registerPerson(this.app, email, password);
      if (error) {
        console.log(error);
      } else if (data?.authToken) {
        const { authToken } = data;
        this.app.$cookies.set('authToken', authToken);
        await this.app.$accessor.fetchData(undefined);
        this.$router.push('/graphs');
        return true;
      }
      return false;
    },

    async unRegister(_vuexContext, { email, password }: { email: string; password: string }): Promise<boolean> {
      const { data, error } = await queries.removePerson(this.app, email, password);
      if (error) {
        console.log(error);
      } else if (data?.success) {
        this.app.$accessor.logout(undefined);
      }
      return false;
    },

    async login(_vuexContext, { email, password }: { email: string; password: string }): Promise<boolean> {
      const { data, error } = await queries.loginPerson(this.app, email, password);
      if (error) {
        console.log(error);
      } else if (data?.authToken) {
        const { authToken } = data;
        this.app.$cookies.set('authToken', authToken);
        await this.app.$accessor.fetchData(undefined);
        this.$router.push('/graphs');
        return true;
      }
      return false;
    },

    async fetchData() {
      const { data, error } = await queries.fetchAllResources(this.app);
      if (error) {
        console.log(error);
      } else if (data?.personId) {
        const { personId, email, graphs } = data;
        this.app.$accessor.setLoggedIn(true);
        this.app.$accessor.setPersonId(personId);
        this.app.$accessor.setEmail(email);
        this.app.$accessor.setGraphs(graphs);
      }
    },

    async createGraph({ state }, graph: Graph) {
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

    async updateGraph(_vuexContext, graph: Graph) {
      const { data, error } = await queries.updateGraph(this.app, graph);
      if (error) {
        console.log(error);
      } else if (data) {
        // Set updated graph to store.
        this.app.$accessor.upsertGraph(data.graph);
      }
    },

    async deleteGraph(_vuexContext, graph: Graph) {
      const { data, error } = await queries.deleteGraph(this.app, graph);
      if (error) {
        console.log(error);
      } else if (data?.success) {
        // Set updated graph to store and set route to /graphs.
        // The middleware will then redirect to an existing graph or create a new temporary graph
        this.app.$accessor.removeGraph(graph);
        this.$router.push('/graphs');
      }
    }
  }
);

export const accessorType = getAccessorType({
  // actions,
  getters,
  mutations,
  state
});
