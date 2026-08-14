import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeDispensing, makeLabOrder } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('laborders over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const dispensingId = await makeDispensing(app);

    const made = await api(app)
      .post(`/dispensings/${dispensingId}/lab-orders`)
      .send({ labRef: 'LAB-3300', orderedOn: '2025-04-12' });
    expect(made.status).toBe(201);
    expect(made.body.status).toBe('ordered');

    const listed = await api(app).get(`/dispensings/${dispensingId}/lab-orders`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const dispensingId = await makeDispensing(app);

    const made = await api(app)
      .post(`/dispensings/${dispensingId}/lab-orders`)
      .send({ labRef: 'LAB-3300', orderedOn: '2025-04-12' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'dispensingId',
      'id',
      'labRef',
      'orderedOn',
      'status',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const dispensingId = await makeDispensing(app);

    const made = await api(app)
      .post(`/dispensings/${dispensingId}/lab-orders`)
      .send({ labRef: 'LAB-3300', orderedOn: '2025-04-12' });
    const read = await api(app).get(`/lab-orders/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/lab-orders/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const dispensingId = await makeDispensing(app);

    const res = await api(app)
      .post(`/dispensings/${dispensingId}/lab-orders`)
      .send({ labRef: 'LAB-3300', orderedOn: '2025-04-12', nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const dispensingId = await makeDispensing(app);

    const res = await api(app).get(`/dispensings/${dispensingId}/lab-orders?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the dispensing is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/dispensings/999999/lab-orders')
      .send({ labRef: 'LAB-3300', orderedOn: '2025-04-12' });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const dispensingId = await makeDispensing(app);
    await makeLabOrder(app, { dispensingId });
    await makeLabOrder(app, { dispensingId });

    const all = await api(app).get(`/dispensings/${dispensingId}/lab-orders`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/dispensings/${dispensingId}/lab-orders?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/lab-orders/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const dispensingId = await makeDispensing(app);

    const res = await api(app).get(`/dispensings/${dispensingId}/lab-orders?limit=0`);
    expect(res.status).toBe(400);
  });

  it('walks an order ordered, received, collected and no further', async () => {
    const app = buildApp();
    const orderId = await makeLabOrder(app);

    const received = await api(app)
      .post(`/lab-orders/${orderId}/status`)
      .send({ status: 'received' });
    expect(received.status).toBe(200);

    const collected = await api(app)
      .post(`/lab-orders/${orderId}/status`)
      .send({ status: 'collected' });
    expect(collected.status).toBe(200);

    const again = await api(app)
      .post(`/lab-orders/${orderId}/status`)
      .send({ status: 'received' });
    expect(again.status).toBe(409);
  });

  it('will not collect an order still at the lab', async () => {
    const app = buildApp();
    const orderId = await makeLabOrder(app);

    const res = await api(app)
      .post(`/lab-orders/${orderId}/status`)
      .send({ status: 'collected' });
    expect(res.status).toBe(409);
  });
});
