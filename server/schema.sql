-- ===========================================
-- ShopSmart Database Schema
-- Run this file in MySQL to set up the database
-- ===========================================

-- Create the database
CREATE DATABASE IF NOT EXISTS shopsmart;
USE shopsmart;

-- ===========================================
-- USERS TABLE
-- Stores both customers and admins
-- The 'role' column controls access level
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,      -- bcrypt hashed, never plain text
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- PRODUCTS TABLE
-- Stores all product information
-- stock_quantity tracks available inventory
-- ===========================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,        -- DECIMAL avoids floating-point errors
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  stock_quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),        -- Index speeds up category filtering
  INDEX idx_name (name)                 -- Index speeds up name search
);

-- ===========================================
-- ORDERS TABLE
-- One order per checkout, linked to a user
-- We store delivery details on the order itself
-- ===========================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,  -- Calculated on backend, never trusted from frontend
  delivery_name VARCHAR(100) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_phone VARCHAR(20) NOT NULL,
  status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),           -- Index speeds up "get my orders" queries
  INDEX idx_status (status)
);

-- ===========================================
-- ORDER ITEMS TABLE
-- Each row is one product line in an order
-- We store product_name and unit_price AT TIME OF PURCHASE
-- This means order history stays accurate even if product
-- name or price changes later
-- ===========================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,                        -- Can be NULL if product is deleted later
  product_name VARCHAR(200) NOT NULL,    -- Snapshot of name at purchase time
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,    -- Snapshot of price at purchase time
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order_id (order_id)
);

-- ===========================================
-- SAMPLE PRODUCTS (fictional data)
-- ===========================================
INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
(
  'Wireless Noise-Cancelling Headphones',
  'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for work, travel, and everyday listening.',
  89.99,
  'Electronics',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  45
),
(
  'Mechanical Gaming Keyboard',
  'Compact TKL mechanical keyboard with RGB backlight, tactile blue switches, and durable aluminum frame. Built for serious gamers.',
  64.99,
  'Electronics',
  'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
  30
),
(
  'Ergonomic Office Chair',
  'Adjustable lumbar support, breathable mesh back, and padded armrests. Designed for all-day comfort during long work sessions.',
  249.99,
  'Furniture',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  12
),
(
  'Stainless Steel Water Bottle',
  'Double-wall insulated 32oz bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof.',
  24.99,
  'Kitchen',
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
  100
),
(
  'Running Shoes - Men''s',
  'Lightweight cushioned running shoes with breathable mesh upper and responsive foam sole. Ideal for road running and gym workouts.',
  79.99,
  'Sports',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  60
),
(
  'Yoga Mat Premium',
  'Non-slip 6mm thick yoga mat with alignment lines and carrying strap. Suitable for yoga, pilates, and stretching.',
  34.99,
  'Sports',
  'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80',
  75
),
(
  'Ceramic Coffee Mug Set',
  'Set of 4 hand-crafted ceramic mugs in earthy tones. Microwave and dishwasher safe. Capacity 350ml each.',
  29.99,
  'Kitchen',
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
  50
),
(
  'Desk Lamp with USB Charging',
  'LED desk lamp with 5 colour temperatures, touch dimmer, and built-in USB-A and USB-C charging ports.',
  44.99,
  'Electronics',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  35
),
(
  'Hardcover Notebook - A5',
  'Dotted grid hardcover journal, 200 pages, acid-free ivory paper. Great for bullet journalling, sketching, and notes.',
  14.99,
  'Stationery',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
  200
),
(
  'Portable Bluetooth Speaker',
  'Waterproof IPX7 portable speaker with 360° surround sound and 20-hour playback. Pairs with any Bluetooth device.',
  54.99,
  'Electronics',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
  40
),
(
  'Bamboo Cutting Board Set',
  'Set of 3 eco-friendly bamboo cutting boards in graduated sizes with juice grooves and non-slip feet.',
  39.99,
  'Kitchen',
  'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
  55
),
(
  'Cotton Throw Blanket',
  'Soft woven cotton throw blanket, 127x152cm. Machine washable. Available in neutral tones to suit any home.',
  49.99,
  'Home',
  'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80',
  80
),
(
  'Wireless Charging Pad',
  '15W fast wireless charger compatible with Qi-enabled devices. Slim design with LED indicator and anti-slip surface.',
  19.99,
  'Electronics',
  'https://images.unsplash.com/photo-1586495777744-4e6232bf2919?w=600&q=80',
  90
),
(
  'Indoor Plant Pot Set',
  'Set of 3 minimalist ceramic plant pots with drainage holes and bamboo trays. Sizes: 10cm, 14cm, 18cm diameter.',
  32.99,
  'Home',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80',
  65
),
(
  'Resistance Bands Set',
  'Set of 5 latex resistance bands with varying tension levels. Includes door anchor and carrying bag.',
  22.99,
  'Sports',
  'https://images.unsplash.com/photo-1598971639058-fab3c3109a3e?w=600&q=80',
  110
),
(
  'Scented Soy Candle',
  'Hand-poured soy wax candle with cotton wick. Available in lavender, vanilla, and citrus. Burns for up to 50 hours.',
  18.99,
  'Home',
  'https://images.unsplash.com/photo-1602610516822-4d4d32e4bcef?w=600&q=80',
  0
);

-- ===========================================
-- SAMPLE USERS (Demo Admin & Customer)
-- Passwords:
-- Admin:    admin@shopsmart.com / admin123
-- Customer: john@example.com    / customer123
-- ===========================================
INSERT INTO users (id, name, email, password, role) VALUES
(
  1,
  'ShopSmart Admin',
  'admin@shopsmart.com',
  '$2b$10$lKj2EL3yRbe1xwizhLgDAeDlHbE.DJP6zNEmyQS8KO5bAShosT.yS',
  'admin'
),
(
  2,
  'John Customer',
  'john@example.com',
  '$2b$10$rS4z4IfPanr3HZSo04ZDDOxtLFwIxh8VLQGXOJXwEWXskoEXH9NPm',
  'customer'
)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ===========================================
-- SAMPLE ORDERS & ORDER ITEMS (For Admin Dashboard & Order History)
-- ===========================================
INSERT INTO orders (id, user_id, total_amount, delivery_name, delivery_address, delivery_phone, status, created_at) VALUES
(
  1,
  2,
  154.98,
  'John Customer',
  '742 Evergreen Terrace, Springfield, OR 97477',
  '+1 555-0199',
  'Processing',
  NOW() - INTERVAL 2 DAY
),
(
  2,
  2,
  89.99,
  'John Customer',
  '742 Evergreen Terrace, Springfield, OR 97477',
  '+1 555-0199',
  'Delivered',
  NOW() - INTERVAL 7 DAY
)
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price) VALUES
(1, 1, 1, 'Wireless Noise-Cancelling Headphones', 1, 89.99),
(2, 1, 2, 'Mechanical Gaming Keyboard', 1, 64.99),
(3, 2, 1, 'Wireless Noise-Cancelling Headphones', 1, 89.99)
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name);

