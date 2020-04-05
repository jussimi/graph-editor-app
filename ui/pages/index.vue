<template>
  <v-layout>
    <v-flex class="text-center">
      <GraphEditorContainer />
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import GraphEditorContainer from '@/components/GraphContainer.vue';

@Component({
  components: {
    GraphEditorContainer,
  },
})
export default class IndexPage extends Vue {}
</script>
