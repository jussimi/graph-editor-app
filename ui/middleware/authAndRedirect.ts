import { Context } from '@nuxt/types';
import { Graph } from '@/types';

const authMiddleware = async (context: Context) => {
  console.log('start middleware');
  const authToken = context.app.$cookies.get('authToken');
  const isLoggedIn = context.app.$accessor.loggedIn;
  const graphIdFromRoute = Number.parseInt(context.route.params.graphId, 10);
  if (authToken) {
    if (!isLoggedIn) {
      await context.app.$accessor.fetchData(undefined);
    }
    // Check if the initial fetch went through -> logged in should be set as true.
    if (context.app.$accessor.loggedIn) {
      const graphs = context.app.$accessor.graphs;
      if (!graphs.find((g) => g.id === graphIdFromRoute)) {
        console.log('graph not found');
        if (graphs[0]) {
          console.log('REDIRECT: logged in and has graphs');
          return context.redirect(`/graphs/${graphs[0].id}`);
        } else {
          console.log('REDIRECT: logged in and does not have graphs');
          const newGraph = new Graph({ id: 1, name: 'New-Graph', isTemp: true });
          context.app.$accessor.setGraphs([newGraph]);
          return context.redirect(`/graphs/${newGraph.id}`);
        }
      } else {
        console.log('Graph found, proceed!');
        return;
      }
    } else {
      // Remove the authToken since it didn't work.
      console.log('remove cookie since it was not valid');
      context.app.$accessor.resetState(undefined);
      context.app.$cookies.remove('authToken', { path: '/', sameSite: true });
    }
  }
  // Not logged in.
  const graphs = context.app.$accessor.graphs;
  const shouldRedirect = graphIdFromRoute !== 1 || graphs[0]?.id !== graphIdFromRoute;
  if (shouldRedirect) {
    console.log('REDIRECT: not logged in');
    context.app.$accessor.resetState(undefined);
    const newGraph = new Graph({ id: 1, name: 'Trial-Graph', isTemp: true });
    context.app.$accessor.setGraphs([newGraph]);
    return context.redirect(`/graphs/${newGraph.id}`);
  }
  console.log('not logged in but route OK');
};

export default authMiddleware;
