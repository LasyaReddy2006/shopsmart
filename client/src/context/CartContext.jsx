// CartContext.jsx
// Provides shopping cart state to the entire app
// Cart is saved in localStorage so it persists after page refresh

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on first render
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Whenever cartItems changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add a product to the cart, or increase quantity if already in cart
  function addToCart(product, quantity = 1) {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Increase quantity but don't exceed available stock
        const newQty = Math.min(existing.quantity + quantity, product.stock_quantity);
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      // Add new item to cart
      return [...prev, { ...product, quantity }];
    });
  }

  // Change quantity of an item (used by + and - buttons)
  function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  // Remove one item from the cart
  function removeFromCart(productId) {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }

  // Empty the entire cart (called after a successful order)
  function clearCart() {
    setCartItems([]);
  }

  // Total number of items across all products
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Total price
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, updateQuantity, removeFromCart, clearCart,
      cartCount, cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
