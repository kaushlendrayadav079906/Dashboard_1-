import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import collectionBanner from "@/assets/collection-banner.jpg";
import { ArrowRight } from "lucide-react";

const BrandStory = () => {
  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-sm">
              <img
                src={collectionBanner}
                alt="Ela Collection"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
            {/* Decorative frame */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-brand/20 rounded-sm -z-10" />
            <div className="absolute -top-4 -left-4 w-24 h-24 border border-brand/15 rounded-sm -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-4">
              Our Story
            </span>
            <h2 className="heading-section mb-4">
              Ela by KOOL LIFESTYLE
            </h2>
            <div className="editorial-line mb-8" />
            <div className="space-y-5 text-body mb-10">
              <p>
                Ela was born from a simple belief: every woman deserves to feel 
                beautiful, comfortable, and confident, every single day.
              </p>
              <p>
                As a sub-brand of KOOL LIFESTYLE, we bring together premium 
                craftsmanship, thoughtful design, and an unwavering commitment 
                to quality. Each piece is designed to celebrate your natural 
                beauty while providing the comfort you deserve.
              </p>
              <p className="editorial-quote text-foreground text-xl">
                "From our signature lace bralettes to our luxurious silk 
                loungewear, every Ela creation is a testament to feminine 
                elegance."
              </p>
            </div>
            <Link
              to="/about"
              className="btn-secondary inline-flex items-center gap-2 group"
            >
              Discover More
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
