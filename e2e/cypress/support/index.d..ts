export {};

// NOTE: Nuxt saves the store to the window object when the client is Cypress.
// This way we can use the actions from the app from cypress.
declare global {
  interface Window {
    store: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(action: string, params: any): any;
    };
  }
}
window.store = window.store || {};
