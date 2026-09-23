import { motion } from "framer-motion";
import { Heart, Ruler, Sparkles, Shirt } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Comfort First",
    description: "Designed with your comfort in mind, using soft, breathable fabrics that feel like a second skin.",
  },
  {
    icon: Ruler,
    title: "Perfect Fit",
    description: "Carefully engineered sizing and adjustable features ensure the perfect fit for every body.",
  },
  {
    icon: Sparkles,
    title: "Premium Fabrics",
    description: "We source only the finest materials—from delicate lace to luxurious silk—for lasting quality.",
  },
  {
    icon: Shirt,
    title: "Timeless Design",
    description: "Classic silhouettes with modern details that transcend trends and remain effortlessly elegant.",
  },
];

const WhyEla = () => {
  return (
    <section className="section-padding bg-nude">
      <div className="container-wide">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-section mb-4">Why Choose Ela?</h2>
          <p className="text-body max-w-lg mx-auto">
            We believe in creating lingerie that empowers you to feel your best, 
            inside and out.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-background mb-6">
                <feature.icon className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-serif text-xl mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyEla;
