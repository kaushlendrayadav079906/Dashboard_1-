import { motion } from "framer-motion";

const FloatingDots = () => {
  return (
    <>
      <motion.div
        className="absolute top-16 right-[15%] w-2 h-2 bg-brand/15 rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-[10%] w-2.5 h-2.5 bg-brand/10 rounded-full"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </>
  );
};

const SparkleAccent = () => {
  return (
    <>
      <motion.div
        className="absolute top-10 right-[20%] w-3 h-3 border border-brand/10 rotate-45"
        animate={{ rotate: [45, 90, 45] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
};

export { FloatingDots, SparkleAccent };
