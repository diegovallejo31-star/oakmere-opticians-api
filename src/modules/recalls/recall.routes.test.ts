import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makePatient, makeRecall } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('recalls over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app)
      .post(`/patients/${patientId}/recalls`)
      .send({ dueOn: '2027-04-10', note: 'Two-year recall' });
    expect(made.status).toBe(201);
    expect(made.body.status).toBe('scheduled');

    const listed = await api(app).get(`/patients/${patientId}/recalls`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app)
      .post(`/patients/${patientId}/recalls`)
      .send({ dueOn: '2027-04-10', note: 'Two-year recall' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'dueOn',
      'id',
      'note',
      'patientId',
      'status',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app)
      .post(`/patients/${patientId}/recalls`)
      .send({ dueOn: '2027-04-10', note: 'Two-year recall' });
    const read = await api(app).get(`/recalls/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/recalls/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app)
      .post(`/patients/${patientId}/recalls`)
      .send({ dueOn: '2027-04-10', note: 'Two-year recall', nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/recalls?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the patient is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/patients/999999/recalls')
      .send({ dueOn: '2027-04-10', note: 'Two-year recall' });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    await makeRecall(app, { patientId });
    await makeRecall(app, { patientId });

    const all = await api(app).get(`/patients/${patientId}/recalls`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/patients/${patientId}/recalls?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/recalls/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/recalls?limit=0`);
    expect(res.status).toBe(400);
  });

  it('sends a recall once and will not touch it again', async () => {
    const app = buildApp();
    const recallId = await makeRecall(app);

    const sent = await api(app)
      .post(`/recalls/${recallId}/status`)
      .send({ status: 'sent' });
    expect(sent.status).toBe(200);

    const again = await api(app)
      .post(`/recalls/${recallId}/status`)
      .send({ status: 'dismissed' });
    expect(again.status).toBe(409);
  });
});
