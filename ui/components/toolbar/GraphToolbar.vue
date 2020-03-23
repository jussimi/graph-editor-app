<template>
  <v-app-bar app dense>
    <slot></slot>
    <v-toolbar-title>{{ name }} </v-toolbar-title>

    <v-divider vertical class="mx-4"></v-divider>

    <v-btn-toggle :value="modeButtons.indexOf(config.mode)" dense>
      <v-btn v-for="(mode, idx) of modeButtons" :key="idx" @click="actions.setConfig({ ...config, mode })">
        {{ mode }}
      </v-btn>
    </v-btn-toggle>

    <v-divider vertical class="mx-4"></v-divider>

    <v-btn-toggle v-model="actionButton" dense @change="resetActiveButton">
      <v-btn v-for="(name, action) of actionButtons" :key="action" @click="doAction(action)">
        {{ name }}
      </v-btn>
    </v-btn-toggle>

    <v-spacer></v-spacer>

    <template v-slot:extension align>
      <v-row align="center" class="mx-6">
        <template v-if="config.mode === 'node'">
          <TextInput :value="config.radius" class="t-input mx-3" type="number" @input="setConfig({ radius: $event })" />
          <ColorInput :value="config.fill" class="mx-3" @input="setConfig({ fill: $event })" />
          <ColorInput :value="config.color" class="mx-3" @input="setConfig({ color: $event })" />
        </template>
        <template v-else-if="config.mode === 'edge'">
          <TextInput :value="config.width" class="t-input mx-3" type="number" @input="setConfig({ width: $event })" />
          <ColorInput :value="config.fill" class="mx-3" @input="setConfig({ fill: $event })" />
          <v-switch
            :input-value="config.isDirected"
            class="mx-3"
            hide-details
            @change="setConfig({ isDirected: !!$event })"
          ></v-switch>
        </template>
        <template v-else-if="selectedNode">
          <TextInput
            :value="selectedNode.radius"
            class="t-input mx-3"
            type="number"
            @input="updateNode({ radius: $event })"
          />
          <TextInput :value="selectedNode.content" class="t-input mx-3" @input="updateNode({ content: $event })" />
          <ColorInput :value="selectedNode.fill" class="mx-3" @input="updateNode({ fill: $event })" />
          <ColorInput :value="selectedNode.color" class="mx-3" @input="updateNode({ color: $event })" />
          <v-btn icon @click="actions.deleteNode(selectedNode)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-else-if="selectedEdge">
          <TextInput
            :value="selectedEdge.width"
            class="t-input mx-3"
            type="number"
            @input="updateEdge({ width: $event })"
          />
          <ColorInput :value="selectedEdge.fill" class="mx-3" @input="updateEdge({ fill: $event })" />
          <v-switch
            :input-value="selectedEdge.isDirected"
            class="mx-3"
            hide-details
            @change="updateEdge({ isDirected: !!$event })"
          ></v-switch>
          <v-btn icon @click="actions.deleteEdge(selectedEdge)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-else>
          <TextInput
            :value="name"
            class="mx-3"
            :rules="[v => v.length > 2 || 'too-short']"
            style="max-width: 200px"
            @input="updateName($event)"
          />
          <v-btn icon>
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-row>
    </template>
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { EditorConfig, EditorState, Node, Edge, EditorActions } from '../../typescript';

import ColorInput from './ColorInput.vue';
import TextInput from './TextInput.vue';

@Component({
  components: {
    ColorInput,
    TextInput
  }
})
export default class GraphToolbar extends Vue {
  @Prop({ type: String, required: true }) name!: string;
  @Prop({ type: Object, required: true }) actions!: EditorActions;
  @Prop({ type: Object, required: true }) state!: EditorState;
  @Prop({ type: Object, required: true }) config!: EditorConfig;

  modeButtons = ['edit', 'node', 'edge'];

  actionButtons = { setLayout: 'normalize', doSave: 'save', downloadSvg: 'download' };

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
