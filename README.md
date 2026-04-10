# Bock Nexus Server

REST API for the Nexus e-commerce backend. It uses **Node.js**, **Express 5**, **Prisma**, and **PostgreSQL** (designed to work with Neon). This document explains how the project is organized, how to run it, and every HTTP route so a new developer can get productive quickly.

---

## What this server does

- User accounts with JWT authentication, public `userId` (e.g. `bock1`, `bock2`) and optional profile fields.
- Catalog: categories and products with sizes, filters, and search.
- Shopping cart and wishlist (authenticated).
- Addresses, reviews, checkout (cart-based), and orders (including Razorpay flow).
- **Admin API** under `/admin` for dashboard-style clients (paginated products/categories, CRUD, stock updates). Protected by JWT + admin role + rate limiting.

---

## Requirements

- **Node.js** (LTS recommended)
- **PostgreSQL** database URL (e.g. Neon)
- **npm** (or compatible package manager)

---

## Quick start

1. **Install dependencies** (from this folder):

   ```bash
   npm install
   ```

2. **Environment variables** — create a `.env` file in this directory (same level as `app.js`). Typical variables:

   | Variable       | Purpose                                                                                          |
   | -------------- | ------------------------------------------------------------------------------------------------ |
   | `DATABASE_URL` | PostgreSQL connection string (required by Prisma)                                                |
   | `JWT_SECRET`   | Secret for signing JWTs (use a strong value in production)                                       |
   | `PORT`         | Server port (default `3000`)                                                                     |
   | `NODE_ENV`     | Set to `production` to enforce HTTPS (see Security)                                              |
   | `TRUST_PROXY`  | Optional. Set to `true` or a hop count when behind a reverse proxy (for correct HTTPS detection) |

   | `LOGIN_RATE_LIMIT_WINDOW_MS` | Login rate-limit window (default 15 minutes) |
   | `LOGIN_RATE_LIMIT_MAX` | Max login attempts per window per IP+email (default 10) |
   | `ADMIN_RATE_LIMIT_WINDOW_MS` | Admin API rate-limit window |
   | `ADMIN_RATE_LIMIT_MAX` | Max admin requests per window per IP+user |

3. **Database schema** — apply migrations / generate client per your Prisma workflow, for example:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

   (Use `migrate dev` during local development if that is your team’s workflow.)

4. **Seed data** (optional):

   ```bash
   npm run seed          # default
   npm run seed:home
   npm run seed:categories
   npm run seed:all
   ```

5. **Run the server**:

   ```bash
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

For development with auto-restart:

```bash
npm run dev
```

The server listens on **`0.0.0.0`** and the port from `PORT` or **3000**.

---

## Project structure

```
BockNexusServer/
├── app.js                 # Express app entry: middleware, mounts routes, DB startup hooks
├── package.json
├── prisma/
│   └── schema.prisma      # Data models (User, Product, Order, etc.)
├── lib/
│   ├── prisma.js          # Prisma client + connection retry helpers (Neon-friendly)
│   └── userIdGenerator.js # Generates unique public userIds (e.g. bockN)
├── middleware/
│   ├── auth.js            # JWT authentication + requireAdmin
│   ├── rateLimit.js       # Login & admin rate limiters
│   └── security.js        # HTTPS enforcement in production
├── routes/                # Route modules (URL prefixes only; logic in controllers)
├── controllers/           # Request handlers / business logic
├── scripts/               # Seed and maintenance scripts
└── README.md              # This file
```

**Flow:** `app.js` → `routes/*.js` → `controllers/*.js` → `lib/prisma` → database.

---

## Global behavior

### CORS

- Reflects request origin (`origin: true`), allows credentials, methods `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, and headers `Content-Type`, `Authorization`.

### JSON body

- `express.json()` is enabled. Send `Content-Type: application/json` for JSON bodies.

### Health check

| Method | Path | Description                                                                                                             |
| ------ | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/`  | Returns `{ status: 'ok', time: <db server time> }` if the database is reachable; otherwise `500` with an error message. |

### Errors

- Unknown paths: **`404`** `{ "error": "Endpoint not found" }`
- Uncaught errors: **`500`** `{ "error": "Internal server error" }`
- Many routes return their own `{ success, message, ... }` shapes; see each section below.

### Startup (database)

After the server starts, it retries connecting to the DB (up to 3 attempts). On success it may:

1. **Migrate user IDs** — assign `userId` to existing users who lack one (`migrateExistingUsers`).
2. **Default admin** — ensures an admin user exists when appropriate (see logs). **Change default credentials in production** (`app.js` / environment-driven setup is recommended for real deployments).

### Authentication (JWT)

Protected routes expect:

```http
Authorization: Bearer <token>
```

Tokens are issued on **register** and **login**. The payload includes internal `userId` (numeric DB `id`) used by `authenticateToken` to load the user from the database.

**Admin routes** (`/admin/*`) additionally require `role === 'ADMIN'` and pass through an admin rate limiter.

---

## API routes (base URL)

Unless you use a reverse proxy, the base is:

`http://localhost:<PORT>`

All paths below are **relative to that base**.

---

### User — prefix `/user`

| Method   | Path                    | Auth | Description                                                                                                                     |
| -------- | ----------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/user/register`        | No   | Register with `{ "password" }` (min 8 chars). Creates user with generated `userId` (e.g. `bock1`). Returns user + JWT.          |
| `POST`   | `/user/login`           | No   | Login with `{ "userId", "password" }`. `userId` is matched case-insensitively. Rate limited per IP + email. Returns user + JWT. |
| `GET`    | `/user/profile`         | Yes  | Current user profile.                                                                                                           |
| `PUT`    | `/user/profile`         | Yes  | Update `{ username, email, phone }` as needed.                                                                                  |
| `PUT`    | `/user/change-password` | Yes  | Password change (see controller for `currentPassword` / `oldPassword` / `newPassword` handling).                                |
| `DELETE` | `/user/delete`          | Yes  | Delete account (requires confirmation password in body per controller).                                                         |

---

### Category — prefix `/category`

| Method | Path         | Auth | Description          |
| ------ | ------------ | ---- | -------------------- |
| `GET`  | `/category/` | No   | List all categories. |

---

### Product — prefix `/product`

Static paths are registered **before** the dynamic `:productId` route. One route in code is `GET /product/category/:categoryId`; because `/:productId` is defined **above** it in `productRoutes.js`, a request like `/product/category/1` may be handled as `productId = "category"` depending on Express matching. Prefer using documented working paths (e.g. filter endpoints with `categoryId`) or reorder routes if you rely on `/product/category/:id`.

| Method | Path                       | Auth | Description                                              |
| ------ | -------------------------- | ---- | -------------------------------------------------------- |
| `GET`  | `/product/`                | No   | All products (with category, sizes, reviews).            |
| `GET`  | `/product/random-products` | No   | Random product selection (see controller).               |
| `GET`  | `/product/filter`          | No   | Filtered listing (query params per `getFilterProducts`). |
| `GET`  | `/product/brands`          | No   | Brands for a category (query params).                    |
| `GET`  | `/product/colours`         | No   | Colours for a category (query params).                   |
| `GET`  | `/product/sizes`           | No   | Sizes for a category (query params).                     |
| `GET`  | `/product/search`          | No   | Search products (query params).                          |
| `GET`  | `/product/:productId`      | No   | Single product by numeric ID.                            |

---

### Orders — prefix `/orders`

| Method | Path                   | Auth | Description                                                                                                                                                                                           |
| ------ | ---------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/orders/transaction`  | No   | Create Razorpay order: body `{ amount, userId }`. Returns Razorpay `order_id`, amount, currency, and public `key`.                                                                                    |
| `POST` | `/orders/create`       | No   | After payment: verify Razorpay signature; body includes `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `userId`, `cartItems`, `deliveryDate`. Creates order + success transaction. |
| `POST` | `/orders/place`        | Yes  | Direct order without gateway: `{ items[], addressId, totalAmount?, paymentMethod? }`. Items use `productId`, `quantity`, optional `productSizeId`.                                                    |
| `GET`  | `/orders/user/:userId` | No   | List orders by **numeric** internal user id (path param).                                                                                                                                             |
| `GET`  | `/orders/my-orders`    | Yes  | Authenticated user’s orders (richer include graph).                                                                                                                                                   |

---

### Cart — prefix `/cart`

**All routes require JWT.** User is taken from the token (`req.user.id`).

| Method   | Path                | Description                                      |
| -------- | ------------------- | ------------------------------------------------ |
| `POST`   | `/cart/add`         | `{ productId, quantity, productSizeId?, size? }` |
| `GET`    | `/cart/`            | Current user’s cart.                             |
| `DELETE` | `/cart/clear`       | Remove all cart lines.                           |
| `PUT`    | `/cart/:cartItemId` | Update line quantity.                            |
| `DELETE` | `/cart/:cartItemId` | Remove one line.                                 |

---

### Address — prefix `/address`

**All routes require JWT.** Listing uses the authenticated user (the `:userId` path is legacy but still hits the same handler).

| Method   | Path               | Description                                                                                                                                                                    |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`    | `/address/user`    | List addresses for logged-in user.                                                                                                                                             |
| `GET`    | `/address/:userId` | Same listing behavior (auth still required).                                                                                                                                   |
| `POST`   | `/address/`        | Add address: `nickname`, `line1`, `line2?`, `city`, `state`, `zip`, `country`, `receiverName`, `type` (`Home` \| `Office` \| `Other`), `isDefault?`. Nickname unique per user. |
| `PUT`    | `/address/:id`     | Update address; body includes `id` and fields to change.                                                                                                                       |
| `DELETE` | `/address/:id`     | Delete address.                                                                                                                                                                |

---

### Checkout — prefix `/checkout`

| Method | Path         | Auth | Description                                                                                                                                                                                                                                                    |
| ------ | ------------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/checkout/` | No\* | Places order from **cart**: body `{ userId, addressId, paymentMode? }` (default `COD`). Empties cart, adjusts stock on `productSize`, creates order + transaction. \*No JWT middleware; trust model is application-level—protect this in production if needed. |

---

### Review — prefix `/review`

| Method | Path       | Auth | Description                                                                                                                         |
| ------ | ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/review/` | No\* | `{ productId, userId, rating, comment? }`. Rating 1–5. Upserts if user already reviewed product. \*Consider securing in production. |

---

### Wishlist — prefix `/wishlist`

**All routes require JWT** (same pattern as cart).

| Method   | Path                        | Description                                      |
| -------- | --------------------------- | ------------------------------------------------ |
| `POST`   | `/wishlist/add`             | `{ productId, quantity, productSizeId?, size? }` |
| `GET`    | `/wishlist/`                | User wishlist.                                   |
| `DELETE` | `/wishlist/clear`           | Clear wishlist.                                  |
| `PUT`    | `/wishlist/:wishlistItemId` | Update item.                                     |
| `DELETE` | `/wishlist/:wishlistItemId` | Remove item.                                     |

---

### Admin — prefix `/admin`

**Requires:** `Authorization: Bearer <token>` for a user with `role: ADMIN`, plus admin rate limiting.

Products and categories support pagination via query params where noted.

| Method   | Path                        | Description                                                                                                      |
| -------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/admin/products`           | Paginated products. Query: `page`, `perPage`, `sortField`, `sortOrder` (`ASC`/`DESC`).                           |
| `GET`    | `/admin/products/:id`       | Single product with category, sizes, reviews.                                                                    |
| `POST`   | `/admin/products`           | Create product (name, image_uri, price, categoryId, optional description, ar_uri, sizeType, color, brand, etc.). |
| `PUT`    | `/admin/products/:id`       | Update product.                                                                                                  |
| `DELETE` | `/admin/products/:id`       | Delete product.                                                                                                  |
| `PUT`    | `/admin/products/:id/stock` | Update stock on product sizes.                                                                                   |
| `GET`    | `/admin/categories`         | Paginated categories (`page`, `perPage`, `sortField`, `sortOrder`).                                              |
| `GET`    | `/admin/categories/:id`     | Single category.                                                                                                 |
| `POST`   | `/admin/categories`         | Create category.                                                                                                 |
| `PUT`    | `/admin/categories/:id`     | Update category.                                                                                                 |
| `DELETE` | `/admin/categories/:id`     | Delete category.                                                                                                 |

---

## Data model (high level)

Defined in `prisma/schema.prisma`:

- **User** — credentials, optional profile, `role` (`USER` \| `ADMIN`), relations to cart, wishlist, orders, reviews, addresses, transactions.
- **Category** — name, image; has many **Product**.
- **Product** — pricing, images, optional AR URI, **ProductSize** rows for variant stock.
- **CartItem** / **WishlistItem** — tie user + product (+ optional size).
- **Order** + **Item** — placed orders and line items.
- **Transaction** — payments (Razorpay / COD / etc.).
- **Address** — shipping addresses with type enum **Home** / **Office** / **Other**.
- **Review** — product ratings.

Enums include **OrderStatus**, **TransactionStatus**, **UserRole**, **SizeType**.

---

## Security notes (production)

- Set a strong **`JWT_SECRET`**; the code falls back to a placeholder if unset.
- **`NODE_ENV=production`** enables HTTPS-only responses unless the request is secure or `X-Forwarded-Proto` indicates HTTPS (configure **`TRUST_PROXY`** correctly behind load balancers).
- Default admin bootstrap in `app.js` is convenient for development; **replace with secure provisioning** for production.
- Endpoints like **`POST /checkout`** and **`POST /review`** are not JWT-protected in code; restrict them (network, API gateway, or middleware) if you expose the API publicly.

---

## Scripts reference

| Script        | Command                                                                            |
| ------------- | ---------------------------------------------------------------------------------- |
| Start         | `npm start`                                                                        |
| Dev (nodemon) | `npm run dev`                                                                      |
| Seeds         | `npm run seed`, `npm run seed:home`, `npm run seed:categories`, `npm run seed:all` |

---

## Related files outside this README

Other entry or helper files may exist in this folder (e.g. legacy `admin.js`, `seedData.js`). The **main HTTP server** described here is **`app.js`**.

If something in this document drifts from the code, trust the repository source (`app.js`, `routes/`, `controllers/`, `prisma/schema.prisma`) as the final reference.
