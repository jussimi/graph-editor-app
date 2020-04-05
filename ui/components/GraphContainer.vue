<template>
  <div>
    <GraphToolbar v-bind="{ name: graph.name, config, state, actions, isTrial }" />
    <div class="mx-auto pa-1 transition-swing elevation-2">
      <GraphCanvas ref="graphCanvas" v-bind="{ nodes: graph.nodes, edges: graph.edges, config, state, actions }" />
    </div>
    {{ isTrial }}
    <Confirm :open="confirmOpen" :on-cancel="() => (confirmOpen = false)" :on-confirm="deleteGraph" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'nuxt-property-decorator';

// Components
import GraphToolbar from './toolbar/GraphToolbar.vue';
import GraphCanvas from './canvas/GraphCanvas.vue';
import Confirm from './Confirm.vue';
import { Graph, Node, Edge, EditorConfig, EditorState, Selected, EditorActions } from '@/types';

// const emptyGraph = () => new Graph({ id: 1111111111 });
// Graph.nextId = 1;

// TODO: This component should be split up into into smaller pieces.

@Component({
  components: {
    GraphToolbar,
    GraphCanvas,
    Confirm,
  },
})
export default class GraphContainer extends Vue {
  @Prop({ type: Object, required: true }) graphFromRoute!: Graph;

  graph: Graph = this.graphFromRoute.clone();

  drawer = false;

  confirmOpen = false;

  // graph: Graph = emptyGraph();

  // Properties handled by the toolbar.
  // Determines the look of a new Edge or Node.
  config: EditorConfig = {
    mode: 'edit',
    fill: '#000000',
    color: '#ffffff',
    isDirected: false,
    radius: 50,
    width: 5,
  };

  downloading = false;

  size = 1200;

  ratio = 1.6;

  selected: Selected = {
    type: null,
    value: null,
  };

  get state(): EditorState {
    const { selected, size, ratio, downloading, disabled } = this;
    const { nextNodeId, nextEdgeId } = this.graph;
    return { selected, size, ratio, downloading, disabled, nextNodeId, nextEdgeId };
  }

  get disabled(): boolean {
    return !this.graph;
  }

  get isTrial(): boolean {
    return !this.isLoggedIn && !!this.graph.isTemp;
  }

  get isLoggedIn(): boolean {
    return this.$accessor.loggedIn;
  }

  // Group actions to a function so that they can be passed down as a single prop.
  get actions(): EditorActions {
    console.log('actions changed');
    return {
      setConfig: (config: EditorConfig) => {
        this.config = config;
      },
      setSelected: (type?: 'node' | 'edge', id?: number) => {
        this.handleSelect(type, id);
      },
      addNode: (node: Node) => {
        this.graph.addNode(node);
      },
      updateNode: (node: Node) => {
        this.graph.updateNode(node);
      },
      deleteNode: (node: Node) => {
        this.graph.deleteNode(node);
        this.setSelected();
      },
      addEdge: (edge: Edge) => {
        this.graph.addEdge(edge);
      },
      updateEdge: (edge: Edge) => {
        this.graph.updateEdge(edge);
      },
      deleteEdge: (edge: Edge) => {
        this.graph.deleteEdge(edge);
        this.setSelected();
      },
      updateName: (name: string) => {
        this.graph.setName(name);
      },
      setLayout: () => {
        this.graph.setLayout(this.size * this.ratio, this.size);
      },
      downloadSvg: () => {
        this.downloadSvg();
      },
      doDelete: () => {
        this.confirmOpen = true;
      },
      doSave: () => {
        if (this.graph.isTemp) {
          this.$accessor.createGraph(this.graph);
        } else {
          this.$accessor.updateGraph(this.graph);
        }
      },
    };
  }

  deleteGraph() {
    this.$accessor.deleteGraph(this.graph);
  }

  setSelected(type?: 'node' | 'edge', value?: Node | Edge) {
    this.selected = {
      type: type || null,
      value: value || null,
    };
  }

  handleSelect(type?: 'node' | 'edge', id?: number) {
    if (type && id) {
      const value = type === 'node' ? this.graph.getNode(id) : this.graph.getEdge(id);
      this.config.mode = 'edit';
      this.setSelected(type, value);
    } else {
      this.setSelected();
    }
  }

  downloadSvg() {
    // Reset state
    this.setSelected();
    this.downloading = true;
    // Wait for the DOM to update before exporting the SVG.
    // This way we get rid of unnesseccary classes in the Nodes and Edges. (i.e cursor and selected-outline)
    this.$nextTick(() => {
      const svg = (this.$refs.graphCanvas as Vue).$el as HTMLOrSVGImageElement;
      const svgString = new XMLSerializer().serializeToString(svg);
      const link = document.createElement('a');
      link.download = `${this.graph.name}_${Date.now()}.svg`;
      link.href = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      link.click();
      //
      this.downloading = false;
      // this.doSave();
    });
  }

  // mounted() {
  //   window.addEventListener('resize', this.onResize);
  // }

  // beforeDestroy() {
  //   window.removeEventListener('resize', this.onResize);
  // }

  // onResize() {
  //   this.ratio = window.innerWidth / window.innerHeight;
  // }

  @Watch('config.mode')
  onModeChange(mode: string) {
    if (mode !== 'edit') {
      this.setSelected();
    }
  }

  @Watch('graphFromRoute', { immediate: true })
  onGraphFromRouteChange(newVal: Graph) {
    // Set the graph to match the graphFromRoute-prop.
    this.graph = newVal.clone();
    console.log(JSON.stringify(this.graph));
  }
}
</script>

<style scoped>
.toolbar-form {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}
.graph {
  touch-action: none;
}
</style>
