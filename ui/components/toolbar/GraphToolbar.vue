<template>
  <v-toolbar dense>
    <v-toolbar-title>{{ name }} </v-toolbar-title>

    <v-divider vertical class="mx-4"></v-divider>

    <v-btn-toggle :value="modeButtons.indexOf(config.mode.value)" dense>
      <v-btn
        v-for="(mode, idx) of modeButtons"
        :key="idx"
        :data-cy="mode.cy"
        @click="actions.setConfig({ ...config, mode: mode.value })"
      >
        {{ mode.value }}
      </v-btn>
    </v-btn-toggle>

    <v-divider vertical class="mx-4"></v-divider>

    <v-btn-toggle v-model="actionButton" dense @change="resetActiveButton">
      <v-btn
        v-for="(btn, idx) of actionButtons"
        :key="idx"
        :data-cy="btn.cy"
        :disabled="btn.disabled"
        @click="doAction(btn.action)"
      >
        {{ btn.label }}
      </v-btn>
    </v-btn-toggle>

    <HelModal style="float: right;" />

    <v-spacer></v-spacer>

    <template v-slot:extension align>
      <v-row align="center">
        <template v-if="config.mode === 'node'">
          <TextInput
            :cy="'node-radius-field'"
            :value="config.radius"
            class="t-input mx-3"
            type="number"
            @input="setConfig({ radius: $event })"
          />
          <ColorInput :cy="'node-fill-field'" :value="config.fill" class="mx-3" @input="setConfig({ fill: $event })" />
          <ColorInput
            :cy="'node-color-field'"
            :value="config.color"
            class="mx-3"
            @input="setConfig({ color: $event })"
          />
        </template>
        <template v-else-if="config.mode === 'edge'">
          <TextInput
            :cy="'edge-width-field'"
            :value="config.width"
            class="t-input mx-3"
            type="number"
            @input="setConfig({ width: $event })"
          />
          <ColorInput :cy="'edge-fill-field'" :value="config.fill" class="mx-3" @input="setConfig({ fill: $event })" />
          <v-switch
            :cy="'edge-directed-toggle'"
            :input-value="config.isDirected"
            class="mx-3"
            hide-details
            @change="setConfig({ isDirected: !!$event })"
          ></v-switch>
        </template>
        <template v-else-if="selectedNode">
          <TextInput
            :cy="'node-radius-field'"
            :value="selectedNode.radius"
            class="t-input mx-3"
            type="number"
            @input="updateNode({ radius: $event })"
          />
          <TextInput
            :cy="'node-content-field'"
            :value="selectedNode.content"
            class="t-input mx-3"
            @input="updateNode({ content: $event })"
          />
          <ColorInput
            :cy="'node-fill-field'"
            :value="selectedNode.fill"
            class="mx-3"
            @input="updateNode({ fill: $event })"
          />
          <ColorInput
            :cy="'node-color-field'"
            :value="selectedNode.color"
            class="mx-3"
            @input="updateNode({ color: $event })"
          />
          <v-btn data-cy="node-delete-button" icon @click="actions.deleteNode(selectedNode)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-else-if="selectedEdge">
          <TextInput
            :cy="'edge-width-field'"
            :value="selectedEdge.width"
            class="t-input mx-3"
            type="number"
            @input="updateEdge({ width: $event })"
          />
          <ColorInput
            :cy="'edge-fill-field'"
            :value="selectedEdge.fill"
            class="mx-3"
            @input="updateEdge({ fill: $event })"
          />
          <v-switch
            data-cy="edge-directed-toggle"
            :input-value="selectedEdge.isDirected"
            class="mx-3"
            hide-details
            @change="updateEdge({ isDirected: !!$event })"
          ></v-switch>
          <v-btn data-cy="edge-delete-button" icon @click="actions.deleteEdge(selectedEdge)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-else-if="!isTrial">
          <TextInput
            :cy="'graph-name-field'"
            :value="name"
            class="mx-3"
            :rules="[(v) => v.length > 2 || 'too-short']"
            style="max-width: 200px;"
            @input="updateName($event)"
          />
          <v-btn data-cy="graph-delete-button" icon @click="actions.doDelete()">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <div v-else data-cy="trial-graph-text" class="mx-2">Login or register to save and download graphs</div>
      </v-row>
    </template>
  </v-toolbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';

import ColorInput from './ColorInput.vue';
import TextInput from './TextInput.vue';
import HelModal from './HelpModal.vue';
import { EditorConfig, EditorState, Node, Edge, EditorActions } from '@/types';

@Component({
  components: {
    ColorInput,
    TextInput,
    HelModal,
  },
})
export default class GraphToolbar extends Vue {
  @Prop({ type: Boolean, required: true }) isTrial!: boolean;
  @Prop({ type: String, required: true }) name!: string;
  @Prop({ type: Object, required: true }) actions!: EditorActions;
  @Prop({ type: Object, required: true }) state!: EditorState;
  @Prop({ type: Object, required: true }) config!: EditorConfig;

  modeButtons = [
    { cy: 'mode-edit-button', value: 'edit' },
    { cy: 'mode-node-button', value: 'node' },
    { cy: 'mode-edge-button', value: 'edge' },
  ];

  get actionButtons() {
    return [
      { cy: 'set-layout-button', action: 'setLayout', label: 'normalize', disabled: false },
      { cy: 'save-graph-button', action: 'doSave', label: 'save', disabled: this.isTrial },
      { cy: 'download-svg-button', action: 'downloadSvg', label: 'download', disabled: this.isTrial },
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
