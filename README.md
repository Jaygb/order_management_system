# BiteDash - Real-Time Food Delivery & Order Management

A real-time order management feature for a food-delivery application built with **Node.js, Express, Socket.IO, Prisma ORM, PostgreSQL, React, and Vite**.

---

## Technical Stack

- **Frontend**: React (Vite, React Router, Axios, Lucide Icons, Vanilla CSS Modules)
- **Backend**: Node.js + Express.js (Modular Route-Controller-Service pattern)
- **Database**: PostgreSQL + Prisma ORM (Atomic Transactions & Cascade Deletes)
- **Real-Time Websockets**: Socket.IO (Event rooms routing)
- **Validation**: Zod (Dual client/server input validation)
- **Testing**: Vitest + Supertest + React Testing Library (Isolated test DB runs)
- **Security**: Helmet, CORS, and Express Rate Limiting

---

## Directory Layout

```text
project/
  client/               # React Frontend SPA
    src/
      context/          # Cart Context State
      components/       # Timeline, Navbar
      pages/            # Menu, Cart, Checkout, Tracking, 404
      services/         # Axios API Client, Socket.IO Connection Manager
      tests/            # React testing suites
  server/               # Express Backend API
    prisma/             # Database Schema & Seed Script
    src/
      config/           # Database Connection & Sockets Setup
      controllers/      # HTTP Argument Mappers
      middleware/       # Error, Rate, Validations
      routes/           # API v1 Endpoint Mappings
      services/         # Business Logic & Timer Simulation
      validation/       # Zod Input Schemas
      tests/            # Endpoint Test Suites
  docs/                 # Architecture, API specifications, and interview guides
```

---

## Environment Variables

### Backend (`/server/.env`)
Create a file named `.env` in the `/server` directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/food_delivery_db?schema=public"
CLIENT_URL="http://localhost:5173"
NODE_ENV=development
```

### Backend Test Environment (`/server/.env.test`)
Create a file named `.env.test` in the `/server` directory:
```env
PORT=5001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/food_delivery_test?schema=public"
CLIENT_URL="http://localhost:5173"
NODE_ENV=test
```

---

## Quick Start Setup

Ensure you have a PostgreSQL server running locally.

### 1. Install Dependencies
Run the following command in the root directory to install all monorepo dependencies:
```bash
npm install
```

### 2. Configure Database
Navigate to the `/server` directory and run the database migrations and seed script:
```bash
# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed the menu items
npx prisma db seed
```

### 3. Start Development Servers
Start both the client and server development servers from the root directory:
```bash
# Start backend on port 5000, frontend on port 5173
npm run dev:server     # starts Express server
npm run dev:client     # starts Vite client
```

Navigate to `http://localhost:5173` to explore the application!

---

## Testing Commands

Ensure your PostgreSQL credentials in `server/.env.test` are correct before running tests.

```bash
# Run both backend and frontend test suites sequentially
npm test

# Run backend API tests only
npm run test:server

# Run frontend React tests only
npm run test:client
```

---

## Production Build

Build the production assets for both frontend and backend:
```bash
npm run build
```

---

## Key Features

1. **Calculated Pricing**: Item prices are retrieved from the database on order creation to compute order subtotals and grand totals, ensuring client calculations are not trusted.
2. **State Machine Transitions**: Order statuses follow a strict state transition flow (`RECEIVED` $\rightarrow$ `PREPARING` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`). Invalid transitions are blocked by the service layer.
3. **Background Simulation**: Placing an order triggers a background simulation that transitions order statuses at 10-second intervals and broadcasts live updates.
4. **WebSocket Room Isolation**: Socket.IO connections join specific rooms (`order:<orderId>`), ensuring users only receive status updates for their own orders. Connections are cleaned up on unmount.
5. **Form Submit Protection**: Submit buttons disable during processing to prevent double order submissions.
6. **Dark Theme**: Features a modern dark theme styled with custom HSL values and glassmorphic card highlights.
