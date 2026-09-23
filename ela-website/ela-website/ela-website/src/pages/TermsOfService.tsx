import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

const TermsOfService = () => {
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
            <h1 className="heading-display mb-4">Terms of Service</h1>
            <p className="text-body max-w-lg mx-auto">
              Please read these terms carefully before using our services.
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

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-10"
          >
            <p className="text-body text-sm">
              <strong>Last Updated:</strong> February 10, 2026
            </p>

            <div>
              <h2 className="heading-subsection mb-4">1. Acceptance of Terms</h2>
              <p className="text-body">
                By accessing and using the Ela by KOOL LIFESTYLE website ("Site"), you accept and agree to be bound by these Terms of Service. If you do not agree, please refrain from using our Site. These terms apply to all visitors, users, and customers.
              </p>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">2. Products & Pricing</h2>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li>All product descriptions, images, and pricing are provided as accurately as possible. Minor colour variations may occur due to screen settings.</li>
                <li>Prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
                <li>We reserve the right to modify prices, discontinue products, or correct pricing errors at any time without prior notice.</li>
                <li>Promotional offers and discounts are valid for limited periods and cannot be combined unless explicitly stated.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">3. Orders & Payments</h2>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order.</li>
                <li>We accept credit/debit cards, UPI, net banking, and other payment methods as displayed at checkout.</li>
                <li>Payment is processed securely through our trusted payment partners. We do not store your payment credentials.</li>
                <li>An order confirmation email will be sent upon successful placement. This does not guarantee fulfilment until the item is dispatched.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">4. Shipping & Delivery</h2>
              <p className="text-body mb-3">
                We strive to dispatch orders within 1–3 business days. Estimated delivery timelines are:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li><strong>Metro cities:</strong> 3–5 business days</li>
                <li><strong>Non-metro areas:</strong> 5–8 business days</li>
                <li><strong>Remote locations:</strong> 7–12 business days</li>
              </ul>
              <p className="text-body mt-3">
                Delivery times are estimates and may vary due to unforeseen circumstances. Shipping charges, if any, will be displayed at checkout.
              </p>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">5. Returns & Exchanges</h2>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li>Returns and exchanges are accepted within 15 days of delivery, provided the product is unused, unwashed, and in its original packaging with tags intact.</li>
                <li>Intimate wear (bras, panties, bodysuits) cannot be returned or exchanged for hygiene reasons, unless received damaged or defective.</li>
                <li>To initiate a return, contact us at <strong>support@elabykoollifestyle.com</strong> with your order number and reason.</li>
                <li>Refunds will be processed within 7–10 business days after we receive the returned item.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">6. Intellectual Property</h2>
              <p className="text-body">
                All content on this Site—including logos, text, images, product designs, graphics, and software—is the intellectual property of KOOL LIFESTYLE Pvt. Ltd. and is protected under applicable copyright and trademark laws. Unauthorized use, reproduction, or distribution is strictly prohibited.
              </p>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">7. User Accounts</h2>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to provide accurate and current information during registration and checkout.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">8. Limitation of Liability</h2>
              <p className="text-body">
                Ela by KOOL LIFESTYLE shall not be liable for any indirect, incidental, or consequential damages arising from the use of our Site or products. Our total liability shall not exceed the amount paid for the specific product in question.
              </p>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">9. Governing Law</h2>
              <p className="text-body">
                These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.
              </p>
            </div>

            <div className="p-6 bg-secondary rounded-lg">
              <h2 className="heading-subsection mb-4">10. Contact Us</h2>
              <p className="text-body">
                For questions about these Terms of Service, reach out to us:
              </p>
              <div className="mt-3 text-body space-y-1">
                <p>Email: <strong>legal@elabykoollifestyle.com</strong></p>
                <p>Phone: <strong>+91 1800 123 4567</strong></p>
                <p>Address: <strong>KOOL LIFESTYLE Pvt. Ltd., 123 Fashion Street, Bandra West, Mumbai 400050</strong></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsOfService;
