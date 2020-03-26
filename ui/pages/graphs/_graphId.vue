<template>
  <v-layout>
    <v-flex class="text-center">
      <GraphEditorContainer v-if="!!graphByRoute" :graph-from-route="graphByRoute" />
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import { Graph } from '@/types';

import GraphEditorContainer from '@/components/GraphContainer.vue';

@Component({
  components: {
    GraphEditorContainer
  }
})
export default class GraphPage extends Vue {
  get graphByRoute(): Graph | undefined {
    const graphId = Number.parseInt(this.$route.params.graphId, 10);
    const graph = this.$accessor.graphs.find(g => g.id === graphId);
    return graph ? new Graph(graph) : undefined; // Clone graph so that the reference is changed.
  }
}
</script>
