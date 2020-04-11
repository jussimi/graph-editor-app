export default class RootPage {
  title: string;
  constructor() {
    this.title = 'graph-editor-app - graph-editor-app';
  }

  open(): void {
    const path = 'http://localhost:3000';
    cy.visit(path);
  }
}
