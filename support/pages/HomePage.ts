import { Locator, Page } from '@playwright/test';

export interface ContactForm {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  description?: string;
}

export class HomePage {
  readonly page: Page;
  readonly contactNameField: Locator;
  readonly contactEmailField: Locator;
  readonly contactPhoneField: Locator;
  readonly contactSubjectField: Locator;
  readonly contactMessageField: Locator;
  readonly submitButton: Locator;
  readonly successHeader: Locator;
  readonly successMessageContainer: Locator;
  readonly errorMessagesContainer: Locator;
  readonly errorMessageRows: Locator;

  // Constants for success messages
  readonly successMessage: string;
  readonly thanksMessage: string;
  readonly responseTimeMessage: string;

  constructor(page: Page) {
    this.page = page;

    //Locators
    this.contactNameField = page.getByTestId('ContactName');
    this.contactEmailField = page.getByTestId('ContactEmail');
    this.contactPhoneField = page.getByTestId('ContactPhone');
    this.contactSubjectField = page.getByTestId('ContactSubject');
    this.contactMessageField = page.getByTestId('ContactDescription');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.successHeader = page.locator('div .col-sm-5 h2');
    this.successMessageContainer = page.locator('div .col-sm-5:nth-of-type(2)');
    this.errorMessagesContainer = page.locator('.alert.alert-danger');
    this.errorMessageRows = this.errorMessagesContainer.locator('p');

    //Constants
    this.successMessage = "We'll get back to you about";
    this.thanksMessage = 'Thanks for getting in touch';
    this.responseTimeMessage = 'as soon as possible.';
  }

  async navigate() {
    await this.page.goto('/');
  }

  async fillForm(contact: ContactForm) {
    const { name, email, phone, subject, description } = contact;
    if (name !== undefined) await this.contactNameField.fill(name);
    if (email !== undefined) await this.contactEmailField.fill(email);
    if (phone !== undefined) await this.contactPhoneField.fill(phone);
    if (subject !== undefined) await this.contactSubjectField.fill(subject);
    if (description !== undefined) await this.contactMessageField.fill(description);
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async submitContactForm(contact: ContactForm) {
    await this.fillForm(contact);
    await this.submitForm();
  }
}
