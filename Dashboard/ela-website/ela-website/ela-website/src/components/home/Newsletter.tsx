import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Thank you for subscribing!", {
      description: "You'll be the first to know about new collections and exclusive offers.",
    });
    setEmail("");
    setLoading(false);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(340_75%_50%/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(340_75%_50%/0.05),transparent_40%)]" />
      
      <div className="container-narrow relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-primary-foreground"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-primary-foreground/40 block mb-4">Newsletter</span>
          <h2 className="font-serif text-4xl md:text-5xl mb-6 tracking-tight">
            Join the Ela Family
          </h2>
          <div className="w-16 h-[2px] bg-brand mx-auto mb-8" />
          <p className="text-primary-foreground/60 mb-10 max-w-md mx-auto leading-relaxed">
            Subscribe to receive exclusive offers, early access to new collections, 
            and 10% off your first order.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-14 bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-brand/50 focus:ring-brand/10 rounded-sm"
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-14 bg-brand hover:bg-brand/90 text-brand-foreground px-8 tracking-widest uppercase text-xs font-medium shadow-glow rounded-sm group"
            >
              {loading ? "..." : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-primary-foreground/30 text-xs mt-6 tracking-wide">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>

          <p className="text-primary-foreground/50 text-sm mt-8 italic tracking-wide">
            Also available at Ela Experience Center in Pune and Jaipur
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
