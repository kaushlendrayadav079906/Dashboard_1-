import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import aboutHero from "@/assets/about-hero.jpg";
import aboutCollection from "@/assets/about-collection.jpg";

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={aboutHero}
            alt="About Ela"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-24 h-24 border border-white/20 rounded-full" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-1/4 right-1/4 w-2 h-2 bg-brand rounded-full"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-white/30 rounded-full"
        />
        
        <div className="relative container-wide py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs tracking-[0.2em] uppercase mb-4 rounded-full border border-white/20"
            >
              Who We Are
            </motion.span>
            <h1 className="heading-display mb-4">About Ela</h1>
            <p className="text-lg text-white/90 max-w-lg mx-auto">
              Beautiful, inside out.
            </p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="w-24 h-0.5 bg-brand mx-auto mt-6"
            />
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/30 rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="container-narrow relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-sm tracking-[0.2em] uppercase text-foreground font-semibold mb-4 block">
              Our Story
            </span>
            <h2 className="heading-section mb-8">
              Born from a Belief
            </h2>
            <div className="prose prose-lg mx-auto text-body space-y-6">
              <p>
                Ela was born from a simple yet powerful belief: every woman deserves 
                to feel beautiful, comfortable, and confident, not just on special 
                occasions, but every single day.
              </p>
              <p>
                As a thoughtfully crafted sub-brand of KOOL LIFESTYLE, Ela brings 
                together decades of expertise in fashion and textiles with a fresh, 
                modern approach to intimate apparel. We understand that the pieces 
                you wear closest to your skin matter. They set the foundation for 
                how you feel throughout your day.
              </p>
              <p>
                Our journey started with a simple question: why should women 
                have to choose between feeling beautiful and feeling comfortable? 
                That belief sparked Ela, and it continues to drive everything we create.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image break */}
      <section className="bg-secondary">
        <div className="container-wide py-0">
          <motion.img
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            src={aboutCollection}
            alt="Ela Lace Collection"
            className="w-full h-[50vh] object-cover"
          />
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="heading-section mb-4">What We Stand For</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Comfort Without Compromise",
                description:
                  "We believe comfort and beauty are not mutually exclusive. Every Ela piece is designed to feel as good as it looks, using premium fabrics that move with you through your day.",
              },
              {
                title: "Timeless Over Trendy",
                description:
                  "While trends come and go, confidence is eternal. Our designs focus on timeless elegance that transcends seasons, creating pieces you'll love for years to come.",
              },
              {
                title: "Quality Craftsmanship",
                description:
                  "From our delicate laces to our silky satins, we source only the finest materials. Every stitch, every seam is a testament to our commitment to excellence.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="font-serif text-xl mb-4">{value.title}</h3>
                <p className="text-body">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* KOOL LIFESTYLE connection */}
      <section className="section-padding bg-secondary relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
        <div className="absolute top-10 right-10 w-20 h-20 border border-brand/10 rotate-45" />
        <div className="absolute bottom-10 left-10 w-16 h-16 border border-brand/10 rotate-12" />
        
        <div className="container-narrow text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm tracking-[0.2em] uppercase text-foreground font-semibold mb-4 block">
              Part of the Family
            </span>
            <h2 className="heading-section mb-6">
              Ela by KOOL LIFESTYLE
            </h2>
            <p className="text-body max-w-2xl mx-auto mb-8">
              KOOL LIFESTYLE has been at the forefront of fashion innovation for 
              years, with a portfolio of brands that celebrate individuality and 
              quality. Ela joins this family with a singular mission: to redefine 
              everyday intimate wear for the modern woman.
            </p>
            <p className="font-serif text-xl text-brand italic">
              "Grace flows from within."
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">
              Experience Ela
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Discover our collection of premium lingerie and loungewear, 
              crafted for comfort and designed for confidence.
            </p>
            <a
              href="/shop"
              className="inline-block bg-white text-foreground px-8 py-4 font-medium tracking-wide hover:bg-white/90 transition-colors"
            >
              Shop the Collection
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
