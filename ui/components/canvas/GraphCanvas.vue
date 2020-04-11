<template>
  <svg
    id="graph-editor-canvas"
    ref="graph"
    width="100%"
    preserveAspectRatio="xMinYMax meet"
    :viewBox="viewBoxString"
    :style="graphStyles"
    style="touch-action: none;"
    @pointerover="toggleHovering(true)"
    @pointerleave="toggleHovering(false)"
    @pointermove.prevent="handleMove"
    @pointerup.prevent="handlePointerUp"
    @pointerdown.prevent="handlePointerdown($event)"
  >
    <text
      v-if="disabled"
      x="50%"
      y="50%"
      dominant-baseline="middle"
      text-anchor="middle"
      font-size="100"
      style="pointer-events: none;"
    >
      Choose or create a new graph.
    </text>
    <!-- EDGES -->
    <GraphEdge
      v-for="edge in edgesWithPosition"
      :key="`edge-${edge.id}`"
      :edge="edge"
      :isSelected="state.selected.type === 'edge' && state.selected.value.id === edge.id"
      :styles="elementStyles"
      @select="actions.setSelected('edge', edge.id)"
    />
    <template v-if="config.mode === 'edge' && newEdge">
      <GraphEdge :edge="newEdge" :styles="elementStyles" />
    </template>
    <!-- NODES -->
    <GraphNode
      v-for="node in nodes"
      :key="`node-${node.id}`"
      :node="node"
      :isSelected="state.selected.type === 'node' && state.selected.value.id === node.id"
      :styles="elementStyles"
      @select="actions.setSelected('node', node.id)"
      @action="handlePointerdown($event, node.id)"
    />
    <template v-if="config.mode === 'node' && isHovering && newNode">
      <GraphNode :node="newNode" :styles="elementStyles" @action="handlePointerdown($event)" />
    </template>
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator';

// Components
import GraphEdge from './GraphEdge.vue';
import GraphNode from './GraphNode.vue';
import { Node, Edge, EditorConfig, EditorState, EditorActions } from '@/types';

interface Position {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  components: {
    GraphEdge,
    GraphNode,
  },
})
export default class GraphCanvas extends Vue {
  @Prop({ type: Array, default: () => [] }) nodes!: Node[];
  @Prop({ type: Array, default: () => [] }) edges!: Edge[];
  @Prop({ type: Object, required: true }) actions!: EditorActions;
  @Prop({ type: Object, required: true }) state!: EditorState;
  @Prop({ type: Object, required: true }) config!: EditorConfig;

  isHovering = false;

  panX = 0;
  panY = 0;

  newNode: Node | null = null;
  newEdge: (Partial<Edge> & Position) | null = null;
  // Drag-state
  draggedNodeId = 0;
  dragX: number | null = null;
  dragY: number | null = null;

  get viewBoxString() {
    const { size, ratio } = this.state;
    return `${this.panX} ${this.panY} ${size * ratio} ${size}`;
  }

  get disabled(): boolean {
    return this.state.disabled;
  }

  get downloading(): boolean {
    return this.state.downloading;
  }

  get elementStyles(): Record<string, any> {
    const cursor = this.dragX != null ? 'grabbing' : 'grab';
    return {
      cursor: this.downloading ? 'default' : cursor,
    };
  }

  get graphStyles(): Record<string, any> {
    return {
      cursor: this.dragX != null ? 'grabbing' : 'default',
      'pointer-events': this.disabled ? 'none' : undefined,
    };
  }

  get draggedNode(): Node | undefined {
    return this.nodes.find((node) => node.id === this.draggedNodeId);
  }

  // TODO: Improve this. Probably quite inefficient.
  get edgesWithPosition(): (Edge & Position)[] {
    const marker = 12; // The marker makes the line a bit longer, which this accounts for.
    const mappedEdges = this.edges.map((edge) => {
      const source = this.nodes.find((node) => node.id === edge.sourceId);
      const target = this.nodes.find((node) => node.id === edge.targetId);
      if (source && target) {
        // Two cases for drawing the connector line:
        //  - Undirected:
        //    - draw the line from the centers of the nodes.
        //  - Directed:
        //    - we have to "shorten" the connecting vector, while preserving the same angle.
        //    - the calculations are just basic analytic geometry.
        const directed = edge.isDirected ? 1 : 0;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const s = directed * ((target.radius + marker) / Math.sqrt(dx * dx + dy * dy));
        return {
          ...edge,
          x1: source.x,
          y1: source.y,
          x2: target.x - s * dx,
          y2: target.y - s * dy,
        };
      }
      return undefined;
    });
    return mappedEdges.filter((e) => !!e) as (Edge & Position)[];
  }

  toggleHovering(hovering: boolean) {
    this.isHovering = hovering;
    if (!hovering) {
      // Reset drag-state.
      this.dragX = this.dragY = null;
      this.draggedNodeId = 0;
      this.newEdge = null;
    }
  }

  // TODO: Simplify. Looks quite ugly.
  handlePointerdown(event: PointerEvent, nodeId?: number) {
    const { x, y } = this.getCoordinates(event);
    if (nodeId) {
      // Set dragged-node
      this.draggedNodeId = nodeId;
      if (this.draggedNode) {
        this.dragX = x - this.draggedNode.x;
        this.dragY = y - this.draggedNode.y;
        if (this.config.mode === 'edge') {
          // Start dragging an edge from the specified node.
          this.newEdge = {
            x1: this.draggedNode.x,
            y1: this.draggedNode.y,
            x2: x,
            y2: y,
            fill: this.config.fill,
            isDirected: this.config.isDirected,
            width: this.config.width,
          };
        }
      }
    } else {
      // CASE 2: Click detected elsewhere
      //  - If we are creating a new node, then place the node in the click-position.
      if (this.config.mode === 'node') {
        let nodeToAdd: Node | undefined;
        if (this.newNode) {
          nodeToAdd = this.newNode;
          nodeToAdd.setPosition(x, y);
          this.newNode = null;
        } else {
          nodeToAdd = new Node({
            id: this.state.nextNodeId,
            fill: this.config.fill,
            color: this.config.color,
            radius: this.config.radius,
            x,
            y,
          });
        }
        this.actions.addNode(nodeToAdd);
      } else {
        this.dragX = x;
        this.dragY = y;
      }
      // Reset selected.
      this.actions.setSelected();
    }
  }

  handlePointerUp(event: PointerEvent) {
    if (this.config.mode === 'edge' && this.draggedNode) {
      const { x, y } = this.getCoordinates(event);
      // Find the nodes that are under the pointer-event.
      // TODO: Figure out which one to choose if there is multiple
      const nodesUnderPointer = this.nodes.filter(
        (n) => Math.abs(n.x - x) <= n.radius && Math.abs(n.y - y) <= n.radius
      );
      const nodeId = nodesUnderPointer[0] && nodesUnderPointer[0].id;
      if (nodeId && nodeId !== this.draggedNode.id) {
        // If the mouseUp was triggered from a node that isn't the draggedNode,
        //  create a new edge from the draggedNode to the sourceNode
        const newEdge = new Edge({
          sourceId: this.draggedNode.id,
          targetId: nodeId,
          fill: this.config.fill,
          isDirected: this.config.isDirected,
          width: this.config.width,
        });
        this.actions.addEdge(newEdge);
      }
    }
    // Reset drag-state.
    this.dragX = this.dragY = null;
    this.draggedNodeId = 0;
    this.newEdge = null;
  }

  handleMove(event: PointerEvent) {
    const { x, y } = this.getCoordinates(event);
    // CASE 1: MODE === 'node'
    if (this.config.mode === 'node') {
      // Move the new node along with the cursor.
      if (this.newNode) {
        this.newNode.setPosition(x, y);
      } else {
        this.newNode = new Node({
          id: this.state.nextNodeId,
          fill: this.config.fill,
          color: this.config.color,
          radius: this.config.radius,
          x,
          y,
        });
      }
    }
    // CASE 2: MODE === 'edge'
    else if (this.config.mode === 'edge') {
      if (this.draggedNode) {
        // Move the new edge while dragging an edge from the source-node
        this.newEdge = {
          x1: this.draggedNode.x,
          y1: this.draggedNode.y,
          x2: x,
          y2: y,
          fill: this.config.fill,
          isDirected: this.config.isDirected,
          width: this.config.width,
        };
      }
    }
    // CASE 3: MODE === 'edit'
    else if (this.draggedNode) {
      // Drag a node.
      this.draggedNode.setPosition(x - (this.dragX || 0), y - (this.dragY || 0));
      // this.actions.updateNode()
    } else if (this.dragX != null && this.dragY != null) {
      // Move the viewBox
      const sensitivity = 3;
      this.panX = this.panX - (x - this.dragX) / sensitivity;
      this.panY = this.panY - (y - this.dragY) / sensitivity;
    }
  }

  // Find the svg-coordinates based on the pointer-position.
  getCoordinates(event: PointerEvent): SVGPoint {
    const svg = this.$refs.graph as SVGSVGElement;
    const m = svg.getScreenCTM();
    let p = svg.createSVGPoint();
    if (m) {
      p.x = event.clientX;
      p.y = event.clientY;
      p = p.matrixTransform(m.inverse());
    }
    return p;
  }

  @Watch('config', { deep: true })
  onConfigChange(newConfig: EditorConfig) {
    if (this.newNode) {
      this.newNode.fill = newConfig.fill;
      this.newNode.color = newConfig.color;
      this.newNode.radius = newConfig.radius;
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
