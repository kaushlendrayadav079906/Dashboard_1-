import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight as ChevronRightIcon, Minus, Plus, Heart, Truck, RotateCcw, Ruler } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { formatPrice, useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const product = products.find((item) => item.id === (id || ""));
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "fabric" | "delivery">("description");

  // Get images for current selected color
  const currentImages = useMemo(() => {
    if (!product) return [];
    if (selectedColor && product.colorImages?.[selectedColor]) {
      return product.colorImages[selectedColor];
    }
    // Default: show first color's images or all images
    const firstColor = product.colors[0];
    if (product.colorImages?.[firstColor]) {
      return product.colorImages[firstColor];
    }
    return product.images;
  }, [product, selectedColor]);

  const activeColor = selectedColor || (product?.colors[0] ?? "");

  const currentItemCode = product?.item_code || undefined;

  if (!product) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="heading-section mb-4">Product Not Found</h1>
            <Link to="/shop" className="text-brand hover:underline text-sm">← Back to Shop</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.image,
      itemCode: currentItemCode,
    });
    toast.success("Added to cart", {
      description: `${product.name} (${selectedSize}) x ${quantity}`,
    });
  };

  return (
    <Layout>
      <div className="container-wide section-padding">
        {/* Breadcrumb */}
        <nav className="mb-10">
          <Link
            to="/shop"
            className="inline-flex items-center text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-brand transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Back to Shop
          </Link>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-sm group">
              <img
                src={currentImages[currentImageIndex] || product.image}
                alt={`${product.name} - ${activeColor}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background shadow-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background shadow-sm"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-foreground" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-foreground/80">
                    {currentImageIndex + 1} / {currentImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {currentImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-20 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
                      i === currentImageIndex ? "border-brand shadow-glow" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badges */}
            <div className="flex gap-2 mb-5">
              {product.isNew && (
                <span className="px-3 py-1.5 bg-foreground text-background text-[10px] font-semibold tracking-[0.15em] uppercase">
                  New
                </span>
              )}
              {product.isBestseller && (
                <span className="px-3 py-1.5 bg-brand text-brand-foreground text-[10px] font-semibold tracking-[0.15em] uppercase shadow-glow">
                  Bestseller
                </span>
              )}
            </div>

            <h1 className="heading-section mb-3">{product.name}</h1>
            <div className="editorial-line mb-6" />
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-serif font-semibold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {currentItemCode && (
              <p className="text-[10px] font-mono text-muted-foreground/60 mb-8 tracking-wide">
                SKU: {currentItemCode}
              </p>
            )}
            {!currentItemCode && <div className="mb-8" />}

            {/* Color */}
            <div className="mb-8">
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">
                Color: <span className="text-foreground font-medium">{activeColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const hasImages = !!product.colorImages?.[color];
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setCurrentImageIndex(0);
                      }}
                      className={`px-4 py-2 text-xs tracking-wide border rounded-sm transition-all duration-300 ${
                        activeColor === color
                          ? "bg-brand text-brand-foreground border-brand shadow-glow"
                          : "border-border hover:border-foreground text-muted-foreground hover:text-foreground"
                      } ${!hasImages ? "opacity-60" : ""}`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Select Size</p>
                <button className="text-xs text-muted-foreground hover:text-brand flex items-center gap-1 transition-colors">
                  <Ruler className="w-3.5 h-3.5" />
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-3 text-xs tracking-wide border transition-all duration-300 rounded-sm ${
                      selectedSize === size
                        ? "bg-brand text-brand-foreground border-brand shadow-glow"
                        : "border-border hover:border-foreground text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-10">
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Quantity</p>
              <div className="inline-flex items-center border border-border rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3.5 hover:bg-secondary transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-8 py-3 font-medium text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3.5 hover:bg-secondary transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 mb-10">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 py-7 bg-brand hover:bg-brand/90 text-brand-foreground tracking-[0.15em] uppercase text-xs font-medium shadow-glow"
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="p-7 border-border hover:bg-brand/10 hover:border-brand hover:text-brand transition-all"
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-col sm:flex-row gap-5 py-8 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-muted-foreground tracking-wide">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                Free shipping over ₹1,999
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground tracking-wide">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                Easy 15-day returns
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-border pt-10">
              <div className="flex gap-8 mb-8">
                {[
                  { id: "description", label: "Description" },
                  { id: "fabric", label: "Fabric & Care" },
                  { id: "delivery", label: "Delivery & Returns" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-xs tracking-[0.15em] uppercase font-medium pb-3 border-b-2 transition-all duration-300 ${
                      activeTab === tab.id
                        ? "border-brand text-brand"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-body">
                {activeTab === "description" && <p>{product.description}</p>}
                {activeTab === "fabric" && (
                  <div className="space-y-5">
                    <div>
                      <p className="font-medium text-foreground text-sm mb-2">Fabric</p>
                      <p>{product.fabric}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm mb-2">Care</p>
                      <p>{product.care}</p>
                    </div>
                  </div>
                )}
                {activeTab === "delivery" && (
                  <div className="space-y-5">
                    <div>
                      <p className="font-medium text-foreground text-sm mb-2">Delivery</p>
                      <p>
                        Free standard shipping on orders over ₹1,999. Express delivery 
                        available for select pin codes. Orders are processed within 
                        1-2 business days.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm mb-2">Returns</p>
                      <p>
                        Easy returns within 15 days of delivery. Items must be unworn, 
                        unwashed, and with original tags attached. Hygiene products 
                        are non-returnable.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="mt-28">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="heading-subsection">You May Also Like</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
