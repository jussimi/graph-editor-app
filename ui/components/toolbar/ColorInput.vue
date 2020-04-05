<template>
  <v-menu v-model="menu" bottom offset-y :close-on-content-click="false">
    <template v-slot:activator="{ on }">
      <div class="mx-3" :style="swatchStyle" v-on="on" />
    </template>
    <v-card>
      <v-card-text class="pa-0">
        <v-color-picker width="200" hide-inputs :value="value" flat @input="$emit('input', $event)" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class ColorPicker extends Vue {
  @Prop({ type: String }) value!: string;

  menu = false;

  get swatchStyle() {
    const { value, menu } = this;
    return {
      backgroundColor: value,
      cursor: 'pointer',
      height: '30px',
      width: '30px',
      borderRadius: menu ? '50%' : '4px',
      border: '1px solid black',
      transition: 'border-radius 200ms ease-in-out',
    };
  }
}
</script>
