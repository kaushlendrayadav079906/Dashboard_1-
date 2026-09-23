import { motion } from "framer-motion";
import koollifeLogo from "@/assets/koollife-logo-full.jpg";
import elaLogo from "@/assets/ela-logo-full.jpg";

const subBrands = [
  {
    name: "Ela",
    tagline: "Loungerie & More",
    description: "Premium lingerie and loungewear crafted for everyday elegance and comfort.",
    status: "Live Now",
    accentColor: "bg-brand/10 border-brand/20",
  },
  {
    name: "Elfie",
    tagline: "Cosmetics",
    description: "Beauty essentials that celebrate your natural glow — coming soon.",
    status: "Coming Soon",
    accentColor: "bg-accent border-accent-foreground/10",
  },
  {
    name: "Ela Active",
    tagline: "Active Wear",
    description: "Performance meets style — activewear designed for the modern woman. Coming soon.",
    status: "Coming Soon",
    accentColor: "bg-secondary border-border",
  },
];

const WhyKoolLifestyle = () => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-brand/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[5%] w-48 h-48 bg-brand/[0.03] rounded-full blur-3xl" />

      <div className="container-wide relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-6">
            The Umbrella Brand
          </span>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <img
              src={koollifeLogo}
              alt="KoolLife — Grace flows from within"
              className="h-28 md:h-36 w-auto mx-auto rounded-xl shadow-elevated"
            />
          </motion.div>

          <div className="editorial-line mx-auto mb-8" />

          <h2 className="heading-section mb-5">Why KOOL LIFESTYLE?</h2>
          <p className="text-body max-w-2xl mx-auto">
            KOOL LIFESTYLE is more than a brand, it's a movement. We bring together 
            thoughtfully crafted sub-brands, each designed to empower women
            across every facet of their lives. <em className="text-foreground">Grace flows from within.</em>
          </p>
        </motion.div>

        {/* Ela Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col items-center mb-20"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-brand/5 rounded-2xl blur-2xl scale-125" />
            <img
              src={elaLogo}
              alt="Ela — Beautiful, inside out!"
              className="relative h-32 md:h-40 w-auto rounded-xl shadow-card"
            />
          </div>
          <p className="text-muted-foreground text-sm tracking-wide">
            Our flagship brand — <span className="text-brand font-medium">Beautiful, inside out!</span>
          </p>
        </motion.div>

        {/* Sub-brands header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h3 className="font-serif text-2xl md:text-3xl text-foreground">Our Family of Brands</h3>
        </motion.div>

        {/* Sub-brands grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {subBrands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 * index, ease: [0.22, 1, 0.36, 1] }}
              className={`relative group rounded-sm border ${brand.accentColor} p-8 md:p-10 text-center transition-all duration-500 hover:shadow-card hover:-translate-y-2`}
            >
              <div className="mb-5">
                <span className="inline-block px-4 py-1.5 bg-background/80 backdrop-blur-sm text-[10px] tracking-[0.2em] uppercase rounded-full text-muted-foreground border border-border/50">
                  {brand.status}
                </span>
              </div>
              <h4 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
                {brand.name}
              </h4>
              <p className="text-xs font-medium text-brand tracking-[0.15em] uppercase mb-5">
                {brand.tagline}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {brand.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center text-muted-foreground text-sm mt-16 italic font-serif text-lg"
        >
          One vision. Three brands. Infinite confidence.
        </motion.p>
      </div>
    </section>
  );
};

export default WhyKoolLifestyle;
