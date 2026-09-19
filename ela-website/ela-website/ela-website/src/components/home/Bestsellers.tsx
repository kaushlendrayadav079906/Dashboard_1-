import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { getBestsellers } from "@/data/products";
import { ArrowRight } from "lucide-react";

const Bestsellers = () => {
  const bestsellers = getBestsellers();

  return (
    <section className="section-padding bg-secondary/50 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14"
        >
          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-3">Curated for you</span>
            <h2 className="heading-section mb-3">Bestsellers</h2>
            <div className="editorial-line" />
          </div>
          <Link
            to="/shop"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-brand transition-colors group"
          >
            View All 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {bestsellers.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Bestsellers;
