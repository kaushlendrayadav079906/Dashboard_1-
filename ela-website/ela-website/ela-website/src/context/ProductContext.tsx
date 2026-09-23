import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  item_code?: string | null;
  barcode?: string | null;
  price: number;
  originalPrice?: number | null;
  category: string;
  sizes: string[];
  colors: string[];
  image?: string | null;
  images: string[];
  colorImages?: Record<string, string[]>;
  description?: string | null;
  fabric?: string | null;
  care?: string | null;
  isBestseller?: boolean;
  isNew?: boolean;
  stock?: number | null;
  quantity?: number;
  item_group_code?: number | null;
}

interface ProductContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface APIProduct extends Omit<Product, "originalPrice"> {
  original_price?: number | null;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    apiFetch<APIProduct[]>("/api/v1/products")
      .then((result) => {
        if (active) {
          setProducts(result.map(({ original_price, ...product }) => ({
            ...product,
            originalPrice: original_price,
          })));
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setProducts([]);
          setError(requestError instanceof Error ? requestError.message : "Unable to load products");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within a ProductProvider");
  return context;
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
