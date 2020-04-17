<template>
  <v-dialog :value="value" persistent max-width="600px">
    <v-form ref="form" data-cy="remove-account-form" @submit.prevent="doAction">
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Removing account</v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <v-card-text>
          <p class="my-0 mx-auto" style="color: red;">
            Are you sure you want to do this? Removing your account will delete all your data.
            <br />
            Please type in your email and password to continue with this action.
          </p>
          <v-text-field
            data-cy="form-email-field"
            :value="email"
            label="Email"
            name="email"
            prepend-icon="mdi-email"
            type="text"
            @input="setEmail"
          />
          <v-text-field
            data-cy="form-password-field"
            :value="password"
            label="Password"
            name="password"
            prepend-icon="mdi-lock"
            type="password"
            @input="setPassword"
          />
          <p v-if="error" data-cy="form-error-message" class="mx-auto my-0" style="color: red;">
            {{ error }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn data-cy="form-cancel-btn" color="primary" @click="$emit('input', false)">Cancel</v-btn>
          <v-btn data-cy="form-submit-btn" color="primary" type="submit" :loading="loading">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator';

@Component
export default class RemoveAccountForm extends Vue {
  @Prop(Boolean) value!: boolean;

  $refs!: { form: HTMLFormElement };

  loading = false;

  email = '';

  password = '';

  valid = false;

  error = '';

  setEmail(value: string) {
    this.email = value;
    this.error = '';
  }

  setPassword(value: string) {
    this.password = value;
    this.error = '';
  }

  setError(error: string) {
    if (error.includes('wrong-password')) {
      this.error = 'The submitted password did not match the email. Try again.';
    } else {
      this.error = 'Oops, something went wrong. Try Again.';
    }
  }

  async doAction() {
    this.loading = true;
    const { success, error = '' } = await this.$accessor.unRegister({ email: this.email, password: this.password });
    this.loading = false;
    if (success) {
      this.$emit('input', false);
      this.$emit('success');
    } else {
      this.setError(error);
    }
  }

  @Watch('value')
  onValueChange() {
    if (this.$refs.form) {
      this.$refs.form.reset();
    }
  }
}
</script>
