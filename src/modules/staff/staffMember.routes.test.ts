import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makePractice, makeStaffMember } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('staff over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const made = await api(app)
      .post(`/practices/${practiceId}/staff`)
      .send({ gocNumber: '01-31882', name: 'Sara Abebe', role: 'optometrist' });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/practices/${practiceId}/staff`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const made = await api(app)
      .post(`/practices/${practiceId}/staff`)
      .send({ gocNumber: '01-31882', name: 'Sara Abebe', role: 'optometrist' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'gocNumber',
      'id',
      'name',
      'practiceId',
      'role',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const made = await api(app)
      .post(`/practices/${practiceId}/staff`)
      .send({ gocNumber: '01-31882', name: 'Sara Abebe', role: 'optometrist' });
    const read = await api(app).get(`/staff/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/staff/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const res = await api(app)
      .post(`/practices/${practiceId}/staff`)
      .send({
        gocNumber: '01-31882',
        name: 'Sara Abebe',
        role: 'optometrist',
        nonesuch: 1,
      });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const res = await api(app).get(`/practices/${practiceId}/staff?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('refuses a second one with the same goc_number', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const first = await api(app)
      .post(`/practices/${practiceId}/staff`)
      .send({ gocNumber: '01-31882', name: 'Sara Abebe', role: 'optometrist' });
    expect(first.status).toBe(201);

    const again = await api(app)
      .post(`/practices/${practiceId}/staff`)
      .send({ gocNumber: '01-31882', name: 'Sara Abebe', role: 'optometrist' });
    expect(again.status).toBe(409);
  });

  it('amends the one field and leaves the rest alone', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const made = await api(app)
      .post(`/practices/${practiceId}/staff`)
      .send({ gocNumber: '01-31882', name: 'Sara Abebe', role: 'optometrist' });
    const patched = await api(app)
      .patch(`/staff/${made.body.id}`)
      .send({ role: 'dispensing_optician' });
    expect(patched.status).toBe(200);
    expect(patched.body.role).toEqual('dispensing_optician');
  });

  it('refuses an empty amendment', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const made = await api(app)
      .post(`/practices/${practiceId}/staff`)
      .send({ gocNumber: '01-31882', name: 'Sara Abebe', role: 'optometrist' });
    const patched = await api(app).patch(`/staff/${made.body.id}`).send({});
    expect(patched.status).toBe(400);
  });

  it('404s when the practice is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/practices/999999/staff')
      .send({ gocNumber: '01-31882', name: 'Sara Abebe', role: 'optometrist' });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);
    await makeStaffMember(app, { practiceId });
    await makeStaffMember(app, { practiceId });

    const all = await api(app).get(`/practices/${practiceId}/staff`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/practices/${practiceId}/staff?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/staff/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const practiceId = await makePractice(app);

    const res = await api(app).get(`/practices/${practiceId}/staff?limit=0`);
    expect(res.status).toBe(400);
  });

  it('404s when amending one that is not there', async () => {
    const app = buildApp();

    const res = await api(app).patch('/staff/999999').send({ role: 'dispensing_optician' });
    expect(res.status).toBe(404);
  });
});
