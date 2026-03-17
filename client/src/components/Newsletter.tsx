import { useState } from "react";
import { motion } from "framer-motion";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section id="newsletter" className="relative py-32 px-6 bg-background border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-tactical text-[10px] tracking-[0.5em] text-muted-foreground mb-3">
            INNER CIRCLE
          </p>
          <h2 className="font-soul text-3xl md:text-4xl font-light tracking-[0.05em] text-foreground mb-4">
            Stay Connected
          </h2>
          <p className="font-tactical text-xs leading-relaxed text-muted-foreground mb-12 max-w-md mx-auto">
            First access to drops, behind-the-scenes from the studio, and scripture reflections 
            from the ARMOR & LIGHT crew.
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="font-soul text-xl italic text-foreground">
                You're in the crew.
              </p>
              <p className="font-tactical text-[10px] tracking-[0.3em] text-muted-foreground">
                INNER CIRCLE — ACTIVE
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                required
                className="flex-1 bg-secondary border border-border px-5 py-4 font-tactical text-[11px] tracking-[0.15em] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
              />
              <button
                type="submit"
                className="font-tactical text-[11px] tracking-[0.3em] bg-foreground text-primary-foreground px-8 py-4 hover:bg-foreground/90 transition-colors"
              >
                JOIN
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
