import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "I've never worn a brand that actually shows you the receipts. I watched them hand out hoodies in the CBD — that's where my money went. That's real.",
    name: "Jordan M.",
    role: "CUSTOMER — SYDNEY",
    type: "customer" as const,
  },
  {
    quote:
      "They came on a Tuesday night when nobody else did. Gave me a hoodie and sat with me for an hour. First time in months someone looked me in the eye.",
    name: "Dave",
    role: "WINTER DROP RECIPIENT — CBD",
    type: "impacted" as const,
  },
  {
    quote:
      "The quality is insane for a mission brand. I wear the bomber almost daily. Knowing it funded a youth art workshop makes it hit different.",
    name: "Priya S.",
    role: "CUSTOMER — MELBOURNE",
    type: "customer" as const,
  },
  {
    quote:
      "The mural workshop gave my son something to be proud of. He still talks about 'his wall' every time we drive past the community centre.",
    name: "Maria T.",
    role: "PARENT — YOUTH WORKSHOP",
    type: "impacted" as const,
  },
];

const Testimonials = () => {
  return (
    <section className="relative py-24 px-6 bg-background border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="font-tactical text-[10px] tracking-[0.4em] text-muted-foreground mb-2">
            VOICES FROM THE GROUND
          </p>
          <h2 className="font-soul text-2xl md:text-3xl text-foreground tracking-wide">
            Stories That Wear Well
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="border border-border bg-secondary/30 p-6 md:p-8 flex flex-col"
            >
              <Quote className="w-5 h-5 text-foreground/20 mb-4 shrink-0" />
              <blockquote className="font-soul text-base md:text-lg italic text-foreground/85 leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <div>
                  <p className="font-tactical text-xs tracking-wider text-foreground">
                    {t.name}
                  </p>
                  <p className="font-tactical text-[9px] tracking-[0.2em] text-muted-foreground mt-0.5">
                    {t.role}
                  </p>
                </div>
                <span
                  className={`font-tactical text-[8px] tracking-[0.15em] px-2 py-1 border ${
                    t.type === "customer"
                      ? "border-foreground/20 text-foreground/50"
                      : "border-foreground/30 text-foreground/60 bg-foreground/5"
                  }`}
                >
                  {t.type === "customer" ? "CUSTOMER" : "MISSION IMPACT"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
