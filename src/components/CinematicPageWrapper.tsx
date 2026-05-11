/**
 * CinematicPageWrapper — wraps every route with depth-based enter/exit motion,
 * an ambient lighting gradient and the global perspective shell.
 * AnimatePresence in __root.tsx keys this on pathname for crossfade transitions.
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function CinematicPageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      data-cinematic-root
      className="perspective-shell relative"
      initial={{ opacity: 0, y: 36, z: -100, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, z: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, z: -60, filter: "blur(8px)" }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
