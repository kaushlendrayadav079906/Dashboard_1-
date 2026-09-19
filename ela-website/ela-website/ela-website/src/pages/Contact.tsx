import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import WhyEla from "@/components/home/WhyEla";
import InstagramGrid from "@/components/home/InstagramGrid";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Message sent successfully!", {
      description: "We'll get back to you within 24-48 hours.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Layout>
      {/* Why Choose Ela */}
      <WhyEla />

      {/* Hero */}
      <section className="bg-secondary py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/20 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 right-20 w-2 h-2 bg-brand/40 rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-brand/20 rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 border border-brand/10 rotate-45" />
        
        <div className="container-wide relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-1.5 bg-brand/10 text-brand text-xs tracking-[0.2em] uppercase mb-4 rounded-full"
            >
              Get In Touch
            </motion.span>
            <h1 className="heading-display mb-4">Contact Us</h1>
            <p className="text-body max-w-lg mx-auto">
              We'd love to hear from you. Get in touch with our team.
            </p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="w-24 h-0.5 bg-brand/30 mx-auto mt-6"
            />
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="container-wide relative">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="heading-subsection mb-8">Get in Touch</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <Mail className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-muted-foreground">accounts@koollife.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <Phone className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Phone</h3>
                    <p className="text-muted-foreground">+91 9869523955</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <MessageCircle className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/919869523955"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-brand transition-colors"
                    >
                      +91 9869523955
                    </a>
                    <p className="text-sm text-muted-foreground">Chat with us instantly</p>
                  </div>
                </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <MapPin className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      KOOL LIFESTYLE Pvt. Ltd.<br />
                      3rd Floor, Bharat Insurance Building,<br />
                      15A, Horniman Circle, Fort,<br />
                      Mumbai - 400001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <Clock className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Saturday: 10:00 AM - 7:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ hint */}
              <div className="p-6 bg-nude relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                <h3 className="font-medium mb-2">Have a quick question?</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Check our FAQs for instant answers about sizing, shipping, 
                  returns, and more.
                </p>
                <a href="/faqs" className="text-sm font-medium text-brand hover:underline">
                  View FAQs →
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-secondary p-8 md:p-10 relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <h2 className="heading-subsection mb-6 relative">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6 relative">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium mb-2 block">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-2 block">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="text-sm font-medium mb-2 block">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help?"
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="text-sm font-medium mb-2 block">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us more..."
                      rows={6}
                      className="bg-background resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instagram Grid */}
      <InstagramGrid />
    </Layout>
  );
};

export default Contact;
