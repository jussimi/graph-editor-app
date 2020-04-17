<template>
  <v-dialog :value="value" persistent max-width="600px">
    <v-form ref="form" v-model="valid" data-cy="login-and-register-form" lazy-validation @submit.prevent="doAction">
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>{{ title }} form</v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <v-card-text>
          <v-text-field
            data-cy="form-email-field"
            :value="email"
            :rules="[emailRules]"
            label="Email"
            name="email"
            prepend-icon="mdi-email"
            type="text"
            @input="setEmail"
          />
          <v-text-field
            data-cy="form-password-field"
            :value="password"
            :rules="[(v) => (v && v.length > 5) || 'Length must be at least 6 characters']"
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
          <v-btn data-cy="form-submit-btn" color="primary" type="submit" :loading="loading">{{ type }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator';

@Component
export default class LoginForm extends Vue {
  @Prop(Boolean) value!: boolean;
  @Prop({ type: String, required: true }) type!: 'login' | 'register';

  $refs!: { form: HTMLFormElement };

  loading = false;

  email = '';

  password = '';

  valid = false;

  error = '';

  get title() {
    return this.type === 'login' ? 'Login' : 'Register';
  }

  setEmail(value: string) {
    this.email = value;
    this.error = '';
  }

  setPassword(value: string) {
    this.password = value;
    this.error = '';
  }

  emailRules(value: string | undefined = '') {
    if (value.length > 0) {
      const pattern = /\S+@\S+\.\S+/;
      return pattern.test(value) || 'Invalid e-mail';
    }
    return 'Invalid e-mail.';
  }

  setError(error: string) {
    if (error.includes('duplicate key value violates unique constraint "person_email_key"')) {
      this.error = 'An account for this email already exists. Try to login instead.';
    } else if (error.includes('wrong-password')) {
      this.error = 'The submitted password did not match the email. Try again.';
    } else if (error.includes('person-not-found')) {
      this.error = 'No account for this email was found. Register instead.';
    } else {
      this.error = 'Oops, something went wrong. Try Again.';
    }
  }

  async doAction() {
    await this.$refs.form.validate();
    if (!this.valid) {
      return;
    }
    let success = false;
    let error = '';
    if (this.type === 'register') {
      this.loading = true;
      ({ success, error = '' } = await this.$accessor.register({ email: this.email, password: this.password }));
    } else if (this.type === 'login') {
      this.loading = true;
      ({ success, error = '' } = await this.$accessor.login({ email: this.email, password: this.password }));
    }
    this.loading = false;
    if (success) {
      this.$emit('input', false);
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
