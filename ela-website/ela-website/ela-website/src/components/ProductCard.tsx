import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Zap } from "lucide-react";
import { Product, formatPrice } from "@/data/products";
import { getFirstItemCode } from "@/data/itemCodes";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const hasMultipleImages = product.images.length > 1;
  const itemCode = getFirstItemCode(product.id);

  // Existing pattern from SearchResultItem.tsx:1 & QuickViewModal.tsx:1
  // stock ?? quantity — data-driven, no hardcoding.
  const stockValue = product.stock ?? product.quantity;
  const hasStock = stockValue !== undefined && stockValue !== null;
  const outOfStock = hasStock && stockValue === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const defaultSize = product.sizes?.[0] ?? "Free Size";
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: defaultSize,
      quantity: 1,
      image: product.images?.[0] ?? product.image,
      itemCode: itemCode ?? undefined,
    });
    toast.success("Added to cart", {
      description: `${product.name} (${defaultSize})`,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    
    const defaultSize = product.sizes?.[0] ?? "Free Size";
    navigate("/checkout", {
      state: {
        buyNowProduct: {
          id: product.id,
          name: product.name,
          price: product.price,
          size: defaultSize,
          quantity: 1,
          image: product.images?.[0] ?? product.image,
          itemCode: itemCode ?? undefined,
        }
      }
    });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="product-card group"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden bg-secondary">
          <img
            src={product.images[currentImage] || product.image}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
          {hasMultipleImages && (
            <>
              <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background shadow-sm" aria-label="Previous image">
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background shadow-sm" aria-label="Next image">
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {product.images.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${i === currentImage ? "bg-foreground" : "bg-foreground/40"}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (<span className="px-3 py-1.5 bg-foreground text-background text-[10px] font-semibold tracking-[0.15em] uppercase">New</span>)}
            {product.isBestseller && (<span className="px-3 py-1.5 bg-brand text-brand-foreground text-[10px] font-semibold tracking-[0.15em] uppercase shadow-glow">Bestseller</span>)}
            {product.originalPrice && (<span className="px-3 py-1.5 bg-destructive text-destructive-foreground text-[10px] font-semibold tracking-[0.15em] uppercase">Sale</span>)}
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-700 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none">
            <span className="inline-block px-6 py-2.5 bg-background text-foreground text-xs tracking-[0.15em] uppercase font-medium">View Details</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-serif text-lg mb-2 group-hover:text-brand transition-colors duration-300">{product.name}</h3>
          <p className="text-muted-foreground text-xs mt-2 tracking-wide capitalize">{product.category}</p>
          {itemCode && (<p className="text-[9px] font-mono text-muted-foreground/40 mt-1 tracking-wider">{itemCode}</p>)}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xl text-brand">{formatPrice(product.price)}</span>
              {product.originalPrice && (<span className="text-muted-foreground line-through text-xs">{formatPrice(product.originalPrice)}</span>)}
            </div>
            {hasStock && (
              <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${outOfStock ? "bg-red-100" : "bg-green-100"}`} aria-label={`${stockValue} items left`}>
                <span className={`font-semibold text-xl leading-none ${outOfStock ? "text-red-600" : "text-green-700"}`}>{stockValue}</span>
                <span className={`text-xs mt-0.5 leading-none font-medium ${outOfStock ? "text-red-600" : "text-green-700"}`}>left</span>
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center justify-end gap-2 sm:gap-3">
            {/* Buy Now — direct payment */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.45 }}
              onClick={handleBuyNow}
              disabled={outOfStock}
              title="Buy Now"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 shrink-0 border ${
                outOfStock
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-border text-muted-foreground hover:border-brand hover:text-brand active:scale-[0.97]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span className="tracking-wide">Buy</span>
            </motion.button>
            {/* Add to Cart — primary action */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-md shrink-0 ${
                outOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-brand text-brand-foreground hover:bg-brand/92 hover:shadow-xl hover:shadow-brand/25 active:scale-[0.97]"
              }`}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
              <span className="tracking-wide">{outOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;