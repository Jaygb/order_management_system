import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';

describe('Order API Endpoints & Business Logic', () => {
  let activeItem1;
  let activeItem2;
  let unavailableItem;

  beforeEach(async () => {
    // Seed initial items for order calculations
    activeItem1 = await prisma.menuItem.create({
      data: {
        name: 'Pizza Margherita',
        description: 'Classic cheese and tomato hand-tossed pizza',
        price: 12.00,
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3',
        isAvailable: true,
      },
    });

    activeItem2 = await prisma.menuItem.create({
      data: {
        name: 'Double Cheeseburger',
        description: 'Double beef patties and double cheddar cheese burger',
        price: 9.50,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        isAvailable: true,
      },
    });

    unavailableItem = await prisma.menuItem.create({
      data: {
        name: 'Sold Out Pasta',
        description: 'Limited edition spicy chicken penne pasta',
        price: 14.00,
        imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
        isAvailable: false,
      },
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should place an order successfully and perform pricing calculations on the backend', async () => {
      const payload = {
        customerName: 'Sarah Connor',
        address: '742 Evergreen Terrace, Sector 7G',
        phone: '+15557778888',
        items: [
          { menuItemId: activeItem1.id, quantity: 2 }, // 2 * 12.00 = 24.00
          { menuItemId: activeItem2.id, quantity: 1 }, // 1 * 9.50 = 9.50
        ],
      };

      const res = await request(app)
        .post('/api/v1/orders')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toBeDefined();
      expect(res.body.data.status).toBe('RECEIVED');
      expect(res.body.data.totalAmount).toBe(33.50); // 24.00 + 9.50
      expect(res.body.data.items.length).toBe(2);
    });

    it('should reject requests with missing fields or short values (Zod validation)', async () => {
      const payload = {
        customerName: 'J', // too short
        address: 'St', // too short
        phone: '123', // invalid regex pattern
        items: [
          { menuItemId: activeItem1.id, quantity: 1 },
        ],
      };

      const res = await request(app)
        .post('/api/v1/orders')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation failed');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 404 when ordering a non-existent menuItem ID', async () => {
      const fakeId = 999999;
      const payload = {
        customerName: 'John Connor',
        address: '321 Cyberdyne Ave',
        phone: '+15556667777',
        items: [
          { menuItemId: fakeId, quantity: 1 },
        ],
      };

      const res = await request(app)
        .post('/api/v1/orders')
        .send(payload);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('does not exist');
    });

    it('should return 400 when trying to order an item marked as unavailable', async () => {
      const payload = {
        customerName: 'John Connor',
        address: '321 Cyberdyne Ave',
        phone: '+15556667777',
        items: [
          { menuItemId: unavailableItem.id, quantity: 1 },
        ],
      };

      const res = await request(app)
        .post('/api/v1/orders')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('unavailable');
    });

    it('should return 400 for negative, decimal, or zero quantities', async () => {
      const payload = {
        customerName: 'John Connor',
        address: '321 Cyberdyne Ave',
        phone: '+15556667777',
        items: [
          { menuItemId: activeItem1.id, quantity: -1.5 },
        ],
      };

      const res = await request(app)
        .post('/api/v1/orders')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Order Operations and State Updates', () => {
    let order;

    beforeEach(async () => {
      order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-TEST-999',
          customerName: 'Ellen Ripley',
          address: 'Nostromo Deck A, Cabin 4',
          phone: '+15559990000',
          totalAmount: 12.00,
          status: 'RECEIVED',
          items: {
            create: {
              menuItemId: activeItem1.id,
              quantity: 1,
              unitPrice: 12.00,
              subtotal: 12.00,
            },
          },
        },
      });
    });

    it('should retrieve a list of orders with pagination metrics', async () => {
      const res = await request(app)
        .get('/api/v1/orders?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toEqual(expect.objectContaining({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      }));
    });

    it('should retrieve detailed information of a single order by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${order.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(order.id);
      expect(res.body.data.customerName).toBe('Ellen Ripley');
    });

    it('should update general order fields successfully via PUT', async () => {
      const res = await request(app)
        .put(`/api/v1/orders/${order.id}`)
        .send({
          customerName: 'Lt. Ellen Ripley',
          address: 'Nostromo Escape Pod',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toBe('Lt. Ellen Ripley');
      expect(res.body.data.address).toBe('Nostromo Escape Pod');
    });

    it('should execute authorized status transition successfully (RECEIVED -> PREPARING)', async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${order.id}/status`)
        .send({ status: 'PREPARING' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PREPARING');
    });

    it('should reject unauthorized transitions with 400 Bad Request (RECEIVED -> DELIVERED)', async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${order.id}/status`)
        .send({ status: 'DELIVERED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid status transition');
    });

    it('should delete an order and successfully cascade delete related items', async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/orders/${order.id}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/v1/orders/${order.id}`);
      
      expect(checkRes.status).toBe(404);
    });
  });
});
