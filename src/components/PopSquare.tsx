import { useAnimation, useInView, motion } from "framer-motion";
import { useEffect, useRef } from "react";

const squareVariants = {
  visible: { opacity: 1, scale: 1, transition: { duration: 1 } },
  hidden: { opacity: 0, scale: 0 },
};

export function PopSquare({ children }: any) {
  const controls = useAnimation();
  const squareRef = useRef(null);
  const inView = useInView(squareRef);
  useEffect(() => {
    if (inView) {
      console.log("in view");
      controls.start("visible");
    }
  }, [controls, inView]);
  return (
    <motion.div
      ref={squareRef}
      animate={controls}
      initial="hidden"
      variants={squareVariants}
      className="rounded-xl border-2 border-gray-700 max-w-full h-fit bg-gray-700/40 hover:bg-gray-700/70 transition-colors duration-4300 mx-auto relative py-4 px-2"
    >
      {children}
    </motion.div>
  );
}
