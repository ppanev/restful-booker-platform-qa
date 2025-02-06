import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import { generateMessageData, sendMessage } from '../../support/helpers/messageUtils';
import { ERROR_MESSAGE } from '../../support/api-helpers/errorConstants';
import { ContactForm } from '../../support/pages/HomePage';

test.describe('[Message API]', () => {
  let messageData: ContactForm;

  test.beforeEach(() => {
    messageData = generateMessageData();
  });

  //Positive tests
  test('successfully submit a message', async ({ request }) => {
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    assertMessageResponseFormat(responseBody, messageData);
  });

  test('submit a message when valid data with 21 characters is passed in the "Phone" field', async ({ request }) => {
    messageData.phone = faker.string.numeric(21);
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    assertMessageResponseFormat(responseBody, messageData);
  });

  test('submit a message when valid data with 11 characters is passed in the "Phone" field', async ({ request }) => {
    messageData.phone = faker.string.numeric(11);
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    assertMessageResponseFormat(responseBody, messageData);
  });

  test('submit a message when number instead of string is passed in the "Phone" field', async ({ request }) => {
    // @ts-ignore: Intentionally using an invalid type for testing
    messageData.phone = faker.number.int({ min: 10000000000, max: 10000900000000 });
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    expect.soft(responseBody.phone).toBe(messageData.phone?.toString());
  });

  test('submit a message when valid data with 100 characters is passed in the "Subject" field', async ({ request }) => {
    messageData.subject = faker.string.alpha(100);
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    assertMessageResponseFormat(responseBody, messageData);
  });

  test('submit a message when valid data with 5 characters is passed in the "Subject" field', async ({ request }) => {
    messageData.subject = faker.string.alpha(5);
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    assertMessageResponseFormat(responseBody, messageData);
  });

  test('submit a message when special characters is passed in the "Subject" field', async ({ request }) => {
    messageData.subject = `${faker.string.alphanumeric(5)} ${faker.string.symbol(4)} ${faker.string.alphanumeric(5)}`;
    const response = await sendMessage(request, messageData);

    await expect(response).toBeOK();
    const responseBody = await response.json();
    expect.soft(responseBody).toMatchObject({
      messageid: expect.any(Number),
    });
  });

  test('submit a message when valid data with 20 characters is passed in the "Message" field', async ({ request }) => {
    messageData.description = faker.string.alpha(20);
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    assertMessageResponseFormat(responseBody, messageData);
  });

  test('submit a message when valid data with 2000 characters is passed in the "Message" field', async ({
    request,
  }) => {
    messageData.description = faker.string.alpha(2000);
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    assertMessageResponseFormat(responseBody, messageData);
  });

  test('submit a message when special characters are passed in the "Message" field', async ({ request }) => {
    messageData.description = `${faker.string.alphanumeric(9)} ${faker.string.symbol(6)} ${faker.string.alphanumeric(10)}`;
    const response = await sendMessage(request, messageData);

    await expect.soft(response).toBeOK();
    const responseBody = await response.json();
    assertMessageResponseFormat(responseBody, messageData);
  });

  //Negative tests
  test('pass PUT to submit a message', async ({ request }) => {
    //Use a PUT request
    const messageData = generateMessageData();
    const response = await request.put('/message/', { data: messageData });

    expect.soft(response.status()).toBe(405);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('status', 405);
  });

  test('submit a message when a number is passed in the "Name" field', async ({ request }) => {
    messageData.name = faker.string.numeric(15);
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.nameNumbers),
    });
  });

  test('submit a message when the name contains special characters in the "Name" field', async ({ request }) => {
    messageData.name = `${faker.string.alpha(4)} ${faker.string.symbol(3)} ${faker.string.alpha(6)}`;
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.nameSpecialCharacter),
    });
  });

  test('submit a message when the "Email" field is passed with just a string', async ({ request }) => {
    messageData.email = faker.string.alpha(11);
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.emailWrongFormat),
    });
  });

  test('submit a message when an email without a top-level domain is passed in the "Email" field', async ({
    request,
  }) => {
    messageData.email = 'mail@mail';
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.emailWrongFormat),
    });
  });

  test('submit a message when invalid data with 22 characters is passed to the "Phone" field', async ({ request }) => {
    messageData.phone = faker.string.numeric(22);
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.phoneLength),
    });
  });

  test('submit a message when invalid data with 10 characters is passed to the "Phone" field', async ({ request }) => {
    messageData.phone = faker.string.numeric(10);
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.phoneLength),
    });
  });

  test('submit a message when an incorrect parameter name is passed to the "Phone" field', async ({ request }) => {
    // @ts-ignore: Intentionally using an invalid parameter name for testing
    const incorrectPropertyData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      telephone: faker.string.numeric(14),
      subject: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
    };
    const response = await sendMessage(request, incorrectPropertyData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
  });

  test('submit a message when a phone number that contains special or string characters is passed to the "Phone" field', async ({
    request,
  }) => {
    messageData.phone = `${faker.string.numeric(6)} ${faker.string.symbol(4)} ${faker.string.numeric(5)}`;
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.phoneSpecialCharacter),
    });
  });

  test('submit a message when invalid data with 101 characters is passed to the "Subject" field', async ({
    request,
  }) => {
    messageData.subject = faker.string.alpha(101);
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.subjectLength),
    });
  });

  test('submit a message when invalid data with 4 characters is passed to the "Subject" field', async ({ request }) => {
    messageData.subject = faker.string.alpha(4);
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.subjectLength),
    });
  });

  test('submit a message when invalid data with 19 characters is passed to the "Message" field', async ({
    request,
  }) => {
    messageData.description = faker.string.alpha(19);
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.descriptionLength),
    });
  });

  test('submit a message when invalid data with 2001 characters is passed to the "Message" field', async ({
    request,
  }) => {
    messageData.description = faker.string.alpha(2001);
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(1);
    expect.soft(responseBody).toMatchObject({
      errorMessage: expect.stringMatching(ERROR_MESSAGE.descriptionLength),
    });
  });

  test('submit a message when the "Phone" and "Email" fields are passed with a blank value', async ({ request }) => {
    messageData.email = '';
    messageData.phone = '';
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(3);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.phoneLength);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.emailBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.phoneBlank);
  });

  test('submit a message without "Phone" and "Email" properties', async ({ request }) => {
    delete messageData.email;
    delete messageData.phone;
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(4);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.phoneSet);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.emailBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.phoneBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.emailSet);
  });

  test('submit a message when the "Name", "Subject" and "Description" fields are passed with a blank value', async ({
    request,
  }) => {
    messageData.name = '';
    messageData.subject = '';
    messageData.description = '';
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(5);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.descriptionBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.descriptionLength);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.nameBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.subjectBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.subjectLength);
  });

  test('submit a message without "Name", "Subject" and "Description" property', async ({ request }) => {
    delete messageData.name;
    delete messageData.subject;
    delete messageData.description;
    const response = await sendMessage(request, messageData);

    expect.soft(response.status()).toBe(400);
    const responseBody = await response.json();
    expect.soft(responseBody).toHaveProperty('errorCode', 400);
    expect.soft(responseBody.fieldErrors).toHaveLength(6);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.subjectSet);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.descriptionBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.descriptionSet);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.subjectBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.nameBlank);
    expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE.nameSet);
  });

  const createParameters = ['name', 'email', 'phone', 'subject', 'description'];

  for (const param of createParameters) {
    test(`submit a message without ${param} property`, async ({ request }) => {
      delete messageData[param as keyof ContactForm];

      const response = await sendMessage(request, messageData);

      expect.soft(response.status()).toBe(400);
      const responseBody = await response.json();
      expect.soft(responseBody).toHaveProperty('errorCode', 400);
      expect.soft(responseBody.fieldErrors).toHaveLength(2);
      expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE[`${param}Blank` as keyof typeof ERROR_MESSAGE]);
      expect.soft(responseBody.fieldErrors).toContain(ERROR_MESSAGE[`${param}Set` as keyof typeof ERROR_MESSAGE]);
    });

    test(`submit a message when the ${param} field is blank`, async ({ request }) => {
      messageData[param as keyof ContactForm] = '';
      const response = await sendMessage(request, messageData);

      expect.soft(response.status()).toBe(400);
      const responseBody = await response.json();
      expect.soft(responseBody).toHaveProperty('errorCode', 400);
      const expectedErrors = [ERROR_MESSAGE[`${param}Blank` as keyof typeof ERROR_MESSAGE]];

      if (ERROR_MESSAGE[`${param}Length` as keyof typeof ERROR_MESSAGE]) {
        expectedErrors.push(ERROR_MESSAGE[`${param}Length` as keyof typeof ERROR_MESSAGE]);
      }

      expect.soft(responseBody.fieldErrors).toEqual(expect.arrayContaining(expectedErrors));
    });
  }

  const assertMessageResponseFormat = (responseBody: JSON, messageData: ContactForm) => {
    expect.soft(responseBody).toMatchObject({
      messageid: expect.any(Number),
      name: messageData.name,
      email: messageData.email,
      phone: messageData.phone,
      subject: messageData.subject,
      description: messageData.description,
    });
  };
});
