import { motion } from "framer-motion";

export function CountUp({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  );
}