# AI Usage Report

This document outlines how the Antigravity AI assistant was utilized during the development of this project.

---

## Areas of AI Assistance

### 1. Code Generation
- Generated the Express modular project files structure and mounted route files, controllers, services, database wrappers, and custom middlewares.
- Generated the Prisma schema models mapping, relations, and the 12 food items seed script.
- Structured React Context, component layouts (Navbar, Timeline), and views (Menu, Cart, Checkout, Tracking) using HSL dark palettes.

### 2. Testing Setup
- Wrote the integration test suites for both backend and frontend components.
- Configured Vitest setup hooks, including the test database isolation script (`setup.js`) and sequential test configuration (`fileParallelism: false`).

### 3. Debugging and Troubleshooting
- **Vitest Workspace Flags**: Diagnosed and resolved the workspace flag issue, converting `--workspace=vitest.config.js` to standalone `vitest run` configurations.
- **Test Database Concurrency**: Resolved file locking and database synchronization collisions by introducing a global setup configuration (`globalSetup.js`) to sync the database schema once before all tests start.
- **Connection Diagnostics**: Debugged the PostgreSQL authentication failure in the test environment by comparing `.env` and `.env.test`, updating the credentials to match the local PostgreSQL server's custom password.
- **JSX Compiler Diagnostics**: Resolved Vite compiler errors by renaming the frontend test file from `.js` to `.jsx`.

### 4. Refactoring and Validation
- Refactored the Socket.IO client-server interface to support room tracking and cleanup on unmount.
- Synchronized front-end Zod schemas with backend schemas to intercept errors and display clean feedback.

### 5. Documentation
- Structured architecture graphs, API specifications, testing instructions, final project review checklists, and interview guides.
