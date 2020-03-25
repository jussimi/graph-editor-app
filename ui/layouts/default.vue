<template>
  <v-app id="inspire">
    <v-navigation-drawer :value="drawer" app>
      <v-list dense>
        <v-list-item>
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-action>
            <v-icon>mdi-mail</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Contact</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Application</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="!loggedIn">
        <v-btn @click="openModal('login')">Login</v-btn>
        <v-btn @click="openModal('register')">Register</v-btn>
      </template>
      <template v-else>
        <v-btn @click="logout">Logout</v-btn>
      </template>
    </v-app-bar>
    <v-content>
      <v-container fill-height>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2020 @Jamaik</span>
    </v-footer>
    <LoginAndRegisterForm v-model="loginModal.open" :type="loginModal.type" />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import LoginAndRegisterForm from '../components/LoginAndRegisterForm.vue';

@Component({
  components: {
    LoginAndRegisterForm
  },
  middleware: 'authAndRedirect'
})
export default class DefaultLayout extends Vue {
  drawer = false;

  loginModal = {
    type: 'login',
    open: false
  };

  openModal(type: string) {
    this.loginModal = {
      open: true,
      type
    };
  }

  get loggedIn(): boolean {
    return this.$accessor.loggedIn;
  }

  logout() {
    if (this.loggedIn) {
      this.$accessor.logout(undefined);
    }
  }
}
</script>
