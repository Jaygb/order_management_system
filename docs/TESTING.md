# Testing Strategy and Instructions

Testing is a core requirement of this project. The workspace features separate backend and frontend test environments.

---

## Test Stack

- **Test Runner**: Vitest (fast, modern, ESM-native alternative to Jest)
- **Backend Libraries**: Supertest (HTTP assertions)
- **Frontend Libraries**: React Testing Library + `jsdom` (browser mock environment)
- **Database Isolation**: A dedicated test database (`food_delivery_test`) is purged before each test block.

---

## Backend Test Suite (`/server`)

The backend tests verify endpoint behavior, HTTP codes, Zod schema validations, and state machine transitions.

### Key Configs
- **`vitest.config.js`**: Specifies setup files, global setup file, and sets `fileParallelism: false` to force sequential run.
- **`src/tests/globalSetup.js`**: Loads test environment variables (`.env.test`) and runs `npx prisma db push --accept-data-loss` once before test suites execute.
- **`src/tests/setup.js`**: Purges the tables (`menuItem`, `order`, `orderItem`) before each single test block.

### Test Scenarios Covered
1. **Health Check**: Valid response formats and statuses.
2. **Menu Queries**: Fetching lists, details, and verifying 404 responses.
3. **Order Placements**: Price calculations on the backend, ordering invalid/unavailable items, and validating quantities.
4. **Order CRUD**: Fetching page sets, modifying customer data, and cascade deleting order items.
5. **State Machine**: Confirming correct transitions (`RECEIVED` $\rightarrow$ `PREPARING`) and throwing `400 Bad Request` for invalid paths (`RECEIVED` $\rightarrow$ `DELIVERED`).

---

## Frontend Test Suite (`/client`)

The frontend tests check component renders and user interactions.

### Key Configs
- **`vitest.config.js`**: Boots a virtual browser window (`jsdom`) and injects the React plugin.
- **`src/tests/setup.js`**: Imports `@testing-library/jest-dom` assertions (e.g., `toBeInTheDocument`).
- **`src/tests/AppFlow.test.jsx`**: Mocks the Axios API layer and evaluates react rendering.

### Test Scenarios Covered
1. **Menu Page**: Renders dishes grids, handles loading spin overlays, and click-triggers addition animations.
2. **Cart Context**: Evaluates quantity addition logic, calculates grand totals, and removes selected items.
3. **Checkout Validation**: Inputs blank forms, asserts Zod error banners, populates valid text details, and checks Axios order submissions.

---

## Execution Commands

You can run the tests from the project root directory:

```bash
# Run all tests (runs server tests, then client tests sequentially)
npm test

# Run backend tests only
npm run test:server

# Run frontend tests only
npm run test:client
```
