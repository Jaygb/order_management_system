import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('bitedash_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[CartContext] Failed to parse cart from localStorage:', error);
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bitedash_cart', JSON.stringify(cart));
  }, [cart]);

  /**
   * Adds an item to the cart or increments its quantity if already present
   */
  const addToCart = (menuItem) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.id === menuItem.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  };

  /**
   * Updates an item's quantity or removes it if new quantity is 0
   */
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.floor(quantity) } : item
      )
    );
  };

  /**
   * Removes an item from the cart completely
   */
  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  /**
   * Empties the cart
   */
  const clearCart = () => {
    setCart([]);
  };

  // Derived properties
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal: Number(subtotal.toFixed(2)),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
export default CartContext;
