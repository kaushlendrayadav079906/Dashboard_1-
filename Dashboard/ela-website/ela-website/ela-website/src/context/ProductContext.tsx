import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  item_code?: string | null;
  itemCode?: string | null;
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
  itemCode?: string | null;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

/**
 * Resolve an image field value to a full browser-usable URL.
 *
 * The ELA FastAPI backend returns relative proxy paths such as:
 *   /api/v1/products/{item_code}/image
 *
 * We prepend API_BASE_URL so the browser requests:
 *   http://127.0.0.1:8001/api/v1/products/{item_code}/image
 *
 * The browser never directly contacts SAP. All SAP auth happens server-side.
 */
function resolveImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return value;
}

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    apiFetch<APIProduct[]>("/api/v1/products")
      .then((result) => {
        if (active) {
          setProducts(result.map(({ original_price, image, images, ...product }) => ({
            ...product,
            originalPrice: original_price,
            // Resolve relative proxy paths to full browser-accessible URLs.
            // SAP filesystem paths are NEVER forwarded — the backend returns
            // /api/v1/products/{item_code}/image instead.
            image: resolveImageUrl(image),
            images: Array.isArray(images)
              ? images.map((img) => resolveImageUrl(img)).filter(Boolean) as string[]
              : [],
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

