const MONCOMPTEPRO_HOST =
  Cypress.env("MONCOMPTEPRO_HOST") || "http://localhost:3000";

const login = (cy) => {
  cy.get('[name="login"]').type("unused1@yopmail.com");
  cy.get('[type="submit"]').click();

  cy.get('[name="password"]').type("password123");
  cy.get('[action="/users/sign-in"]  [type="submit"]')
    .contains("S’identifier")
    .click();
};

describe("redirect after session expiration", () => {
  it("should be redirected to organization management page", function () {
    cy.visit(`${MONCOMPTEPRO_HOST}/manage-organizations`);

    login(cy);
    cy.contains("Vos organisations de rattachement");
    cy.contains("Commune de lamalou-les-bains - Mairie");

    // Wait for session to expire
    cy.wait(5 * 1000);
    cy.get('a.fr-sidemenu__link[href="/manage-organizations"]')
      .contains("Votre organisation")
      .click();

    cy.contains("Votre session a expiré");
    login(cy);
    cy.contains("Vos organisations de rattachement");

    // Wait for session to expire
    cy.wait(5 * 1000);

    // click on delete organization
    cy.get('[action="/users/quit-organization/1"]').submit();

    cy.contains("Votre session a expiré");
    login(cy);
    // should not redirect on the delete route but on the org management page
    cy.contains("Vos organisations de rattachement");
    // delete action should not have been triggered
    cy.contains("Commune de lamalou-les-bains - Mairie");
  });
});
