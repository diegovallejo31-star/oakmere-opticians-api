import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makePractice } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('practices over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();

    const made = await api(app).post('/practices').send({
      code: 'OAK',
      name: 'Oakmere High Street',
      town: 'Oakmere',
      openedOn: '2012-06-11',
    });
    expect(made.status).toBe(201);

    const listed = await api(app).get('/practices');
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();

    const made = await api(app).post('/practices').send({
      code: 'OAK',
      name: 'Oakmere High Street',
      town: 'Oakmere',
      openedOn: '2012-06-11',
    });
    expect(Object.keys(made.body).sort()).toEqual([
      'code',
      'createdAt',
      'id',
      'name',
      'openedOn',
      'town',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();

    const made = await api(app).post('/practices').send({
      code: 'OAK',
      name: 'Oakmere High Street',
      town: 'Oakmere',
      openedOn: '2012-06-11',
    });
    const read = await api(app).get(`/practices/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/practices/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();

    const res = await api(app).post('/practices').send({
      code: 'OAK',
      name: 'Oakmere High Street',
      town: 'Oakmere',
      openedOn: '2012-06-11',
      nonesuch: 1,
    });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();

    const res = await api(app).get('/practices?nonesuch=1');
    expect(res.status).toBe(400);
  });

  it('refuses a second one with the same code', async () => {
    const app = buildApp();

    const first = await api(app).post('/practices').send({
      code: 'OAK',
      name: 'Oakmere High Street',
      town: 'Oakmere',
      openedOn: '2012-06-11',
    });
    expect(first.status).toBe(201);

    const again = await api(app).post('/practices').send({
      code: 'OAK',
      name: 'Oakmere High Street',
      town: 'Oakmere',
      openedOn: '2012-06-11',
    });
    expect(again.status).toBe(409);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    await makePractice(app);
    await makePractice(app);

    const all = await api(app).get('/practices');
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get('/practices?limit=1');
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/practices/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();

    const res = await api(app).get('/practices?limit=0');
    expect(res.status).toBe(400);
  });
});
