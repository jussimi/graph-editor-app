import { NuxtCookies } from 'cookie-universal-nuxt';
import { accessorType } from '@/store';

declare module 'vue/types/vue' {
  interface Vue {
    $accessor: typeof accessorType;
    $cookies: NuxtCookies;
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $accessor: typeof accessorType;
    $cookies: NuxtCookies;
  }
}
