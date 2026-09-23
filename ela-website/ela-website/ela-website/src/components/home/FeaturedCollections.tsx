import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SparkleAccent } from "./LiveDecorations";
import { useToast } from "@/hooks/use-toast";
import brandEla from "@/assets/brand-ela.jpg";
import brandElfie from "@/assets/brand-elfie.jpg";
import brandElaActive from "@/assets/brand-ela-active.jpg";

const brands = [
  { name: "Ela", tagline: "Loungerie & More", image: brandEla, href: "/shop", comingSoon: false },
  { name: "Elfie", tagline: "Cosmetics", image: brandElfie, href: "#", comingSoon: true },
  { name: "Ela Active", tagline: "Active Wear", image: brandElaActive, href: "#", comingSoon: true },
];

const FeaturedCollections = () => {
  const { toast } = useToast();

  const handleComingSoon = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    toast({ title: `${name} — Coming Soon`, description: "Stay tuned! This brand is launching soon." });
  };

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <SparkleAccent />
      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-4">Explore</span>
          <h2 className="heading-section mb-4">Shop by Brand</h2>
          <div className="editorial-line mx-auto mb-6" />
          <p className="text-body max-w-lg mx-auto">
            Discover our family of brands, each crafted for a unique lifestyle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={brand.href}
                onClick={brand.comingSoon ? (e) => handleComingSoon(e, brand.name) : undefined}
                className="group relative block aspect-[3/4] overflow-hidden rounded-sm"
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="text-white/50 text-xs tracking-[0.2em] uppercase mb-2">
                    {brand.tagline}
                  </p>
                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-3">
                    {brand.name}
                  </h3>
                  <span className="inline-flex items-center text-sm text-white/80 group-hover:text-brand transition-colors duration-300">
                    {brand.comingSoon ? "Coming Soon" : "Shop Now →"}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand/30 transition-all duration-500 rounded-sm" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
