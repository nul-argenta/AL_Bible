import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FlashToggle = () => {
  const [isFlashing, setIsFlashing] = useState(false);

  const triggerFlash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 600);
  }, []);

  return (
    <section className="relative py-32 px-6 bg-charcoal-deep overflow-hidden">
      {/* Flash overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, hsl(195 100% 80% / 0.15) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-tactical text-[10px] tracking-[0.5em] text-muted-foreground mb-6">
            3M REFLECTIVE TECHNOLOGY
          </p>

          <h2
            className={`font-soul text-3xl md:text-5xl font-light tracking-[0.05em] mb-4 transition-all duration-300 ${
              isFlashing ? "glow-3m text-reflective-bright" : "text-foreground"
            }`}
          >
            Seen in the Dark.
          </h2>

          <p className="font-tactical text-xs leading-relaxed text-muted-foreground max-w-lg mx-auto mb-12">
            Every ARMOR & LIGHT garment carries 3M™ reflective elements — the Sigma-Cross pocket, 
            forearm prints, and hidden sigils that ignite under direct light. 
            Invisible by day. Unmistakable by night.
          </p>

          {/* 3M elements demo */}
          <div className="flex justify-center gap-12 mb-16">
            {["POCKET SIGIL", "FOREARM PRINT", "COLLAR TAG"].map((element) => (
              <motion.div
                key={element}
                className={`flex flex-col items-center gap-3 transition-all duration-300 ${
                  isFlashing ? "glow-3m" : ""
                }`}
              >
                <div
                  className={`w-16 h-16 border transition-all duration-300 flex items-center justify-center ${
                    isFlashing
                      ? "border-flash bg-flash/10 glow-3m-box"
                      : "border-border bg-secondary"
                  }`}
                >
                  <div
                    className={`w-6 h-6 transition-all duration-300 ${
                      isFlashing ? "bg-flash/60" : "bg-foreground/10"
                    }`}
                    style={{
                      clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    }}
                  />
                </div>
                <span
                  className={`font-tactical text-[9px] tracking-[0.3em] transition-colors duration-300 ${
                    isFlashing ? "text-reflective-bright" : "text-muted-foreground"
                  }`}
                >
                  {element}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Flash button */}
          <motion.button
            onClick={triggerFlash}
            whileTap={{ scale: 0.95 }}
            className={`relative font-tactical text-[11px] tracking-[0.3em] px-12 py-4 border transition-all duration-500 overflow-hidden ${
              isFlashing
                ? "border-flash text-background bg-flash glow-3m-box"
                : "border-foreground/30 text-foreground hover:border-foreground"
            }`}
          >
            <span className="relative z-10">
              {isFlashing ? "◆ FLASH ACTIVE ◆" : "ACTIVATE 3M FLASH"}
            </span>
            {isFlashing && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-reflective-bright/30 to-transparent"
              />
            )}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FlashToggle;
