import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../app';
import { createTestDb } from '../../../tests/testDb';

function buildApp(): Express {
  return createApp(createTestDb());
}

const staff = {
  email: 'ABEBE@oakmere.example',
  fullName: 'Sara Abebe',
  password: 'oakmere-Consulting-two-19',
  role: 'optometrist' as const,
};

const lower = staff.email.toLowerCase();

describe('staff accounts', () => {
  it('registers somebody and answers without the hash', async () => {
    const app = buildApp();

    const res = await request(app).post('/auth/register').send(staff);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(lower);
    expect(res.body.role).toBe('optometrist');
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.password).toBeUndefined();
  });

  it('will not register one email twice, whatever its case', async () => {
    const app = buildApp();
    await request(app).post('/auth/register').send(staff);

    const res = await request(app)
      .post('/auth/register')
      .send({ ...staff, email: lower });
    expect(res.status).toBe(409);
  });

  it('turns down a password anybody could guess the length of', async () => {
    const app = buildApp();

    const res = await request(app)
      .post('/auth/register')
      .send({ ...staff, password: 'short' });
    expect(res.status).toBe(400);
  });

  it('turns down a role nobody here holds', async () => {
    const app = buildApp();

    const res = await request(app)
      .post('/auth/register')
      .send({ ...staff, role: 'locum' });
    expect(res.status).toBe(400);
  });
});

describe('signing in', () => {
  it('hands back a session', async () => {
    const app = buildApp();
    await request(app).post('/auth/register').send(staff);

    const res = await request(app)
      .post('/auth/sign-in')
      .send({ email: staff.email, password: staff.password });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.fullName).toBe('Sara Abebe');
  });

  it('says the same thing whether the email or the password is wrong', async () => {
    const app = buildApp();
    await request(app).post('/auth/register').send(staff);

    const wrongPassword = await request(app)
      .post('/auth/sign-in')
      .send({ email: staff.email, password: 'not-the-password' });
    const noSuchUser = await request(app)
      .post('/auth/sign-in')
      .send({ email: 'nobody@example.com', password: staff.password });

    expect(wrongPassword.status).toBe(401);
    expect(noSuchUser.status).toBe(401);
    expect(wrongPassword.body.error.message).toBe(noSuchUser.body.error.message);
  });

  it('says who a token belongs to, and forgets it on sign-out', async () => {
    const app = buildApp();
    await request(app).post('/auth/register').send(staff);
    const session = await request(app)
      .post('/auth/sign-in')
      .send({ email: staff.email, password: staff.password });
    const token = session.body.token as string;

    const me = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(lower);

    const out = await request(app)
      .post('/auth/sign-out')
      .set('Authorization', `Bearer ${token}`);
    expect(out.status).toBe(204);

    const after = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(401);
  });

  it('turns away a caller with no token at all', async () => {
    const app = buildApp();

    expect((await request(app).get('/auth/me')).status).toBe(401);
  });
});
