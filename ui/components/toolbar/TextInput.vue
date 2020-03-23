<template>
  <v-text-field
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
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ColorPicker extends Vue {
  @Prop({ type: [String, Number], default: 'text' }) value!: string | number;
  @Prop({ type: Array }) rules!: Function[];
  @Prop({ type: String }) type!: 'text' | 'number';
}
</script>
