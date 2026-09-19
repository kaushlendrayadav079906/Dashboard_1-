import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X, Sparkles, Gift, Truck } from "lucide-react";

const categories = [
  { id: "all", name: "All" },
  { id: "bras", name: "Bras" },
  { id: "panties", name: "Panties" },
  { id: "camisoles", name: "Camisoles" },
  { id: "sports", name: "Sports" },
];

const sizes = ["S", "M", "L", "XL", "XXL", "XXXL", "30B", "32B", "34B", "36B", "38B", "40B", "42B", "30C", "32C", "34C", "36C", "38C", "40C", "42C", "30D", "32D", "34D", "36D", "38D", "40D", "42D", "34E", "36E", "38E", "40E", "42E"];
const priceRanges = [
  { id: "all", name: "All Prices" },
  { id: "under-2000", name: "Under ₹2,000" },
  { id: "2000-3000", name: "₹2,000 - ₹3,000" },
  { id: "over-3000", name: "Over ₹3,000" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState("all");

  const activeCategory = searchParams.get("category") || "all";

  const setCategory = (category: string) => {
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedPrice("all");
    setCategory("all");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory !== "all" && product.category !== activeCategory) return false;
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some((size) => product.sizes.includes(size));
        if (!hasSize) return false;
      }
      if (selectedPrice !== "all") {
        if (selectedPrice === "under-2000" && product.price >= 2000) return false;
        if (selectedPrice === "2000-3000" && (product.price < 2000 || product.price > 3000)) return false;
        if (selectedPrice === "over-3000" && product.price <= 3000) return false;
      }
      return true;
    });
  }, [activeCategory, selectedSizes, selectedPrice]);

  const hasActiveFilters = selectedSizes.length > 0 || selectedPrice !== "all" || activeCategory !== "all";

  const offers = [
    { icon: Sparkles, text: "✨ 20% OFF on First Order - Use Code: WELCOME20" },
    { icon: Gift, text: "🎁 Free Gift on Orders Above ₹3,000" },
    { icon: Truck, text: "🚚 Free Shipping on All Orders Above ₹999" },
    { icon: Sparkles, text: "💝 Buy 2 Get 1 Free on Selected Styles" },
  ];

  return (
    <Layout>
      {/* Offers Bar */}
      <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 14, ease: "linear" } }}
        >
          {[...offers, ...offers].map((offer, index) => (
            <span key={index} className="inline-flex items-center gap-2 mx-10 text-xs tracking-wide font-medium">
              <offer.icon className="w-3.5 h-3.5" />
              {offer.text}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Hero */}
      <section className="relative bg-secondary/40 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(340_75%_50%/0.04),transparent_50%)]" />
        <div className="container-wide relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-4">
              New Collection
            </span>
            <h1 className="heading-display mb-5">Shop</h1>
            <div className="editorial-line mx-auto mb-6" />
            <p className="text-body max-w-lg mx-auto">
              Discover our complete collection of premium lingerie and loungewear.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 space-y-10">
                {/* Categories */}
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setCategory(category.id)}
                        className={`block w-full text-left py-2.5 text-sm transition-all duration-300 ${
                          activeCategory === category.id
                            ? "text-brand font-medium pl-3 border-l-2 border-brand"
                            : "text-muted-foreground hover:text-foreground hover:pl-2"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5">
                    Sizes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-2 text-xs tracking-wide border transition-all duration-300 rounded-sm ${
                          selectedSizes.includes(size)
                            ? "bg-brand text-brand-foreground border-brand shadow-glow"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5">
                    Price
                  </h3>
                  <div className="space-y-1">
                    {priceRanges.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setSelectedPrice(range.id)}
                        className={`block w-full text-left py-2.5 text-sm transition-all duration-300 ${
                          selectedPrice === range.id
                            ? "text-brand font-medium pl-3 border-l-2 border-brand"
                            : "text-muted-foreground hover:text-foreground hover:pl-2"
                        }`}
                      >
                        {range.name}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs tracking-[0.15em] uppercase text-brand hover:text-brand/80 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1">
              {/* Mobile filter toggle */}
              <div className="lg:hidden mb-8 flex items-center justify-between">
                <p className="text-xs text-muted-foreground tracking-wide">
                  {filteredProducts.length} products
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 text-xs tracking-wide"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                </Button>
              </div>

              {/* Mobile filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mb-8 p-6 bg-secondary/50 rounded-sm"
                >
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs tracking-[0.15em] uppercase font-medium">Filters</span>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-xs tracking-wide uppercase text-muted-foreground mb-3">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setCategory(category.id)}
                          className={`px-4 py-2 text-xs tracking-wide border rounded-sm transition-all ${
                            activeCategory === category.id
                              ? "bg-brand text-brand-foreground border-brand"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-xs tracking-wide uppercase text-muted-foreground mb-3">Sizes</h4>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-1.5 text-xs border rounded-sm transition-all ${
                            selectedSizes.includes(size)
                              ? "bg-brand text-brand-foreground border-brand"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-brand tracking-wide">
                      Clear all filters
                    </button>
                  )}
                </motion.div>
              )}

              {/* Active filters */}
              {hasActiveFilters && (
                <div className="hidden lg:flex flex-wrap gap-2 mb-8">
                  {activeCategory !== "all" && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand text-xs tracking-wide rounded-full">
                      {categories.find((c) => c.id === activeCategory)?.name}
                      <button onClick={() => setCategory("all")}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedSizes.map((size) => (
                    <span key={size} className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand text-xs tracking-wide rounded-full">
                      {size}
                      <button onClick={() => toggleSize(size)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {selectedPrice !== "all" && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand text-xs tracking-wide rounded-full">
                      {priceRanges.find((r) => r.id === selectedPrice)?.name}
                      <button onClick={() => setSelectedPrice("all")}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}

              {/* Count */}
              <p className="hidden lg:block text-xs text-muted-foreground mb-8 tracking-wide">
                {filteredProducts.length} products
              </p>

              {/* Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4 text-sm">No products found matching your filters.</p>
                  <button onClick={clearFilters} className="text-brand hover:underline text-sm">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
