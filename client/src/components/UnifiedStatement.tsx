import { motion } from "framer-motion";

const UnifiedStatement = () => {
  return (
    <section className="relative py-32 px-6 bg-[hsl(0,0%,0%)] border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="font-tactical text-xl md:text-2xl lg:text-3xl tracking-[0.15em] text-foreground uppercase leading-relaxed mb-8">
            One Brand. Every Denomination.
            <br />
            No Divide.
          </h2>

          <div className="w-px h-10 bg-foreground/20 mx-auto mb-8" />

          <blockquote className="font-soul text-lg md:text-xl italic text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-3">
            "Put on the whole armour of God, that ye may be able to stand against the wiles of the devil."
          </blockquote>
          <p className="font-tactical text-[10px] tracking-[0.4em] text-muted-foreground/50">
            — EPHESIANS 6:11
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default UnifiedStatement;
