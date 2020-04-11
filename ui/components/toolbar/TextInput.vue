<template>
  <v-text-field
    :data-cy="cy"
    :value="value"
    :rules="rules"
    hide-details
    class="ma-0 pa-0"
    :type="type"
    @input="$emit('input', $event)"
  >
  </v-text-field>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class ColorPicker extends Vue {
  @Prop({ type: String }) cy!: string;
  @Prop({ type: [String, Number] }) value!: string | number;
  @Prop({ type: Array }) rules!: Function[];
  @Prop({ type: String, default: 'text' }) type!: 'text' | 'number';
}
</script>
