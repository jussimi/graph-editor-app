<template>
  <v-app id="inspire">
    <v-navigation-drawer :value="drawer" app>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">Account</v-list-item-title>
            <v-list-item-subtitle>{{ $accessor.email }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon>mdi-account-box</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-group value="true" prepend-icon="mdi-axis-arrow" no-action>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Graphs</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="graph in graphs"
            :key="graph.id"
            data-cy="nav-graph-link"
            link
            :to="`/graphs/${graph.id}`"
          >
            <v-list-item-content>
              <v-list-item-title>{{ graph.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <v-list-item data-cy="nav-create-graph-link" link @click="createGraph">
          <v-list-item-icon>
            <v-icon>mdi-plus-box-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Create new</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            data-cy="remove-account-modal-activator"
            block
            outlined
            color="indigo"
            @click="removeAccountModalOpen = true"
            >Remove account</v-btn
          >
        </div>
      </template>
    </v-navigation-drawer>

    <!-- -->
    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon
        v-if="loggedIn"
        data-cy="nav-activator-icon"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Graph editor</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="!loggedIn">
        <v-btn data-cy="login-modal-activator" class="mx-1" @click="openModal('login')">Login</v-btn>
        <v-btn data-cy="register-modal-activator" @click="openModal('register')">Register</v-btn>
      </template>
      <template v-else>
        <v-btn data-cy="logout-button" @click="logout">Logout</v-btn>
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
    <RemoveAccountForm v-model="removeAccountModalOpen" @success="drawer = false" />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import LoginAndRegisterForm from '../components/LoginAndRegisterForm.vue';
import RemoveAccountForm from '../components/RemoveAccountForm.vue';
import { Graph } from '../types';

@Component({
  components: {
    LoginAndRegisterForm,
    RemoveAccountForm,
  },
  middleware: 'authAndRedirect',
})
export default class DefaultLayout extends Vue {
  drawer = false;

  loginModal = {
    type: 'login',
    open: false,
  };

  removeAccountModalOpen = false;

  openModal(type: string) {
    this.loginModal = {
      open: true,
      type,
    };
  }

  createGraph(): void {
    this.$accessor.createGraph(new Graph({ name: `Graph-${Date.now()}` }));
  }

  get activeGraphIdx(): number {
    const graphIdInRoute = Number.parseInt(this.$route.params.graphId, 10);
    return this.graphs.findIndex((g) => g.id === graphIdInRoute);
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
