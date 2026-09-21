import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, LogOut, Shield } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import koolLifeLogo from "@/assets/koollife-logo.jpg";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, useProducts } from "@/context/ProductContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, signOut } = useAuth();
  const { products } = useProducts();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    setIsAdmin(user.email === "admin@koollife.in");
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    const words = query.split(/\s+/);
    return products
      .map((product) => {
        const searchable = `${product.name} ${product.category} ${product.description} ${product.colors.join(" ")}`.toLowerCase();
        const matchCount = words.filter((w) => searchable.includes(w)).length;
        return { product, matchCount, ratio: matchCount / words.length };
      })
      .filter((r) => r.matchCount > 0)
      .sort((a, b) => b.ratio - a.ratio || b.matchCount - a.matchCount)
      .map((r) => r.product);
  }, [products, searchQuery]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  const handleProductClick = (id: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/product/${id}`);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
      scrolled 
        ? "bg-background/90 backdrop-blur-xl shadow-soft border-b border-border/50" 
        : "bg-transparent"
    }`}>
      {/* Top accent bar */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-60" />
      
      <nav className="container-wide">
        <div className="flex items-center justify-between h-18 md:h-22 py-3">
          {/* Mobile menu */}
          <button
            className="md:hidden p-2 -ml-2 hover:bg-secondary/50 rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <img
              src={koolLifeLogo}
              alt="KOOL LIFESTYLE"
              className="h-12 md:h-14 w-auto transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative text-[13px] tracking-[0.18em] uppercase font-medium transition-all duration-500 ${
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link
                to="/admin"
                className="p-2.5 hover:bg-brand/10 rounded-full transition-all duration-300 text-brand"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                <Shield className="w-[18px] h-[18px]" />
              </Link>
            )}
            <button
              className="p-2.5 hover:bg-secondary/60 rounded-full transition-all duration-300"
              aria-label="Search"
              onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}
            >
              {searchOpen ? <X className="w-[18px] h-[18px]" /> : <Search className="w-[18px] h-[18px]" />}
            </button>
            {user ? (
              <button
                onClick={signOut}
                className="p-2.5 hover:bg-secondary/60 rounded-full transition-all duration-300"
                aria-label="Sign out"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="p-2.5 hover:bg-secondary/60 rounded-full transition-all duration-300"
                aria-label="Sign in"
              >
                <User className="w-[18px] h-[18px]" />
              </Link>
            )}
            <Link
              to="/cart"
              className="relative p-2.5 hover:bg-secondary/60 rounded-full transition-all duration-300"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand text-brand-foreground text-[10px] font-semibold rounded-full flex items-center justify-center shadow-glow"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            ref={searchContainerRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border/50 shadow-elevated z-50"
          >
            <div className="container-wide py-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for bras, panties, camisoles..."
                  className="w-full h-14 pl-14 pr-6 bg-secondary/40 border border-border/40 rounded-lg text-sm font-sans placeholder:text-muted-foreground focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
            </div>

            <div className="container-wide pb-8 max-h-[60vh] overflow-y-auto">
              {searchQuery.trim() && searchResults.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-12">
                  No products found for "{searchQuery}"
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mb-5">
                    {searchQuery.trim()
                      ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
                      : "All Products"}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="group text-left bg-card rounded-lg overflow-hidden hover:shadow-card transition-all duration-500"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-foreground leading-tight line-clamp-2 mb-1">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-brand">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-muted-foreground line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-background/95 backdrop-blur-2xl border-t border-border/50"
          >
            <div className="container-wide py-6 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 text-[13px] tracking-[0.15em] uppercase font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-brand"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-[13px] tracking-[0.15em] uppercase font-medium text-brand"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
