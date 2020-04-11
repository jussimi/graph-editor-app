import RootPage from '../pages/root';
const rootPage = new RootPage();

describe('Graph-editor root page', () => {
  before(() => {
    rootPage.open();
  });
  it('should find the page and redirect to the graphs-page from root', () => {
    cy.title().should('equal', rootPage.title);
    cy.url().should('contain', 'graphs');
  });
  it('should have store in window object', () => {
    cy.window().should('have.property', 'store');
  });
});
