import { getAccessorType, mutationTree, actionTree } from 'nuxt-typed-vuex';
import { Context } from '@nuxt/types';
// import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { fetchAllResources, registerPerson, loginPerson } from '../queries';
import { Graph } from '@/types';

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

  setGraphs(state, newGraphs: Graph[]) {
    state.graphs = newGraphs.map(g => new Graph(g));
  },

  initialiseStore() {
    console.log('initialised');
  }
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    resetEmail() {
      this.app.$accessor.setEmail('a@a.com');
    },

    async nuxtServerInit(_vuexContext, _nuxtContext: Context) {
      // console.log(nuxtContext.req);
    },

    async fetchData() {
      const { data, error } = await fetchAllResources(this.app);
      if (error) {
        console.log(error);
      } else if (data) {
        const { personId, email, graphs } = data;
        this.app.$accessor.setLoggedIn(true);
        this.app.$accessor.setPersonId(personId);
        this.app.$accessor.setEmail(email);
        this.app.$accessor.setGraphs(graphs);
      }
    },

    async register(_vuexContext, { email, password }: { email: string; password: string }) {
      const { data, error } = await registerPerson(this.app, email, password);
      if (error) {
        console.log(error);
      } else if (data) {
        const { authToken } = data;
        this.app.$cookies.set('authToken', authToken);
        await this.app.$accessor.fetchData(undefined);
        this.$router.push('/graphs');
      }
    },

    async login(_vuexContext, { email, password }: { email: string; password: string }) {
      const { data, error } = await loginPerson(this.app, email, password);
      if (error) {
        console.log(error);
      } else if (data) {
        const { authToken } = data;
        this.app.$cookies.set('authToken', authToken);
        await this.app.$accessor.fetchData(undefined);
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
