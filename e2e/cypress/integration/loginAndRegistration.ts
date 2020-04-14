import layoutPage from '../pages/layout';

describe('Login and registration', () => {
  const email = 'loginTest@email.com';
  const password = 'loginTestPass';

  beforeEach(() => {
    layoutPage.open();
    cy.clearCookie('authToken');
  });

  it('should be able to open registration form and cancel', () => {
    layoutPage.openLoginAndRegistrationForm('register');
    // Cancel
    layoutPage.formCancelBtn.click();
    layoutPage.loginAndRegisterForm.should('not.be.visible');
  });

  it('should be able to open the login form and cancel', () => {
    layoutPage.openLoginAndRegistrationForm('login');
    // Cancel
    layoutPage.formCancelBtn.click();
    layoutPage.loginAndRegisterForm.should('not.be.visible');
  });
  it('should be able to register', () => {
    // Open modal
    layoutPage.openLoginAndRegistrationForm('register');
    // Fill and submit form
    layoutPage.fillAndSubmitForm(email, password);
    // Remove the person so that the tests can be run again.
    cy.window().then(async (win) => {
      await win.store.dispatch('unRegister', { email, password });
    });
  });
  it('should be able to login', () => {
    cy.window().then(async (win) => {
      await win.store.dispatch('register', { email, password });
    });
    layoutPage.logout();
    // Open modal
    layoutPage.openLoginAndRegistrationForm('login');
    // Fill and submit form
    layoutPage.fillAndSubmitForm(email, password);
    // Remove the person so that the tests can be run again.
    cy.window().then(async (win) => {
      await win.store.dispatch('unRegister', { email, password });
    });
  });
  it('should be able to logout', () => {
    // Login
    cy.window().then(async (win) => {
      await win.store.dispatch('register', { email, password });
    });
    // Logout
    layoutPage.logout();
    // Remove the person so that the tests can be run again.
    cy.window().then(async (win) => {
      await win.store.dispatch('login', { email, password });
      await win.store.dispatch('unRegister', { email, password });
    });
  });
  it('should be able to unregister', () => {
    // Login
    cy.window().then(async (win) => {
      await win.store.dispatch('register', { email, password });
    });
    // Open the navbar
    layoutPage.navbarActivatorIcon.click();
    layoutPage.removeAccountModalActivator.should('be.enabled');
    // Open the remove-account modal.
    layoutPage.removeAccountModalActivator.click();
    layoutPage.removeAccountForm.should('be.visible');
    layoutPage.formCancelBtn.should('be.enabled');
    layoutPage.formEmailField.should('be.enabled');
    layoutPage.formPasswordField.should('be.enabled');
    // Fill and submit the form
    layoutPage.formEmailField.type(email);
    layoutPage.formPasswordField.type(password);
    layoutPage.formSubmitBtn.click();
    // Verify success
    layoutPage.removeAccountForm.should('not.be.visible');
    layoutPage.logoutButton.should('not.be.visible');
    layoutPage.removeAccountModalActivator.should('not.be.visible');
    // Check that the authToken was correctly removed.
    cy.getCookie('authToken').should('not.exist');
  });
});
