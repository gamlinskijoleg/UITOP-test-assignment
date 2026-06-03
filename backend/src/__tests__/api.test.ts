import request from 'supertest';
import app from '../index';
import db from '../db';

describe('Todo API', () => {
  beforeAll(() => {
    db.exec('DELETE FROM todos');
  });

  it('should fetch categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should create a todo', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ text: 'Test Todo', category_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.text).toBe('Test Todo');
  });

  it('should not allow more than 5 tasks per category', async () => {
    // We already created 1
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/todos')
        .send({ text: `Task ${i}`, category_id: 1 });
    }
    
    // 6th task should fail
    const res = await request(app)
      .post('/todos')
      .send({ text: 'Excess task', category_id: 1 });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('maximum of 5 tasks');
  });
});
