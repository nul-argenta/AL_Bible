import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ShopifyProduct } from "@/lib/shopify";

interface WishlistContextType {
  items: ShopifyProduct[];
  addItem: (product: ShopifyProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: ShopifyProduct) => void;
  isInWishlist: (productId: string) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ShopifyProduct[]>([]);

  const addItem = useCallback((product: ShopifyProduct) => {
    setItems((prev) => {
      if (prev.some((i) => i.node.id === product.node.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.node.id !== productId));
  }, []);

  const toggleItem = useCallback((product: ShopifyProduct) => {
    setItems((prev) =>
      prev.some((i) => i.node.id === product.node.id)
        ? prev.filter((i) => i.node.id !== product.node.id)
        : [...prev, product]
    );
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some((i) => i.node.id === productId);
  }, [items]);

  const itemCount = items.length;

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isInWishlist, itemCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
