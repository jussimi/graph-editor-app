import layoutPage from '../pages/layout';

describe('Login and registration', () => {
  const email = 'loginTest@email.com';
  const password = 'loginTestPass';

  beforeEach(() => {
    layoutPage.open();
    cy.clearCookie('authToken');
  });

  after(() => {
    // Remove the person so that the tests can be run again.
    cy.window().then(async (win) => {
      await win.store.dispatch('login', { email, password });
      await win.store.dispatch('unRegister', { email, password });
    });
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
  it('should be able to register and then logout', () => {
    // Open modal
    layoutPage.openLoginAndRegistrationForm('register');
    // Fill and submit form
    layoutPage.fillAndSubmitForm(email, password);
    // Finally logout.
    layoutPage.logout();
  });
  it('should be able to login and then logout', () => {
    // Open modal
    layoutPage.openLoginAndRegistrationForm('login');
    // Fill and submit form
    layoutPage.fillAndSubmitForm(email, password);
    // Finally logout.
    layoutPage.logout();
  });
});
