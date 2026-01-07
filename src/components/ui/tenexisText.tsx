"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TenexisLogo from "./tenexisLogo";

export function TenexisText() {
  const [displayText, setDisplayText] = useState("Tenexis");

  useEffect(() => {
    const hostname = window.location.hostname;
    let target = "Tenexis";
    
    if (hostname.includes("thrift")) target = "Tenexis Thrift";
    else if (hostname.includes("store")) target = "Tenexis Store";
    else if (hostname.includes("notes")) target = "Tenexis Notes";

    const timer = setTimeout(() => {
      setDisplayText(target);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <TenexisLogo height={24} color="var(--primary)" />
      <div className="relative overflow-hidden h-8 flex items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={displayText}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white"
          >
            {displayText}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}