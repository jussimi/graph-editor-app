<template>
  <v-dialog :value="open" max-width="290" @input="onCancel">
    <v-card>
      <v-card-title class="headline">
        <slot name="title">Are you sure?</slot>
      </v-card-title>

      <v-card-text>
        <slot name="content"></slot>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn data-cy="confirm-dialog-cancel" color="green darken-1" text @click="onCancel">
          cancel
        </v-btn>

        <v-btn data-cy="confirm-dialog-confirm" color="green darken-1" text @click="onConfirm">
          confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class Confirm extends Vue {
  @Prop({ type: Boolean, required: true }) open!: boolean;
  @Prop({ type: Function, required: true }) onCancel!: () => void;
  @Prop({ type: Function, required: true }) onConfirm!: () => void;
}
</script>
