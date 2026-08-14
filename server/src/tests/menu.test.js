import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';

describe('Menu API Endpoints', () => {
  let seededItem;

  beforeEach(async () => {
    seededItem = await prisma.menuItem.create({
      data: {
        name: 'Spaghetti Carbonara',
        description: 'Classic Roman pasta with crispy guanciale, egg yolks, and black pepper.',
        price: 15.99,
        imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
        isAvailable: true,
      },
    });
  });

  describe('GET /api/v1/menu', () => {
    it('should return a list of all menu items in the database', async () => {
      const res = await request(app).get('/api/v1/menu');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Spaghetti Carbonara');
    });
  });

  describe('GET /api/v1/menu/:id', () => {
    it('should return detailed menu item for a valid ID', async () => {
      const res = await request(app).get(`/api/v1/menu/${seededItem.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(seededItem.id);
      expect(res.body.data.price).toBe(15.99);
    });

    it('should return a 404 response for a non-existent item ID', async () => {
      const fakeId = 999999;
      const res = await request(app).get(`/api/v1/menu/${fakeId}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should return a 400 response for an invalid format item ID', async () => {
      const invalidId = 'not-a-number';
      const res = await request(app).get(`/api/v1/menu/${invalidId}`);
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid menu item ID format');
    });
  });
});
