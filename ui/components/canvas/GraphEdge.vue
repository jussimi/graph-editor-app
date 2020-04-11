<template>
  <svg class="graph-editor-edge" :class="{ selected: isSelected }">
    <defs>
      <!-- NOTE: This defines a global-marker for this specific color (color added to id) -->
      <!-- If another Edge has the same color, then this won't be redefined -->
      <marker
        :id="`arrow-${edge.fill}`"
        :fill="edge.fill"
        viewBox="0 0 10 10"
        markerUnits="strokeWidth"
        refX="6"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
        style="overflow: visible;"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
    <line v-if="isSelected" :x1="edge.x1" :y1="edge.y1" :x2="edge.x2" :y2="edge.y2" :style="selected"></line>
    <line
      :key="`edge-${edge.id}`"
      :x1="edge.x1"
      :y1="edge.y1"
      :x2="edge.x2"
      :y2="edge.y2"
      :marker-end="edge.isDirected ? `url(#arrow-${edge.fill})` : ''"
      :style="edgeStyle"
      @pointerdown.stop="pointerDown"
    ></line>
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import { Edge } from '@/types';

@Component
export default class GraphEdge extends Vue {
  @Prop({ type: Object, required: true }) edge!: Edge & { x1: number; x2: number; y1: number; y2: number };

  @Prop({ type: Object, required: true }) styles!: Record<string, any>;

  @Prop({ type: Boolean, default: false }) isSelected!: boolean;

  get edgeStyle() {
    return { ...this.styles, stroke: this.edge.fill, 'stroke-width': this.edge.width };
  }

  get selected() {
    return { stroke: 'cyan', 'stroke-width': 1.7 * this.edge.width };
  }

  clickTimer: NodeJS.Timer | null = null;

  pointerDown(event: PointerEvent) {
    event.preventDefault();
    if (this.clickTimer === null) {
      // FIRST CLICK.
      // Start a timer that resets the click-state if a second click isn't detected.
      const delay = 500;
      this.clickTimer = setTimeout(() => {
        this.clickTimer = null;
      }, delay);
    } else {
      // SECOND CLICK:
      this.$emit('select');
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
  }
}
</script>

<style scoped>
.selected {
  stroke: cyan;
  stroke-width: 14px;
}
</style>
