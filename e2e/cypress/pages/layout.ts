import RootPage from './root';

class LayoutPage extends RootPage {
  get loginModalActivatorButton() {
    return cy.get('#login-modal-activator');
  }

  get registerModalActivatorButton() {
    return cy.get('#register-modal-activator');
  }

  get logoutButton() {
    return cy.get('#logout-button');
  }

  get loginAndRegisterForm() {
    return cy.get('#login-and-register-form');
  }

  get formEmailField() {
    return cy.get('#form-email-field');
  }

  get formPasswordField() {
    return cy.get('#form-password-field');
  }

  get formCancelBtn() {
    return cy.get('#form-cancel-btn');
  }

  get formSubmitBtn() {
    return cy.get('#form-submit-btn');
  }

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
