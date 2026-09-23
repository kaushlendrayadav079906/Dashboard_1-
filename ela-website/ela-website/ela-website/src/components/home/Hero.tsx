import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import banner3 from "@/assets/banner-3.jpg";
import banner4 from "@/assets/banner-4.jpg";
import banner5 from "@/assets/banner-5.jpg";
import banner6 from "@/assets/banner-6.jpg";

const slides = [banner1, banner2, banner3, banner4, banner5, banner6];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Carousel */}
      <AnimatePresence mode="popLayout">
        <motion.img
          key={current}
          src={slides[current]}
          alt="Ela Collection"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </AnimatePresence>

      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Editorial side accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-brand/60 to-transparent ml-8 hidden lg:block" />

      {/* Slide indicators - editorial vertical style */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10 hidden md:flex">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-500 ${
              i === current ? "w-[2px] h-8 bg-brand" : "w-[2px] h-3 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative container-wide py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-white"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-12 h-[2px] bg-brand mb-8 origin-left"
          />
          
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xs tracking-[0.4em] uppercase mb-6 text-white/60 font-medium"
          >
            Introducing Ela
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="heading-display text-white mb-8"
          >
            Everyday
            <br />
            <span className="italic font-normal">Comfort.</span>
            <br />
            Timeless
            <br />
            <span className="italic font-normal">Confidence.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg text-white/70 mb-10 leading-relaxed max-w-md"
          >
            Premium lingerie and loungewear crafted for modern women.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-wrap gap-5"
          >
            <Link to="/shop">
              <Button 
                size="lg" 
                className="bg-brand hover:bg-brand/90 text-brand-foreground px-10 py-7 text-xs tracking-[0.2em] uppercase font-medium shadow-glow group"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                variant="outline" 
                size="lg" 
                className="border border-white/30 bg-white/5 text-white backdrop-blur-sm hover:bg-white hover:text-foreground px-10 py-7 text-xs tracking-[0.2em] uppercase font-medium"
              >
                Our Story
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
