import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  itemCode?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const trackFunnel = useCallback(async (_eventType: string, _metadata: Record<string, unknown>) => {
    // Funnel tracking is now handled by the FastAPI backend and not by Supabase.
  }, []);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (i) => i.id === item.id && i.size === item.size
      );
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    trackFunnel("add_to_cart", { product_id: item.id, product_name: item.name, size: item.size, quantity: item.quantity, price: item.price });
  };

  const removeFromCart = (id: string, size: string) => {
    const item = cartItems.find((i) => i.id === id && i.size === size);
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
    if (item) trackFunnel("remove_from_cart", { product_id: id, product_name: item.name, size });
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
