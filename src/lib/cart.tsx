import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceKes: number;
  imageUrl: string | null;
  size: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: string | null) => void;
  setQuantity: (productId: string, size: string | null, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sjm-cart-v1";

function keyOf(productId: string, size: string | null) {
  return `${productId}::${size ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore corrupt cart
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const k = keyOf(item.productId, item.size);
      const existing = prev.find((i) => keyOf(i.productId, i.size) === k);
      if (existing) {
        return prev.map((i) =>
          keyOf(i.productId, i.size) === k ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string | null) => {
    setItems((prev) => prev.filter((i) => keyOf(i.productId, i.size) !== keyOf(productId, size)));
  }, []);

  const setQuantity = useCallback((productId: string, size: string | null, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => keyOf(i.productId, i.size) !== keyOf(productId, size))
        : prev.map((i) =>
            keyOf(i.productId, i.size) === keyOf(productId, size) ? { ...i, quantity } : i,
          ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.priceKes, 0);
    return { items, count, subtotal, addItem, removeItem, setQuantity, clear };
  }, [items, addItem, removeItem, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
