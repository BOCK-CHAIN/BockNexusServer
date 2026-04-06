# BockNexusServer

Server-side application for the BockNexus ecosystem, built with Node.js, Express, and Prisma.

##  Features
- RESTful API endpoints using Express.js
- Database integration with Prisma
- Database seeding utilities (`seedData.js`, `seedScript.js`)
- Organized controllers and routes for modular code structure

##  Requirements
- Node.js (v14 or later)
- npm (v6+) or Yarn
- A supported database (e.g., PostgreSQL preferred as it is what this was originally built on) configured via Prisma

##  Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BOCK-CHAIN/BockNexusServer.git
   cd BockNexusServer

2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Create environment variables**
   
    Create a .env in the root of the folder and add the database connection there (in this case we used neon.tech)
    Also, the payment keys which were not included in this part of the app.

    ```sh
    DATABASE_URL = "[Your_connection_URL_here]"
    ```
    This is how the database connection is established
   
5. **Migrate and seed the database**
   Do this to generate the prisma code located in the database (neon.tech server)
   ```sh
   npx prisma generate
   ```
6. **Start the server**
   ```sh
   npm start
   ```

## Role-Based Auth
- `User.role` is persisted in the database (`USER` | `ADMIN`).
- Login returns role-aware user data, and JWT payload includes:
  - `role`
  - `isAdmin`
- All `/admin/*` routes are enforced server-side with JWT auth + `ADMIN` role checks.

## Admin Seeding
Running `npm run seed` now ensures at least one admin account exists.

Optional environment variables:
```sh
ADMIN_EMAIL=admin@nexus.local
ADMIN_USERNAME=admin
ADMIN_PASSWORD=UseAStrongPassword123!
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

If `ADMIN_PASSWORD` is omitted, a one-time strong password is generated and printed during seeding.

## Security Controls
- Login endpoint is rate-limited (defaults: `10` attempts / `15m` per IP+email key).
- Admin endpoints are rate-limited (defaults: `120` requests / `15m`).
- In production (`NODE_ENV=production`), non-HTTPS requests are rejected.

Rate-limit tuning variables:
```sh
LOGIN_RATE_LIMIT_MAX=10
LOGIN_RATE_LIMIT_WINDOW_MS=900000
ADMIN_RATE_LIMIT_MAX=120
ADMIN_RATE_LIMIT_WINDOW_MS=900000
```

If deployed behind a proxy/load balancer, set:
```sh
TRUST_PROXY=true
```
