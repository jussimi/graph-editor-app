import RootPage from './root';

class EditorPage extends RootPage {
  // CANVAS
  get graphEditorCanvas() {
    return cy.get('[data-cy=graph-editor-canvas]');
  }
  get graphEditorNodes() {
    return cy.get('[data-cy=graph-editor-node]');
  }
  get graphEditorEdges() {
    return cy.get('[data-cy=graph-editor-edge]');
  }
  get selectedNode() {
    return this.graphEditorEdges.filter('.selected');
  }
  get selectedEdge() {
    return this.graphEditorNodes.filter('.selected');
  }
  // TOOLBAR
  // Mode buttons
  get modeEditButton() {
    return cy.get('[data-cy=mode-edit-button]');
  }
  get modeNodeButton() {
    return cy.get('[data-cy=mode-node-button]');
  }
  get modeEdgeButton() {
    return cy.get('[data-cy=mode-edge-button]');
  }
  // Action buttons
  get setLayoutButton() {
    return cy.get('[data-cy=set-layout-button]');
  }
  get saveGraphButton() {
    return cy.get('[data-cy=save-graph-button]');
  }
  get donwloadSvgButton() {
    return cy.get('[data-cy=download-svg-button]');
  }
  // Node inputs and buttons.
  get nodeRadiusField() {
    return cy.get('[data-cy=node-radius-field]');
  }
  get nodeFillField() {
    return cy.get('[data-cy=node-fill-field]');
  }
  get nodeColorField() {
    return cy.get('[data-cy=node-color-field]');
  }
  get nodeContentField() {
    return cy.get('[data-cy=node-content-field]');
  }
  get nodeDeleteButton() {
    return cy.get('[data-cy=node-delete-button]');
  }
  // Edge inputs and buttons
  get edgeWidthField() {
    return cy.get('[data-cy=edge-width-field]');
  }
  get edgeFillField() {
    return cy.get('[data-cy=edge-fill-field]');
  }
  get edgeDirectedToggle() {
    // NOTE: Some bug with Vuetify that changes data-cy to cy.
    return cy.get('[cy=edge-directed-toggle]');
  }
  get edgeDeleteButton() {
    return cy.get('[data-cy=edge-delete-button]');
  }
  // Graph
  get graphNameField() {
    return cy.get('[data-cy=graph-name-field]');
  }
  get graphDeleteButton() {
    return cy.get('[data-cy=graph-delete-button]');
  }
  get trialGraphText() {
    return cy.get('[data-cy=trial-graph-text]');
  }
}

export default new EditorPage();
