import request from 'supertest';
import app from '../app.js';

describe('GET /api/v1/health', () => {
  it('should return 200 OK and health status message', async () => {
    const res = await request(app).get('/api/v1/health');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toContain('healthy');
    expect(res.body.timestamp).toBeDefined();
  });
});
