<template>
  <v-toolbar dense>
    <v-toolbar-title>{{ name }} </v-toolbar-title>

    <v-divider vertical class="mx-4"></v-divider>

    <v-btn-toggle :value="modeButtons.indexOf(config.mode.value)" dense>
      <v-btn
        v-for="(mode, idx) of modeButtons"
        :id="mode.id"
        :key="idx"
        @click="actions.setConfig({ ...config, mode: mode.value })"
      >
        {{ mode.value }}
      </v-btn>
    </v-btn-toggle>

    <v-divider vertical class="mx-4"></v-divider>

    <v-btn-toggle v-model="actionButton" dense @change="resetActiveButton">
      <v-btn
        v-for="(btn, idx) of actionButtons"
        :id="btn.id"
        :key="idx"
        :disabled="btn.disabled"
        @click="doAction(btn.action)"
      >
        {{ btn.label }}
      </v-btn>
    </v-btn-toggle>

    <v-spacer></v-spacer>

    <template v-slot:extension align>
      <v-row align="center">
        <template v-if="config.mode === 'node'">
          <TextInput
            id="node-radius-field"
            :value="config.radius"
            class="t-input mx-3"
            type="number"
            @input="setConfig({ radius: $event })"
          />
          <ColorInput id="node-fill-field" :value="config.fill" class="mx-3" @input="setConfig({ fill: $event })" />
          <ColorInput id="node-color-field" :value="config.color" class="mx-3" @input="setConfig({ color: $event })" />
        </template>
        <template v-else-if="config.mode === 'edge'">
          <TextInput
            id="edge-width-field"
            :value="config.width"
            class="t-input mx-3"
            type="number"
            @input="setConfig({ width: $event })"
          />
          <ColorInput id="edge-fill-field" :value="config.fill" class="mx-3" @input="setConfig({ fill: $event })" />
          <v-switch
            id="edge-directed-toggle"
            :input-value="config.isDirected"
            class="mx-3"
            hide-details
            @change="setConfig({ isDirected: !!$event })"
          ></v-switch>
        </template>
        <template v-else-if="selectedNode">
          <TextInput
            id="node-radius-field"
            :value="selectedNode.radius"
            class="t-input mx-3"
            type="number"
            @input="updateNode({ radius: $event })"
          />
          <TextInput
            id="node-content-field"
            :value="selectedNode.content"
            class="t-input mx-3"
            @input="updateNode({ content: $event })"
          />
          <ColorInput
            id="node-fill-field"
            :value="selectedNode.fill"
            class="mx-3"
            @input="updateNode({ fill: $event })"
          />
          <ColorInput
            id="node-color-field"
            :value="selectedNode.color"
            class="mx-3"
            @input="updateNode({ color: $event })"
          />
          <v-btn id="node-delete-button" icon @click="actions.deleteNode(selectedNode)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-else-if="selectedEdge">
          <TextInput
            id="edge-width-field"
            :value="selectedEdge.width"
            class="t-input mx-3"
            type="number"
            @input="updateEdge({ width: $event })"
          />
          <ColorInput
            id="edge-fill-field"
            :value="selectedEdge.fill"
            class="mx-3"
            @input="updateEdge({ fill: $event })"
          />
          <v-switch
            id="edge-directed-toggle"
            :input-value="selectedEdge.isDirected"
            class="mx-3"
            hide-details
            @change="updateEdge({ isDirected: !!$event })"
          ></v-switch>
          <v-btn id="edge-delete-button" icon @click="actions.deleteEdge(selectedEdge)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-else-if="!isTrial">
          <TextInput
            id="graph-name-field"
            :value="name"
            class="mx-3"
            :rules="[(v) => v.length > 2 || 'too-short']"
            style="max-width: 200px;"
            @input="updateName($event)"
          />
          <v-btn id="graph-delete-button" icon @click="actions.doDelete()">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <div v-else id="trial-graph-text" class="mx-2">Login or register to save and download graphs</div>
      </v-row>
    </template>
  </v-toolbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';

import ColorInput from './ColorInput.vue';
import TextInput from './TextInput.vue';
import { EditorConfig, EditorState, Node, Edge, EditorActions } from '@/types';

@Component({
  components: {
    ColorInput,
    TextInput,
  },
})
export default class GraphToolbar extends Vue {
  @Prop({ type: Boolean, required: true }) isTrial!: boolean;
  @Prop({ type: String, required: true }) name!: string;
  @Prop({ type: Object, required: true }) actions!: EditorActions;
  @Prop({ type: Object, required: true }) state!: EditorState;
  @Prop({ type: Object, required: true }) config!: EditorConfig;

  modeButtons = [
    { id: 'mode-edit-button', value: 'edit' },
    { id: 'mode-node-button', value: 'node' },
    { id: 'mode-edge-button', value: 'edge' },
  ];

  get actionButtons() {
    return [
      { id: 'set-layout-button', action: 'setLayout', label: 'normalize', disabled: false },
      { id: 'save-graph-button', action: 'doSave', label: 'save', disabled: this.isTrial },
      { id: 'download-svg-button', action: 'downloadSvg', label: 'download', disabled: this.isTrial },
    ];
  }

  get selectedNode(): Node | undefined {
    const { type, value } = this.state.selected;
    return type === 'node' ? (value as Node) : undefined;
  }

  get selectedEdge(): Edge | undefined {
    const { type, value } = this.state.selected;
    return type === 'edge' ? (value as Edge) : undefined;
  }

  setConfig(updated: Partial<EditorConfig>) {
    this.actions.setConfig({ ...this.config, ...updated });
  }

  updateNode(updated: Partial<Node>) {
    if (this.selectedNode) {
      this.actions.updateNode(new Node({ ...this.selectedNode, ...updated }));
    }
  }

  updateEdge(updated: Partial<Edge>) {
    if (this.selectedEdge) {
      this.actions.updateEdge(new Edge({ ...this.selectedEdge, ...updated }));
    }
  }

  updateName(name: string) {
    if (name.length > 2) {
      this.actions.updateName(name);
    }
  }

  actionButton = null;
  doAction(actionName: 'setLayout' | 'doSave' | 'downloadSvg') {
    this.actions[actionName]();
  }

  resetActiveButton() {
    this.$nextTick(() => {
      this.actionButton = null;
    });
  }
}
</script>

<style scoped>
.t-input {
  max-width: 50px;
}
</style>
