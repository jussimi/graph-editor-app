import RootPage from './root';

class LayoutPage extends RootPage {
  get navbarActivatorIcon() {
    return cy.get('[data-cy=nav-activator-icon]');
  }
  get navbarCreateGraphLink() {
    return cy.get('[data-cy=nav-create-graph-link]');
  }
  get navbarGraphLinks() {
    return cy.get('[data-cy=nav-graph-link]');
  }
  get logoutButton() {
    return cy.get('[data-cy=logout-button]');
  }

  // LOGIN AND REGISTRATION
  get loginModalActivatorButton() {
    return cy.get('[data-cy=login-modal-activator]');
  }
  get registerModalActivatorButton() {
    return cy.get('[data-cy=register-modal-activator]');
  }
  get loginAndRegisterForm() {
    return cy.get('[data-cy=login-and-register-form]');
  }
  // REMOVE PERSON ACCOUNT
  get removeAccountModalActivator() {
    return cy.get('[data-cy=remove-account-modal-activator]');
  }
  get removeAccountForm() {
    return cy.get('[data-cy=remove-account-form]');
  }

  // GENERIC FORM FIELDS
  get formEmailField() {
    return cy.get('[data-cy=form-email-field]');
  }
  get formPasswordField() {
    return cy.get('[data-cy=form-password-field]');
  }
  get formCancelBtn() {
    return cy.get('[data-cy=form-cancel-btn]');
  }
  get formSubmitBtn() {
    return cy.get('[data-cy=form-submit-btn]');
  }

  // METHODS
  openLoginAndRegistrationForm(type: 'login' | 'register') {
    if (type === 'login') {
      this.loginModalActivatorButton.click();
    } else {
      this.registerModalActivatorButton.click();
    }
    this.loginAndRegisterForm.should('be.visible');
    this.formSubmitBtn.should(($btn) => expect($btn.text().toLowerCase()).to.equal(type));
    this.formCancelBtn.should('be.enabled');
    this.formEmailField.should('be.enabled');
    this.formPasswordField.should('be.enabled');
  }

  fillAndSubmitForm(email: string, password: string) {
    // Type values into the inputs and submit.
    this.formEmailField.type(email);
    this.formPasswordField.type(password);
    this.formSubmitBtn.click();
    //
    this.loginAndRegisterForm.should('not.be.visible');
    this.logoutButton.should('be.enabled');
    this.navbarActivatorIcon.should('be.enabled');
    // Check that an authToken was set in cookies.
    cy.getCookie('authToken').should('exist');
  }

  logout() {
    this.logoutButton.click();
    this.logoutButton.should('not.be.visible');
    // Check that the authToken was correctly removed.
    cy.getCookie('authToken').should('not.exist');
  }
}

export default new LayoutPage();
