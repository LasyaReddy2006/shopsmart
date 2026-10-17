# ShopSmart — Interview Preparation Guide

25 interview questions with simple, clear answers + 5 coding exercises.

---

## SECTION 1: React

---

### Q1. What is a React component?
**Answer:**
A React component is a JavaScript function that returns JSX (HTML-like code).
It describes a piece of the UI. For example, `ProductCard` is a component that
displays one product. Components can receive data through `props` and manage their
own state with `useState`.

```jsx
// A simple component
function ProductCard({ product }) {
  return <div>{product.name} — ${product.price}</div>;
}
```

---

### Q2. What is the difference between props and state?
**Answer:**
- **Props** are data passed INTO a component from its parent. The component cannot change them. Think of them as parameters.
- **State** is data that lives INSIDE a component and can change. When state changes, React re-renders the component.

```jsx
// Props: received from outside
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}

// State: managed inside
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

### Q3. What does useEffect do? When does it run?
**Answer:**
`useEffect` runs code AFTER the component renders. It's used for:
- Fetching data from an API
- Setting up subscriptions or timers
- Reading from localStorage

The second argument (the dependency array) controls WHEN it runs:
- `[]` → runs once after the first render
- `[id]` → runs when `id` changes
- No array → runs after EVERY render

```jsx
useEffect(() => {
  // Runs once when the component mounts
  fetch('/api/products').then(r => r.json()).then(setProducts);
}, []); // empty array = run once
```

---

### Q4. What is the React Context API and why did you use it?
**Answer:**
Context lets you share data across many components without passing props through every level (called "prop drilling"). In ShopSmart, I used two contexts:

- **AuthContext** — shares the logged-in user object, login(), and logout() with every component that needs it
- **CartContext** — shares cart items and functions (addToCart, removeFromCart) so any page can access the cart

Without Context, I would have to pass `user` and `cart` as props from App.jsx down through every single component.

---

### Q5. How does the shopping cart persist across page refreshes?
**Answer:**
The CartContext saves cart data to `localStorage` using `useEffect`. When the app
first loads, it reads from localStorage using a lazy initializer in `useState`.

```jsx
// Load from localStorage on mount
const [cartItems, setCartItems] = useState(() => {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
});

// Save to localStorage whenever items change
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cartItems));
}, [cartItems]);
```

---

### Q6. What is React Router? How does `useNavigate` work?
**Answer:**
React Router is a library for client-side navigation — it lets you switch between pages without reloading the browser. `useNavigate()` returns a function that lets you programmatically navigate to a different route.

```jsx
const navigate = useNavigate();
// After login, redirect to home
navigate('/');
// Go back to the previous page
navigate(-1);
```

---

### Q7. What is a controlled form component?
**Answer:**
In a controlled form, React state is the "single source of truth" for the input value. Every keystroke calls `setState`, and the input's `value` always reflects the current state.

```jsx
const [email, setEmail] = useState('');
<input
  value={email}                          // State controls the displayed value
  onChange={e => setEmail(e.target.value)} // Every keystroke updates state
/>
```

---

## SECTION 2: Express and REST APIs

---

### Q8. What is Express.js and what does it do?
**Answer:**
Express is a Node.js framework that makes it easy to create a web server with routes. It receives HTTP requests (GET, POST, PUT, DELETE) and sends back responses (usually JSON).

```js
const app = express();
app.get('/api/products', (req, res) => {
  res.json([{ id: 1, name: 'Headphones' }]);
});
app.listen(5000);
```

---

### Q9. Explain the difference between GET, POST, PUT and DELETE.
**Answer:**
| Method | Purpose | Example in ShopSmart |
|--------|---------|----------------------|
| GET | Read data, no changes | Fetch all products |
| POST | Create new data | Place an order, register |
| PUT | Update existing data | Edit a product, change order status |
| DELETE | Remove data | Delete a product |

---

### Q10. What is middleware in Express? Give an example.
**Answer:**
Middleware is a function that runs BETWEEN receiving the request and sending the response. It can check the request, modify it, or stop it.

In ShopSmart, `authenticateToken` is middleware that:
1. Reads the JWT from the request header
2. Verifies the token
3. Attaches the decoded user to `req.user`
4. Calls `next()` to continue to the actual route handler

```js
// This runs before the route handler
app.get('/api/auth/profile', authenticateToken, getProfile);
//                           ^^^^^^^^^^^^^^^^^^^
//                           This is the middleware
```

---

### Q11. What are HTTP status codes? Which ones did you use?
**Answer:**
Status codes tell the client what happened:
- **200** — OK (request succeeded)
- **201** — Created (new resource was created)
- **400** — Bad Request (the client sent invalid data)
- **401** — Unauthorized (not logged in)
- **403** — Forbidden (logged in but not allowed)
- **404** — Not Found (resource doesn't exist)
- **409** — Conflict (email already exists)
- **500** — Internal Server Error (something broke on the server)

---

## SECTION 3: SQL and Database

---

### Q12. Explain the database tables and their relationships.
**Answer:**
```
users         → one user can have many orders       (1:N)
orders        → one order belongs to one user       (N:1)
order_items   → one order has many items            (1:N)
products      → one product appears in many items   (N:M via order_items)
```
The `user_id` column in orders is a **foreign key** that links back to `users.id`.
The `order_id` column in order_items links back to `orders.id`.

---

### Q13. What is a SQL JOIN? How did you use it?
**Answer:**
A JOIN combines rows from two tables based on a related column. In the admin orders page, I JOIN orders with users to show the customer name alongside each order:

```sql
SELECT o.*, u.name AS customer_name, u.email AS customer_email
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;
```
Without the JOIN, I would only have the `user_id` number, not the customer's name.

---

### Q14. Why did you store product_name and unit_price in order_items?
**Answer:**
Order history must be accurate even if prices or product names change later. If I only stored `product_id` and looked up the current name/price, an old order would show wrong information.

Storing a **snapshot** at purchase time means: if a product was "$89.99 Wireless Headphones" when you bought it, your order history will always show exactly that — even if the product is later renamed or repriced.

---

### Q15. What is a MySQL transaction and why did you use one for orders?
**Answer:**
A transaction is a group of SQL statements that either ALL succeed or ALL fail together. It follows ACID principles — Atomicity means everything or nothing.

In the order placement:
1. I insert the order
2. I insert all order items
3. I reduce stock for each product

If step 2 fails (e.g. a product doesn't exist), I want to **undo** step 1 automatically. Without a transaction, I would have an order record with no items.

```js
await conn.beginTransaction();
try {
  // ... all SQL operations ...
  await conn.commit();   // Everything succeeded
} catch (err) {
  await conn.rollback(); // Undo everything
}
```

---

### Q16. What is `SELECT ... FOR UPDATE`? Why did you use it?
**Answer:**
`SELECT ... FOR UPDATE` locks the selected rows until the transaction ends. This prevents a **race condition** where two simultaneous orders both see "stock = 1", both check that it's enough, and both succeed — resulting in stock going to -1.

With the lock, the second transaction waits until the first one commits or rolls back. Then it reads the updated stock (now 0) and correctly rejects the order.

---

### Q17. How do parameterized queries prevent SQL injection?
**Answer:**
SQL injection is when an attacker puts SQL code inside a form field, like:
```
email: anything' OR '1'='1
```
A badly written query would become:
```sql
SELECT * FROM users WHERE email = 'anything' OR '1'='1'
-- This returns ALL users!
```
Parameterized queries use `?` placeholders and pass values separately:
```js
pool.query('SELECT * FROM users WHERE email = ?', [email]);
```
The database treats the value as plain data, never as SQL code. The `?` can never execute as SQL.

---

### Q18. Why use DECIMAL for prices instead of FLOAT?
**Answer:**
FLOAT arithmetic has rounding errors. For example:
```
0.1 + 0.2 = 0.30000000000000004  (in floating point!)
```
`DECIMAL(10, 2)` stores exact decimal values, making it correct for financial calculations. A price of `$89.99` is always exactly `89.99`, never `89.98999...`.

---

## SECTION 4: Authentication

---

### Q19. How does JWT authentication work?
**Answer:**
1. User logs in → server checks password with bcrypt
2. Server creates a JWT (JSON Web Token) containing user ID, name, email, role — **signed** with a secret key
3. Server returns the token to the client
4. Client stores it in localStorage
5. Every future API request includes the token in the `Authorization` header
6. Server uses `jwt.verify()` to check the token — if valid, extracts the user info

The token is **stateless** — the server doesn't store sessions. The signature proves the token hasn't been tampered with.

---

### Q20. Why do you hash passwords? How does bcrypt work?
**Answer:**
Passwords must never be stored in plain text. If the database is breached, attackers would get all passwords immediately.

`bcrypt.hash(password, 10)` creates a one-way hash:
- Generates a random "salt" and appends it to the password
- Runs a slow hashing algorithm (the `10` is cost factor — higher = slower = harder to brute-force)
- Returns a unique hash every time, even for the same password

To verify: `bcrypt.compare(plainPassword, storedHash)` — returns true if they match.

---

### Q21. How do you protect admin routes on both frontend and backend?
**Answer:**
**Frontend** (presentation only):
- `AdminRoute` component checks `user.role === 'admin'` from Context
- If not admin, redirects to home page
- This prevents accidental navigation but is NOT a security measure

**Backend** (actual security):
- `requireAdmin` middleware checks `req.user.role` — this comes from the JWT, set by the SERVER at login
- An attacker cannot change the role in the token without knowing the JWT secret
- Every admin API call checks this middleware

The frontend check is just UX. The backend check is the real security.

---

## SECTION 5: Application Logic

---

### Q22. How does the cart calculate the total?
**Answer:**
```js
// In CartContext
const cartTotal = cartItems.reduce((sum, item) => {
  return sum + item.price * item.quantity;
}, 0);
```
`reduce` iterates through every cart item, starting with `sum = 0`, and adds `price × quantity` for each item.

But this is only an **estimate**. The real total is always recalculated on the backend using prices from the database.

---

### Q23. Why do you calculate the order total on the backend, not the frontend?
**Answer:**
Frontend code can be modified by anyone using browser dev tools. A user could change product prices in React state before checkout.

The backend never trusts the price from the client. It fetches current prices from MySQL and calculates the total itself. This ensures customers always pay the correct amount.

---

### Q24. How do you ensure a customer can only see their own orders?
**Answer:**
In `getOrderById`:
```js
const order = orders[0];
// Check: is this the owner, or an admin?
if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
  return res.status(403).json({ message: 'Access denied.' });
}
```
`req.user.id` comes from the JWT token — it's the authenticated user's ID. We compare it with the `user_id` stored in the order. If they don't match and the requester isn't an admin, we reject the request with a 403 Forbidden.

---

### Q25. How do you handle stock management during checkout?
**Answer:**
1. Lock each product row with `SELECT ... FOR UPDATE`
2. Check `stock_quantity >= requested quantity`
3. If not enough: rollback the transaction and return an error
4. If enough: after inserting the order, run:
   ```sql
   UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
   ```
5. The database constraint prevents negative stock because we check before deducting

The `FOR UPDATE` lock prevents the **race condition** where two simultaneous requests both see enough stock but together exceed it.

---

## 🖊️ CODING EXERCISES

Practice rewriting these key parts from scratch. These are the most likely to be asked in interviews.

---

### Exercise 1: Rewrite the login API endpoint

**Task:** Write an Express route handler for `POST /api/auth/login`.
It should:
1. Accept `{ email, password }` from the request body
2. Find the user in the database
3. Compare the password using bcrypt
4. If valid, create a JWT token and return it

```js
// Starter — fill in the blanks
async function login(req, res) {
  const { email, password } = req.body;
  // 1. Validate inputs
  // 2. Find user by email using SQL
  // 3. Compare password with bcrypt
  // 4. Create JWT token
  // 5. Return token and user data
}
```

---

### Exercise 2: Rewrite the CartContext

**Task:** Create a React context that:
1. Loads cart from localStorage on startup
2. Saves to localStorage whenever the cart changes
3. Has `addToCart(product, quantity)` — adds or increases quantity
4. Has `removeFromCart(productId)`
5. Calculates `cartTotal` as a derived value

---

### Exercise 3: Rewrite the order placement transaction

**Task:** Write the SQL transaction logic in Node.js that:
1. Gets a connection and begins a transaction
2. For each item: locks the product row and checks stock
3. Inserts the order and each order item
4. Deducts stock for each product
5. Commits on success, rolls back on any error

---

### Exercise 4: Rewrite the auth middleware

**Task:** Write an Express middleware function called `authenticateToken` that:
1. Reads the `Authorization: Bearer <token>` header
2. Returns 401 if there's no token
3. Uses `jwt.verify()` to validate the token
4. Attaches the decoded payload to `req.user`
5. Returns 403 if the token is invalid or expired
6. Calls `next()` to continue to the route handler

---

### Exercise 5: Rewrite the product filter query

**Task:** Write a function that:
1. Accepts `{ search, category, sort }` from `req.query`
2. Builds a dynamic SQL query using `WHERE 1=1` and appends conditions only when provided
3. Uses parameterized `?` placeholders for safety
4. Returns the results as JSON

---

## 💡 Key Concepts to Memorize

| Concept | One-sentence summary |
|---------|----------------------|
| JWT | A signed token that proves who the user is, without storing sessions |
| bcrypt | A slow, salted hash algorithm for storing passwords safely |
| SQL Transaction | A group of SQL statements that all succeed or all fail together |
| SELECT FOR UPDATE | Locks database rows to prevent concurrent modification |
| Parameterized queries | Use `?` placeholders to prevent SQL injection |
| React Context | Shares data globally without prop drilling |
| localStorage | Browser storage that persists across page refreshes |
| DECIMAL vs FLOAT | DECIMAL is exact; FLOAT has rounding errors |
| Foreign key | A column that references the primary key of another table |
| REST | A convention for designing APIs using HTTP methods and clear URLs |
