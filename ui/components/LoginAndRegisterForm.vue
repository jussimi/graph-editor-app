<template>
  <v-dialog :value="value" persistent max-width="600px">
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="doAction">
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>{{ title }} form</v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <v-card-text>
          <v-text-field
            :value="email"
            :rules="[emailRules]"
            label="Email"
            name="email"
            prepend-icon="mdi-email"
            type="text"
            @input="setEmail"
          />
          <v-text-field
            :value="password"
            :rules="[v => (v && v.length > 5) || 'Length must be at least 6 characters']"
            label="Password"
            name="password"
            prepend-icon="mdi-lock"
            type="password"
            @input="setPassword"
          />
          <p v-if="error" class="mx-auto my-0" style="color: red">
            {{ error }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="$emit('input', false)">Cancel</v-btn>
          <v-btn color="primary" type="submit" :loading="loading" @click="doAction">{{ type }}</v-btn>
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

  async doAction() {
    this.$refs.form.validate();
    if (!this.valid) {
      return;
    }
    let success = false;
    if (this.type === 'register') {
      this.loading = true;
      success = await this.$accessor.register({ email: this.email, password: this.password });
    } else if (this.type === 'login') {
      this.loading = true;
      success = await this.$accessor.login({ email: this.email, password: this.password });
    }
    this.loading = false;
    if (success) {
      this.$emit('input', false);
    } else {
      this.error = 'Oops, something went wrong. Try Again.';
    }
  }

  @Watch('value')
  onValueChange(newVal: boolean) {
    if (!newVal) {
      this.$refs.form.reset();
    }
  }
}
</script>
