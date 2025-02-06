import { faker } from '@faker-js/faker';
import { APIRequestContext } from '@playwright/test';
import { ContactForm } from '../pages/HomePage';

export const generateMessageData = (): ContactForm => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.string.numeric(14),
  subject: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
});

export const sendMessage = async (request: APIRequestContext, data: ContactForm) => {
  const response = await request.post(`/message/`, { data });
  return response;
};
