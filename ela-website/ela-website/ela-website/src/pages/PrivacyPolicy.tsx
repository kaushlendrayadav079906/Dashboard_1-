import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
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
            <h1 className="heading-display mb-4">Privacy Policy</h1>
            <p className="text-body max-w-lg mx-auto">
              Your privacy matters to us. Here's how we protect your data.
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
            className="prose prose-neutral max-w-none space-y-10"
          >
            <p className="text-body text-sm">
              <strong>Last Updated:</strong> February 10, 2026
            </p>

            <div>
              <h2 className="heading-subsection mb-4">1. Information We Collect</h2>
              <p className="text-body mb-3">
                When you visit our website or make a purchase, we collect certain information to provide you with the best shopping experience. This includes:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping and billing address when you place an order or create an account.</li>
                <li><strong>Payment Information:</strong> Credit/debit card details processed securely through our payment partners. We do not store your full card details.</li>
                <li><strong>Browsing Data:</strong> Pages visited, products viewed, time spent on the site, and device/browser information collected via cookies.</li>
                <li><strong>Communications:</strong> Any messages, reviews, or feedback you share with us.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li>Processing and fulfilling your orders and returns.</li>
                <li>Sending order confirmations, shipping updates, and delivery notifications.</li>
                <li>Personalizing your shopping experience and product recommendations.</li>
                <li>Sending promotional emails and offers (only with your consent — you can unsubscribe anytime).</li>
                <li>Improving our website, products, and customer service.</li>
                <li>Preventing fraud and ensuring website security.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">3. Sharing Your Information</h2>
              <p className="text-body mb-3">
                We do not sell or rent your personal information. We may share your data with:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li><strong>Service Providers:</strong> Shipping partners, payment processors, and analytics tools necessary to operate our business.</li>
                <li><strong>Legal Obligations:</strong> When required by law, court order, or government authority.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">4. Cookies & Tracking</h2>
              <p className="text-body">
                We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can manage your cookie preferences through your browser settings. Essential cookies required for website functionality cannot be disabled.
              </p>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">5. Data Security</h2>
              <p className="text-body">
                We implement industry-standard security measures including SSL encryption, secure payment gateways, and regular security audits to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">6. Your Rights</h2>
              <p className="text-body mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-body space-y-2 pl-2">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction or deletion of your data.</li>
                <li>Opt out of marketing communications at any time.</li>
                <li>Request a copy of your data in a portable format.</li>
                <li>Withdraw consent for data processing where applicable.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">7. Children's Privacy</h2>
              <p className="text-body">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </div>

            <div>
              <h2 className="heading-subsection mb-4">8. Changes to This Policy</h2>
              <p className="text-body">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </div>

            <div className="p-6 bg-secondary rounded-lg">
              <h2 className="heading-subsection mb-4">9. Contact Us</h2>
              <p className="text-body">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-3 text-body space-y-1">
                <p>Email: <strong>privacy@elabykoollifestyle.com</strong></p>
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

export default PrivacyPolicy;
