import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    title: "Orders & Payments",
    faqs: [
      {
        q: "How do I place an order?",
        a: "Simply browse our collections, select your desired products and size, add them to your cart, and proceed to checkout. You'll receive an order confirmation email once your order is placed successfully.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex, RuPay), UPI, net banking, and popular wallets. All payments are processed securely through encrypted payment gateways.",
      },
      {
        q: "Can I cancel or modify my order after placing it?",
        a: "You can request a cancellation or modification within 2 hours of placing your order by contacting us at support@elabykoollifestyle.com. Once the order has been dispatched, it cannot be cancelled — but you may initiate a return after delivery.",
      },
      {
        q: "Is it safe to use my credit card on your website?",
        a: "Absolutely. We use industry-standard SSL encryption and partner with trusted, PCI-DSS compliant payment processors to ensure your financial information is always secure.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    faqs: [
      {
        q: "How long does delivery take?",
        a: "We dispatch orders within 1–3 business days. Delivery typically takes 3–5 days for metro cities, 5–8 days for non-metro areas, and 7–12 days for remote locations.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free standard shipping on all orders above ₹999. For orders below that, a nominal shipping fee of ₹99 applies.",
      },
      {
        q: "Can I track my order?",
        a: "Yes, once your order is dispatched, you'll receive a tracking number via email and SMS. You can use it on our shipping partner's website to track your package in real time.",
      },
      {
        q: "Do you deliver internationally?",
        a: "Currently, we deliver across India only. International shipping is something we're working on and hope to offer soon. Stay tuned!",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    faqs: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 15 days of delivery for most products, provided they are unused, unwashed, and in original packaging with tags intact. Intimate wear (bras, panties, bodysuits) cannot be returned for hygiene reasons, unless received damaged or defective.",
      },
      {
        q: "How do I initiate a return or exchange?",
        a: "Email us at support@elabykoollifestyle.com with your order number, the item(s) you'd like to return, and the reason. Our team will guide you through the process and arrange a pickup if eligible.",
      },
      {
        q: "How long does a refund take?",
        a: "Once we receive and inspect the returned item, refunds are processed within 7–10 business days to your original payment method.",
      },
      {
        q: "Can I exchange for a different size?",
        a: "Yes, size exchanges are available subject to stock. Please contact us within 15 days of delivery, and we'll ship the new size once the original item is returned.",
      },
    ],
  },
  {
    title: "Sizing & Fit",
    faqs: [
      {
        q: "How do I find my correct size?",
        a: "We recommend using our detailed Size Guide available on each product page. It includes measurements and tips for getting the perfect fit. If you're between sizes, we generally recommend sizing up for comfort.",
      },
      {
        q: "What if the size doesn't fit me?",
        a: "No worries! You can exchange it for a different size within 15 days of delivery. Refer to our returns and exchange policy for intimate wear exceptions.",
      },
      {
        q: "Do your sizes run true to standard Indian sizing?",
        a: "Yes, our sizes follow standard Indian sizing charts. However, fit may vary slightly between styles (e.g., a bralette vs. a full-support bra), so we recommend checking the size guide for each product.",
      },
    ],
  },
  {
    title: "Product & Care",
    faqs: [
      {
        q: "What materials do you use?",
        a: "We use premium fabrics including soft cotton, breathable microfibre, luxurious silk, and delicate lace. Each product listing mentions the specific fabric composition. We prioritise comfort, durability, and skin-friendliness.",
      },
      {
        q: "How should I care for my Ela lingerie?",
        a: "For best results, hand wash in cold water with a mild detergent. Avoid wringing or twisting. Lay flat or hang to dry in shade. Do not bleach or tumble dry. Using a lingerie wash bag for machine wash (on delicate cycle) is also acceptable.",
      },
      {
        q: "Are your products suitable for sensitive skin?",
        a: "Yes, we select fabrics that are gentle on skin. Our cotton and microfibre ranges are particularly suitable for sensitive skin. All products are tested for skin safety.",
      },
    ],
  },
  {
    title: "About KOOL LIFESTYLE",
    faqs: [
      {
        q: "What is KOOL LIFESTYLE?",
        a: "KOOL LIFESTYLE is the umbrella brand behind Ela (lingerie & loungewear), Elfie (cosmetics — coming soon), and Ela Active (activewear — coming soon). Our mission is to empower women across every facet of their lives.",
      },
      {
        q: "Where is KOOL LIFESTYLE based?",
        a: "We are headquartered in Mumbai, Maharashtra, India. Our design studio and operations centre are located in Bandra West.",
      },
      {
        q: "How can I collaborate or partner with Ela?",
        a: "We're always open to exciting collaborations! Please reach out to us at hello@elabykoollifestyle.com with your proposal and we'll get back to you.",
      },
    ],
  },
];

const FAQs = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/20 rounded-full translate-x-1/2 translate-y-1/2" />
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
              Help Centre
            </motion.span>
            <h1 className="heading-display mb-4">Frequently Asked Questions</h1>
            <p className="text-body max-w-lg mx-auto">
              Find answers to the most common questions about our products, orders, and services.
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

      {/* FAQ Content */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <div className="space-y-12">
            {faqCategories.map((category, catIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: catIndex * 0.05 }}
              >
                <h2 className="heading-subsection mb-6">{category.title}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${category.title}-${faqIndex}`}
                      className="border-b border-border"
                    >
                      <AccordionTrigger className="text-left text-base font-medium py-5 hover:text-brand transition-colors">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-body pb-5 leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>

          {/* Still have questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center p-10 bg-secondary rounded-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full translate-x-1/2 -translate-y-1/2" />
            <h3 className="heading-subsection mb-3 relative">Still have questions?</h3>
            <p className="text-body mb-6 relative">
              Can't find what you're looking for? Our team is happy to help.
            </p>
            <a
              href="/contact"
              className="btn-primary relative inline-block"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQs;
