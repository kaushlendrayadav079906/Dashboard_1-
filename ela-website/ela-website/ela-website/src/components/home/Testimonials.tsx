import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya M.",
    location: "Mumbai",
    rating: 5,
    text: "The most comfortable bra I've ever owned. The quality is exceptional, and I love how it looks under any outfit. Ela has become my go-to brand!",
    product: "Everyday Comfort Bra",
  },
  {
    id: 2,
    name: "Ananya S.",
    location: "Delhi",
    rating: 5,
    text: "The silk loungewear set is absolutely divine. It feels so luxurious and looks so elegant. Perfect for lazy Sunday mornings or special evenings.",
    product: "Silk Loungewear Set",
  },
  {
    id: 3,
    name: "Kavitha R.",
    location: "Bangalore",
    rating: 5,
    text: "I bought the Blush Lace Bodysuit for my honeymoon and received so many compliments. The fit is perfect, and the quality exceeded my expectations.",
    product: "Blush Lace Bodysuit",
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-4">Testimonials</span>
          <h2 className="heading-section mb-4">What Our Customers Say</h2>
          <div className="editorial-line mx-auto mb-6" />
          <p className="text-body max-w-lg mx-auto">
            Real stories from women who chose Ela.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card p-8 md:p-10 relative group hover:shadow-card transition-all duration-500"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-brand/20 mb-5" />

              {/* Rating */}
              <div className="flex gap-1 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-brand text-brand" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-[1.8] mb-8 text-[15px]">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                  <span className="font-serif text-brand font-semibold text-sm">
                    {testimonial.name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.location} · {testimonial.product}
                  </p>
                </div>
              </div>

              {/* Hover accent */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
