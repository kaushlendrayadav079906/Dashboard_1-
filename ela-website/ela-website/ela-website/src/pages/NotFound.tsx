import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-4"
        >
          <h1 className="font-serif text-8xl md:text-9xl text-muted-foreground/30 mb-4">
            404
          </h1>
          <h2 className="heading-section mb-4">Page Not Found</h2>
          <p className="text-body max-w-md mx-auto mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="btn-primary"
          >
            Return Home
          </Link>
        </motion.div>
      </section>
    </Layout>
  );
};

export default NotFound;
