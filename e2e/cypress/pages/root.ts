export default class RootPage {
  title: string;
  constructor() {
    this.title = 'graph-editor-app - graph-editor-app';
  }

  open(): void {
    cy.visit('/');
  }
}
