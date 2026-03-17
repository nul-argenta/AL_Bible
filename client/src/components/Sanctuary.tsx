import { motion } from "framer-motion";
import logoWhite from "@/assets/logo-white.png";

const Sanctuary = () => {
  return (
    <section id="sanctuary" className="relative">
      {/* Dark to light gradient background */}
      <div className="sanctuary-gradient">
        <div className="max-w-5xl mx-auto px-6 py-40">
          {/* Sigma-Cross sigil */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-20"
          >
            <img src={logoWhite} alt="Sigma-Cross sigil" className="w-28 h-28 object-contain opacity-60" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center mb-16"
          >
            <p className="font-tactical text-[10px] tracking-[0.5em] text-muted-foreground mb-6">
              THE SIGMA-CROSS
            </p>
            <h2 className="font-soul text-3xl md:text-5xl lg:text-6xl font-light italic tracking-[0.04em] leading-tight text-foreground">
              Where Wisdom meets Power,
              <br />
              the Stronghold is built.
            </h2>
          </motion.div>

          {/* Explanation body */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto space-y-8 text-center"
          >
            <p className="font-soul text-xl md:text-2xl font-light leading-relaxed text-foreground/80">
              The Sigma-Cross is the intersection of Sophia — the Greek for divine Wisdom — and 
              the Cross of Christ. It is the emblem of those who refuse to separate intellect from devotion, 
              strength from surrender.
            </p>

            <div className="w-px h-12 bg-foreground/20 mx-auto" />

            <blockquote className="font-soul text-lg md:text-xl italic text-foreground/60 leading-relaxed">
              "But unto them which are called, both Jews and Gentiles, Christ the power of God, 
              and the wisdom of God."
            </blockquote>
            <p className="font-tactical text-[10px] tracking-[0.4em] text-muted-foreground">
              — 1 CORINTHIANS 1:24
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Sanctuary;
