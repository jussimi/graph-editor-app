import { Context } from '@nuxt/types';
import { Graph } from '@/types';

const authMiddleware = async (context: Context) => {
  const authToken = context.app.$cookies.get('authToken');
  const isLoggedIn = context.app.$accessor.loggedIn;
  if (authToken) {
    if (!isLoggedIn) {
      await context.app.$accessor.fetchData(undefined);
      const graphs = context.app.$accessor.graphs;
      if (graphs[0]) {
        return context.redirect(`/graphs/${graphs[0].id}`);
      } else {
        const newGraph = new Graph({ id: 1, name: 'New Graph', isTemp: true });
        context.app.$accessor.setGraphs([newGraph]);
        return context.redirect(`/graphs/${newGraph.id}`);
      }
    } else {
      // Do nothing
    }
  } else {
    const newGraph = new Graph({ id: 1, name: 'Trial Graph', isTemp: true });
    context.app.$accessor.setGraphs([newGraph]);
    return context.redirect(`/graphs/${newGraph.id}`);
  }
};

export default authMiddleware;
