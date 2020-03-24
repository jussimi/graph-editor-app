<template>
  <v-dialog :value="value" persistent max-width="600px">
    <v-card class="elevation-12">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>{{ title }} form</v-toolbar-title>
        <v-spacer />
      </v-toolbar>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="email"
            :rules="[emailValidation]"
            label="Email"
            name="email"
            prepend-icon="mdi-email"
            type="text"
          />
          <v-text-field
            v-model="password"
            :rules="[v => v.length > 5 || 'Length must be at least 6 characters']"
            label="Password"
            name="password"
            prepend-icon="mdi-lock"
            type="password"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="$emit('input', false)">Cancel</v-btn>
        <v-btn color="primary" :loading="loading" @click="doAction">{{ type }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class LoginForm extends Vue {
  @Prop(Boolean) value!: boolean;
  @Prop({ type: String, required: true }) type!: 'login' | 'register';

  loading = false;

  email = '';

  password = '';

  get title() {
    return this.type === 'login' ? 'Login' : 'Register';
  }

  emailValidation(value: string) {
    if (value.length > 0) {
      const pattern = /\S+@\S+\.\S+/;
      return pattern.test(value) || 'Invalid e-mail';
    }
    return 'Invalid e-mail.';
  }

  async doAction() {
    if (this.type === 'register') {
      this.loading = true;
      await this.$accessor.register({ email: this.email, password: this.password });
      this.loading = false;
      this.$emit('input', false);
    } else if (this.type === 'login') {
      this.loading = true;
      await this.$accessor.login({ email: this.email, password: this.password });
      this.loading = false;
      this.$emit('input', false);
    }
  }
}
</script>
