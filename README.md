# ShopSmart — E-Commerce & Inventory Management System

A full-stack e-commerce web application built with React, Node.js, Express and MySQL.
This is a placement/portfolio project demonstrating real frontend-backend integration,
secure authentication, shopping cart management, and transactional order processing.

---

## 📌 Features

### Customer
- Browse, search, and filter a product catalogue
- Sort products by price or name
- Product detail pages with stock information
- Shopping cart with quantity controls (persisted in localStorage)
- Secure checkout with delivery details
- Order placement with server-side total calculation
- Order history and individual order details
- User registration and login with JWT authentication

### Admin
- Dashboard with live statistics (products, orders, customers, revenue)
- Low-stock product alerts
- Add, edit, and delete products
- View all customer orders with expandable item details
- Update order status (Pending → Processing → Shipped → Delivered)

---

## 🛠 Technology Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Frontend  | React 18, Vite, React Router DOM, Axios |
| Backend   | Node.js, Express.js   |
| Database  | MySQL (via mysql2)    |
| Auth      | bcryptjs, jsonwebtoken |
| Styling   | Plain CSS (no frameworks) |

---

## 🗄 Database Schema

```
users ──────────────────────────────────────
  id, name, email (unique), password (hashed),
  role (customer|admin), created_at

products ───────────────────────────────────
  id, name, description, price (DECIMAL),
  category, image_url, stock_quantity, created_at

orders ─────────────────────────────────────
  id, user_id (FK→users), total_amount (DECIMAL),
  delivery_name, delivery_address, delivery_phone,
  status (Pending|Processing|Shipped|Delivered|Cancelled),
  created_at

order_items ────────────────────────────────
  id, order_id (FK→orders), product_id (FK→products),
  product_name (snapshot), quantity, unit_price (snapshot)
```

**Relationships:**
- One User → Many Orders (1:N)
- One Order → Many OrderItems (1:N)
- One Product → Many OrderItems (1:N via order_id)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- MySQL 8.0+ ([mysql.com](https://www.mysql.com))

### 1. Clone / open the project

```bash
cd shopsmart
```

### 2. Set up MySQL Database

Open MySQL Workbench or the MySQL CLI and run:

```bash
mysql -u root -p < server/schema.sql
```

Or paste the contents of `server/schema.sql` into MySQL Workbench and execute it.

This creates the `shopsmart` database, all tables, and 16 sample products.

### 3. Configure Environment Variables

Edit `server/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=shopsmart
JWT_SECRET=change_this_to_a_long_random_string_in_production
PORT=5000
```

> ⚠️ Never commit `.env` to GitHub. Add it to `.gitignore`.

### 4. Install and start the backend

```bash
cd server
npm install
npm run dev
```

You should see:
```
🚀 ShopSmart server running on http://localhost:5000
✅ MySQL database connected successfully
```

### 5. Install and start the frontend

In a new terminal:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Creating an Admin Account

**Self-registration always creates a `customer` account.** To create an admin:

1. Register a normal account through the UI (e.g. `admin@shopsmart.com`)
2. Run this SQL in MySQL:

```sql
USE shopsmart;
UPDATE users SET role = 'admin' WHERE email = 'admin@shopsmart.com';
```

3. Log in — you will now see the **Admin** link in the navbar.

---

## 📡 API Endpoints

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new customer |
| POST | `/api/auth/login` | Login, receive JWT token |
| GET | `/api/auth/profile` | Get logged-in user profile (auth) |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List all products (supports `?search=&category=&sort=`) |
| GET | `/api/products/categories` | Get distinct categories |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Place a new order (auth customer) |
| GET | `/api/orders/my` | Get my orders (auth customer) |
| GET | `/api/orders/:id` | Get single order + items (auth, own order or admin) |
| GET | `/api/orders` | Get all orders (admin) |
| PUT | `/api/orders/:id/status` | Update order status (admin) |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/stats` | Get total counts and revenue (admin) |
| GET | `/api/dashboard/low-stock` | Products with stock < 10 (admin) |

---

## 🛒 How Order Processing Works

When a customer clicks "Place Order":

1. **Frontend** sends: product IDs, quantities, delivery details
2. **Backend** validates authentication (JWT token)
3. Validates delivery details (name, address, phone)
4. Gets a dedicated MySQL connection for the transaction
5. **Starts a MySQL transaction** (`BEGIN TRANSACTION`)
6. For each item, runs `SELECT ... FOR UPDATE` — this locks the row so no other order can simultaneously buy the last unit
7. Checks that stock is sufficient
8. Uses the **real database price** — ignores any price the frontend might send
9. Calculates the total server-side
10. Inserts the `orders` row
11. For each item, inserts an `order_items` row (saving name + price snapshot)
12. Reduces `stock_quantity` for each product
13. **COMMITS** the transaction (all changes become permanent)
14. Returns order ID and total to the frontend

If **any step fails**, the transaction is **rolled back** — no partial order is saved.

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (cost factor 10) — never stored in plain text
- JWT tokens expire after 7 days
- Admin role is verified from the JWT token on every admin API call
- Customers can only access their own orders (checked by `user_id`)
- All SQL uses parameterized queries — immune to SQL injection
- Order totals are always calculated on the backend

---

## 📁 Project Structure

```
shopsmart/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Navbar, ProductCard, CartItem, etc.
│       ├── context/         # AuthContext, CartContext
│       ├── pages/           # All page components
│       ├── services/        # Axios API instance
│       ├── App.jsx          # Router + all routes
│       └── index.css        # Global styles
│
└── server/                  # Express backend
    ├── config/db.js         # MySQL connection pool
    ├── middleware/          # JWT auth middleware
    ├── routes/              # Route definitions
    ├── controllers/         # Business logic
    ├── server.js            # Entry point
    └── schema.sql           # Database setup
```

---

## 🌐 Deployment Notes

### Backend (e.g. Railway, Render)
1. Push to GitHub
2. Connect to Railway/Render
3. Set environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`
4. Start command: `node server.js`

### Frontend (e.g. Vercel, Netlify)
1. Update `client/src/services/api.js` — change `baseURL` to your deployed backend URL
2. Push to GitHub
3. Connect to Vercel/Netlify, set build command: `npm run build`, output: `dist`

### CORS
Update `server/server.js` CORS `origin` to include your frontend production URL.
