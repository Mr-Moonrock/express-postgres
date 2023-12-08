const request = require('supertest');
const app = ('../app');

describe('GET /companies', () => {
  test('Responds with JSON containing a list of companies', async () => {
    const response = await request(app).get('/companies');
    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body.companies.length).toBeGreaterThan(0);
  });

  test('Responds with JSON containing a single company by code', async () => {
    const code1 = 'apple';
    const response = await request(app).get(`/companies/${code1}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('company')
    expect(response.body).toHaveProperty('code', code1)
  });
});