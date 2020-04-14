<template>
  <div class="text-center">
    <v-dialog v-model="dialog" max-width="400px">
      <template v-slot:activator="{ on }">
        <v-btn icon medium v-on="on">
          <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-text class="py-3">
          <span v-for="(text, idx) in texts" :key="idx">
            {{ text }}
            <v-divider v-if="idx < texts.length - 1" class="my-2" />
          </span>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class HelpModal extends Vue {
  dialog = false;

  texts = [
    `Create nodes by selecting NODE from the toolbar and clicking
      to the position you wish to set it. Nodes can be dragged around.`,
    'Create edges by selecting EDGE from the toolbar and then drag from the start node to the target node.',
    'You can edit nodes and edges by double-clicking the element you wish to edit.',
  ];
}
</script>
