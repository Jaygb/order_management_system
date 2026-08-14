# API Documentation

The BiteDash Backend API is versioned and mounted under `/api/v1`.

---

## Health Check

### GET `/api/v1/health`
Checks server health status.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Order Management Service API is healthy",
    "timestamp": "2026-08-13T17:15:00.000Z"
  }
  ```

---

## Menu Endpoints

### GET `/api/v1/menu`
Retrieves all menu items, sorted alphabetically by name.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "573b6068-b3e8-4981-81e3-2f9f275a2d78",
        "name": "Classic Margherita Pizza",
        "description": "Fresh mozzarella, vine-ripened tomatoes, sweet basil, and extra virgin olive oil.",
        "price": 12.99,
        "imageUrl": "https://images.unsplash.com/...jpg",
        "isAvailable": true,
        "createdAt": "2026-08-13T17:00:00.000Z",
        "updatedAt": "2026-08-13T17:00:00.000Z"
      }
    ]
  }
  ```

### GET `/api/v1/menu/:id`
Retrieves details for a single menu item.

- **Parameters**:
  - `id` (UUID, required)

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "573b6068-b3e8-4981-81e3-2f9f275a2d78",
      "name": "Classic Margherita Pizza",
      "description": "Fresh mozzarella, vine-ripened tomatoes, sweet basil...",
      "price": 12.99,
      "imageUrl": "https://images.unsplash.com/...jpg",
      "isAvailable": true
    }
  }
  ```
- **Response (404 Not Found)**:
  ```json
  {
    "success": false,
    "status": 404,
    "message": "Menu item with ID 573b6068-b3e8-4981-81e3-2f9f275a2d78 not found"
  }
  ```

---

## Order Endpoints

### POST `/api/v1/orders`
Places a new order. Calculates prices on the backend and triggers the real-time simulation.

- **Request Body**:
  ```json
  {
    "customerName": "Alice Smith",
    "address": "456 Oak Lane, Suite 10",
    "phone": "+15551234567",
    "items": [
      {
        "menuItemId": "573b6068-b3e8-4981-81e3-2f9f275a2d78",
        "quantity": 2
      }
    ]
  }
  ```

- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "713cf0bb-aa29-450a-b280-5a33c2e11802",
      "orderNumber": "ORD-260813-7491",
      "customerName": "Alice Smith",
      "address": "456 Oak Lane, Suite 10",
      "phone": "+15551234567",
      "status": "RECEIVED",
      "totalAmount": 25.98,
      "createdAt": "2026-08-13T17:20:00.000Z",
      "items": [
        {
          "id": "e4f8a8bb-e2b2-4d2c-88cc-8495a620b784",
          "menuItemId": "573b6068-b3e8-4981-81e3-2f9f275a2d78",
          "quantity": 2,
          "unitPrice": 12.99,
          "subtotal": 25.98
        }
      ]
    }
  }
  ```

- **Response (400 Bad Request)**:
  - Triggered by validation failures, non-integer/negative quantities, ordering unavailable items, or invalid formats.
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Validation failed",
    "errors": [
      {
        "path": "body.phone",
        "message": "Invalid phone number format"
      }
    ]
  }
  ```

### GET `/api/v1/orders`
Retrieves a paginated list of all orders, sorted by creation date descending.

- **Query Parameters**:
  - `page` (Integer, default: 1)
  - `limit` (Integer, default: 10)

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5
    }
  }
  ```

### GET `/api/v1/orders/:id`
Retrieves details for a single order, including order items and nested menu items.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "713cf0bb-aa29-450a-b280-5a33c2e11802",
      "orderNumber": "ORD-260813-7491",
      "customerName": "Alice Smith",
      "status": "RECEIVED",
      "totalAmount": 25.98,
      "items": [...]
    }
  }
  ```

### PUT `/api/v1/orders/:id`
Updates general details (such as customer name or address) for an existing order.

- **Request Body**:
  ```json
  {
    "customerName": "Alice J. Smith",
    "address": "456 Oak Lane, Apt 2C"
  }
  ```

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "713cf0bb-aa29-450a-b280-5a33c2e11802",
      "customerName": "Alice J. Smith",
      "address": "456 Oak Lane, Apt 2C",
      ...
    }
  }
  ```

### PATCH `/api/v1/orders/:id/status`
Updates an order status. Enforces state machine transitions. Emits updates via WebSockets.

- **Request Body**:
  ```json
  {
    "status": "PREPARING"
  }
  ```

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "713cf0bb-aa29-450a-b280-5a33c2e11802",
      "status": "PREPARING",
      ...
    }
  }
  ```

- **Response (400 Bad Request - Invalid Transition)**:
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Invalid status transition: cannot change order status from RECEIVED to DELIVERED"
  }
  ```

### DELETE `/api/v1/orders/:id`
Deletes an order from the database. Cascade deletes all related items.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order deleted successfully"
  }
  ```
