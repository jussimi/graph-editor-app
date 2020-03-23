<template>
  <div>
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item>
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-action>
            <v-icon>mdi-mail</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Contact</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <GraphToolbar v-bind="{ name: graph.name, config, state, actions }">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </GraphToolbar>

    <v-content>
      <v-container>
        <div :class="`elevation-${2}`" class="mx-auto pa-1 transition-swing">
          <GraphCanvas ref="graphCanvas" v-bind="{ nodes: graph.nodes, edges: graph.edges, config, state, actions }" />
        </div>
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2019</span>
    </v-footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Graph, Node, Edge, EditorConfig, EditorState, GraphData, Selected, EditorActions } from '../typescript';

// Components
import GraphToolbar from './toolbar/GraphToolbar.vue';
import GraphCanvas from './canvas/GraphCanvas.vue';

const emptyGraph = () => new Graph({ id: 1111111111 });
// Graph.nextId = 1;

// TODO: This component should be split up into into smaller pieces.

@Component({
  components: {
    GraphToolbar,
    GraphCanvas
  }
})
export default class GraphContainer extends Vue {
  drawer = false;
  graphs: GraphData[] = [new Graph({ id: 1 })];

  graph: Graph = emptyGraph();

  // Properties handled by the toolbar.
  // Determines the look of a new Edge or Node.
  config: EditorConfig = {
    mode: 'edit',
    fill: '#000000',
    color: '#ffffff',
    isDirected: false,
    radius: 50,
    width: 5
  };

  downloading = false;

  size = 1200;

  ratio = 1.6;

  selected: Selected = {
    type: null,
    value: null
  };

  get state(): EditorState {
    const { selected, size, ratio, downloading, disabled } = this;
    const { nextNodeId, nextEdgeId } = this.graph;
    return { selected, size, ratio, downloading, disabled, nextNodeId, nextEdgeId };
  }

  get disabled(): boolean {
    return !this.graph;
  }

  get actions(): EditorActions {
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
        console.log('download');
        // this.downloadSvg();
      },
      doSave: () => {
        console.log('doSave here');
      }
    };
  }

  setSelected(type?: 'node' | 'edge', value?: Node | Edge) {
    this.selected = {
      type: type || null,
      value: value || null
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
      console.log(svg);
      const svgString = new XMLSerializer().serializeToString(svg);
      const link = document.createElement('a');
      link.download = `Graph-${Date.now()}.svg`;
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

  created() {
    const graphId = Number.parseInt(this.$route.params.graphId, 10);
    const graphById = this.graphs.find(g => g.id === graphId);
    if (graphById) {
      this.graph = new Graph(graphById);
    } else {
      this.$router.push('/');
    }
  }

  @Watch('config.mode')
  onModeChange(mode: string) {
    if (mode !== 'edit') {
      this.setSelected();
    }
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
