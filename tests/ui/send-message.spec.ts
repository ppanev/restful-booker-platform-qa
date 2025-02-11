import { test, expect } from '@playwright/test';
import { ContactForm, HomePage } from '../../support/pages/HomePage';
import { faker } from '@faker-js/faker';
import { ERROR_MESSAGE } from '../../support/api-helpers/errorConstants';
import { generateMessageData } from '../../support/helpers/messageUtils';

test.describe('[Message] User', () => {
  let homePage: HomePage;
  let contact: ContactForm;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();

    contact = generateMessageData();
  });

  //Positive tests
  test('successfully submits a message', async () => {
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject!);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  test('submits a message when valid data with 21 characters is entered in the "Phone" field', async () => {
    contact.phone = faker.string.numeric(21);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject!);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  test('submits a message when valid data with 11 characters is entered in the "Phone" field', async () => {
    contact.phone = faker.string.numeric(11);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject!);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  test('submits a message when valid data with 100 characters is entered in the "Subject" field', async () => {
    contact.subject = faker.string.alpha(100);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  test('submits a message when valid data with 5 characters is entered in the "Subject" field', async () => {
    contact.subject = faker.string.alpha(5);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  test('submits a message when valid data with 20 characters is entered in the "Message" field', async () => {
    contact.description = faker.string.alpha(20);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject!);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  test('submits a message when they enter valid data with 2000 characters in the "Message" field', async () => {
    contact.description = faker.string.alpha(2000);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject!);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  //Negative tests
  test('submits a message when they leave the "Name" field blank', async () => {
    contact.name = '';
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.nameBlank);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when they enter a number in the "Name" field', async () => {
    contact.name = faker.string.numeric(15);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.nameSpecialCharacter);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when the name contains special characters in the "Name" field', async ({ page }) => {
    contact.name = `${faker.string.alphanumeric(5)} ${faker.string.symbol(4)} ${faker.string.alphanumeric(6)}`;
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.nameSpecialCharacter);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits an Email when they leave the "Email" field blank', async () => {
    contact.email = '';
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.emailBlank);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when they enter just a string in the "Email" field', async () => {
    contact.email = faker.string.alpha(11);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.emailWrongFormat);
  });

  test('submits a message when they enter an email without top-level domain in the "Email" field', async () => {
    contact.email = 'mail@mail';
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.emailWrongFormat);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when valid data with 22 characters is entered in the "Phone" field', async () => {
    contact.phone = faker.string.numeric(22);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.phoneLength);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when valid data with 10 characters is entered in the "Phone" field', async () => {
    contact.phone = faker.string.numeric(10);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.phoneLength);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when they leave blank "Phone" field', async () => {
    contact.phone = '';
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.phoneBlank);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.phoneLength);
  });

  test('submits a message when they enter a phone number that includes special or string characters in the "Phone" field', async () => {
    contact.phone = `${faker.string.numeric(5)} ${faker.string.symbol(4)} ${faker.string.numeric(5)}`;
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.phoneSpecialCharacter);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when valid data with 101 characters is entered in the "Subject" field', async () => {
    contact.subject = faker.string.alpha(101);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.subjectLength);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when valid data with 4 characters is entered in the "Subject" field', async () => {
    contact.subject = faker.string.alpha(4);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.subjectLength);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when they leave blank "Subject" field', async () => {
    contact.subject = '';
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.subjectBlank);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.subjectLength);
    await expect.soft(homePage.errorMessageRows).toHaveCount(2);
  });

  test('submits a message when they enter a special characters in the "Subject" field', async () => {
    contact.subject = `${faker.string.alphanumeric(5)} ${faker.string.symbol(4)} ${faker.string.alphanumeric(5)}`;
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  test('submits a message when valid data with 19 characters is entered in the "Message" field', async () => {
    contact.description = faker.string.alpha(19);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.descriptionLength);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when they leave blank "Message" field', async () => {
    contact.description = '';
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.descriptionLength);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.descriptionBlank);
    await expect.soft(homePage.errorMessageRows).toHaveCount(2);
  });

  test('submits a message when they enter a special characters in the "Message" field', async () => {
    contact.description = `${faker.string.alphanumeric(9)} ${faker.string.symbol(6)} ${faker.string.alphanumeric(10)}`;
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.successHeader).toContainText(`${homePage.thanksMessage} ${contact.name}!`);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.successMessage);
    await expect.soft(homePage.successMessageContainer).toContainText(contact.subject!);
    await expect.soft(homePage.successMessageContainer).toContainText(homePage.responseTimeMessage);
  });

  test('submits a message when valid data with 2001 characters is entered in the "Message" field', async () => {
    contact.description = faker.string.alpha(2001);
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.descriptionLength);
    await expect.soft(homePage.errorMessageRows).toHaveCount(1);
  });

  test('submits a message when they leave blank "Name", "Subject" and "Description" fields', async () => {
    contact.name = '';
    contact.subject = '';
    contact.description = '';
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.nameBlank);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.subjectBlank);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.subjectLength);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.descriptionBlank);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.descriptionLength);
    await expect.soft(homePage.errorMessageRows).toHaveCount(5);
  });

  test('submits a message when they leave blank "Phone" and "Email" fields', async () => {
    contact.email = '';
    contact.phone = '';
    await homePage.submitContactForm(contact);

    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.emailBlank);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.phoneLength);
    await expect.soft(homePage.errorMessagesContainer).toContainText(ERROR_MESSAGE.phoneBlank);
    await expect.soft(homePage.errorMessageRows).toHaveCount(3);
  });
});