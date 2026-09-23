import { motion } from "framer-motion";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

const images = [
  { src: product1, alt: "Ela Collection" },
  { src: product2, alt: "Ela Lingerie" },
  { src: product3, alt: "Everyday Comfort" },
  { src: product4, alt: "Bridal Collection" },
  { src: product5, alt: "Loungewear" },
  { src: product6, alt: "Rose Collection" },
];

const InstagramGrid = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-wide">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="heading-section mb-4">@ElaBYKoolLifestyle</h2>
          <p className="text-body">
            Follow us on Instagram for styling inspiration and new arrivals.
          </p>
        </motion.div>

        {/* Instagram-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {images.map((image, index) => (
            <motion.a
              key={index}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramGrid;
