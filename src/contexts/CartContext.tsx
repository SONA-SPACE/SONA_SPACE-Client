// contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getCartCount } from "../services/cartService"; // gọi API count item nếu có

const CartContext = createContext<{
  cartCount: number;
  setCartCount: (count: number) => void;
}>({
  cartCount: 0,
  setCartCount: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Load từ localStorage hoặc gọi API khi lần đầu
    const fetchCount = async () => {
      const count = await getCartCount(); // hoặc từ localStorage
      setCartCount(count);
    };
    fetchCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
