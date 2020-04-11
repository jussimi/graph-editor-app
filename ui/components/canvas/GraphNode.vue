<template>
  <svg
    :key="`node-${node.id}`"
    class="graph-editor-node"
    :class="{ selected: isSelected }"
    :x="node.x - radius"
    :y="node.y - radius"
    :width="2 * radius"
    :height="2 * radius"
    @pointerdown.stop="pointerDown"
  >
    <circle v-if="isSelected" :cx="radius" :cy="radius" :r="radius" fill="cyan" :style="styles"></circle>
    <circle :cx="radius" :cy="radius" :r="radius - offset" :fill="node.fill" :style="styles"></circle>
    <text
      x="50%"
      y="50%"
      text-anchor="middle"
      font-family="Verdana"
      font-size="50"
      dy=".3em"
      style="pointer-events: none;"
      :style="styles"
      :fill="node.color"
    >
      {{ node.content }}
    </text>
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import { Node } from '@/types';

@Component
export default class GraphNode extends Vue {
  @Prop({ type: Object, required: true }) node!: Node;

  @Prop({ type: Object, required: true }) styles!: Record<string, any>;

  @Prop({ type: Boolean, default: false }) isSelected!: boolean;

  get radius() {
    return this.node.radius;
  }

  get offset() {
    return this.isSelected ? 0.15 * this.node.radius : 0;
  }

  clickTimer: NodeJS.Timer | null = null;

  pointerDown(event: PointerEvent) {
    event.preventDefault();
    if (this.clickTimer === null) {
      // FIRST CLICK.
      // Start a timer that resets the click-state if a second click isn't detected.
      this.$emit('action', event);
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

<style scoped></style>
