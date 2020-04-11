<template>
  <v-app id="inspire">
    <v-navigation-drawer :value="drawer" app>
      <v-list>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-group value="true">
          <template v-slot:activator>
            <v-list-item-title>Graphs</v-list-item-title>
          </template>

          <v-list-item v-for="graph in graphs" :key="graph.id" link>
            <v-list-item-title>{{ graph.name }}</v-list-item-title>
          </v-list-item>
          <v-list-group sub-group no-action>
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>Actions</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item v-for="(crud, i) in cruds" :key="i">
              <v-list-item-title v-text="crud[0]"></v-list-item-title>
              <v-list-item-action>
                <v-icon v-text="`mdi-${crud[1]}`"></v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <!-- -->
    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Application</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="!loggedIn">
        <v-btn id="login-modal-activator" @click="openModal('login')">Login</v-btn>
        <v-btn id="register-modal-activator" @click="openModal('register')">Register</v-btn>
      </template>
      <template v-else>
        <v-btn id="logout-button" @click="logout">Logout</v-btn>
      </template>
    </v-app-bar>

    <!-- -->
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
import { Graph } from '../types';

@Component({
  components: {
    LoginAndRegisterForm,
  },
  middleware: 'authAndRedirect',
})
export default class DefaultLayout extends Vue {
  drawer = false;

  loginModal = {
    type: 'login',
    open: false,
  };

  cruds = [
    ['Create', 'add'],
    ['Read', 'insert_drive_file'],
    ['Update', 'update'],
    ['Delete', 'delete'],
  ];

  openModal(type: string) {
    this.loginModal = {
      open: true,
      type,
    };
  }

  get graphs(): Graph[] {
    return this.$accessor.graphs;
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
