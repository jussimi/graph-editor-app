import editorPage from '../pages/editor';

describe('Graph editor actions', () => {
  before(() => {
    editorPage.open();
  });

  it('finds canvas and toolbar buttons in correct state', () => {
    editorPage.graphEditorCanvas.should('be.visible');
    //
    editorPage.modeEdgeButton.should('be.enabled');
    editorPage.modeNodeButton.should('be.enabled');
    editorPage.modeEditButton.should('be.enabled');
    //
    editorPage.setLayoutButton.should('be.enabled');
    //
    editorPage.saveGraphButton.should('be.visible');
    editorPage.saveGraphButton.should('not.be.enabled');
    //
    editorPage.donwloadSvgButton.should('be.visible');
    editorPage.donwloadSvgButton.should('not.be.enabled');
  });

  it('can toggle to node-mode', () => {
    editorPage.modeNodeButton.click();
    editorPage.modeNodeButton.should('have.class', 'v-btn--active');
    //
    editorPage.nodeColorField.should('be.visible');
    editorPage.nodeFillField.should('be.visible');
    editorPage.nodeRadiusField.should('be.visible');
  });

  it('can toggle to edge mode', () => {
    editorPage.modeEdgeButton.click();
    editorPage.modeEdgeButton.should('have.class', 'v-btn--active');

    editorPage.edgeFillField.should('be.visible');
    editorPage.edgeWidthField.should('be.visible');
    editorPage.edgeDirectedToggle.should('be.visible');
  });

  it('can toggle to edit mode', () => {
    editorPage.modeEditButton.click();
    editorPage.modeEditButton.should('have.class', 'v-btn--active');
    editorPage.trialGraphText.should('be.visible');
  });

  describe('Creating and editing nodes and edges', () => {
    // NOTE: These should be covered in unit tests and not here.
    const nodes = [
      { x: 50, y: 50 },
      { x: 250, y: 50 },
      { x: 250, y: 250 },
    ];
    it('Can create nodes', () => {
      editorPage.modeNodeButton.click();
      //
      for (const node of nodes) {
        editorPage.graphEditorCanvas.click(node.x, node.y);
      }
      editorPage.graphEditorNodes.should('have.length', 3);
    });

    it('Can create edges', () => {
      editorPage.modeEdgeButton.click();
      for (let i = 0; i < nodes.length; i += 1) {
        const startNode = nodes[i];
        const targetNode = nodes[i + 1] || nodes[0];
        editorPage.graphEditorCanvas
          .trigger('pointerdown', startNode.x, startNode.y)
          .trigger('pointermove', targetNode.x, targetNode.y)
          .trigger('pointerup', targetNode.x, targetNode.y);
      }
      editorPage.graphEditorEdges.should('have.length', 3);
    });
  });

  describe('Logged in actions', () => {
    const email = 'graphTest@email.com';
    const password = 'graphTestPass';

    beforeEach(() => {
      editorPage.open();
      cy.window().then((win) => {
        win.store.dispatch('register', { email, password });
      });
    });
    afterEach(() => {
      // Remove the person so that the tests can be run again.
      cy.window().then((win) => {
        win.store.dispatch('unRegister', { email, password });
      });
    });

    it('Person can create a graph', () => {
      editorPage.saveGraphButton.should('be.enabled');
      editorPage.saveGraphButton.click();
      cy.location('pathname').should((path) => {
        const splitPath = path.split('/');
        expect(path).to.contain('graphs');
        expect(parseInt(splitPath[splitPath.length - 1])).to.be.greaterThan(110);
      });
    });
    it('Person can update a graph', () => {
      const nodes = [
        { x: 50, y: 50 },
        { x: 250, y: 50 },
        { x: 250, y: 250 },
      ];
      editorPage.modeNodeButton.click();
      //
      for (const node of nodes) {
        editorPage.graphEditorCanvas.click(node.x, node.y);
      }
      editorPage.graphEditorNodes.should('have.length', 3);
      editorPage.saveGraphButton.should('be.enabled');
      editorPage.saveGraphButton.click();
      // If the graph is the same after reloading, the save has worked.
      cy.reload();
      editorPage.graphEditorNodes.should('have.length', 3);
    });
    it('Person can download a graph', () => {
      editorPage.donwloadSvgButton.should('be.enabled');
    });
    it('Person can delete graphs', () => {
      editorPage.saveGraphButton.should('be.enabled');
      editorPage.saveGraphButton.click();
      cy.location('pathname').should((path) => {
        const splitPath = path.split('/');
        expect(path).to.contain('graphs');
        expect(parseInt(splitPath[splitPath.length - 1])).to.be.greaterThan(110);
      });
      //
      editorPage.modeEditButton.click();
      editorPage.graphDeleteButton.should('be.enabled').click();
      // editorPage.graphDeleteButton.click();
      cy.get('#confirm-dialog-confirm').click();
      cy.location('pathname').should((path) => {
        const splitPath = path.split('/');
        expect(path).to.contain('graphs');
        expect(parseInt(splitPath[splitPath.length - 1])).to.equal(1);
      });
    });
  });
});
