import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Footprints, ShoppingBag } from "lucide-react";

const pillars = [
  {
    icon: ShoppingBag,
    title: "THE COLLECTION",
    description:
      "Premium urban streetwear designed to unite — not divide. Every piece is built with purpose, quality, and identity. When you wear the brand, you wear the movement.",
    link: "#products",
    type: "hash" as const,
    status: null,
  },
  {
    icon: BookOpen,
    title: "THE WORD",
    description:
      "A deep-dive Greek and Hebrew scripture repository. Study the Bible in its original language, trace the etymology of every word, and understand what was truly spoken.",
    link: "/the-word",
    type: "route" as const,
    status: "Active Development",
  },
  {
    icon: Footprints,
    title: "THE WALK",
    description:
      "Direct action on the streets. Clothing the less fortunate, showing up for communities, and proving that faith without works is dead. This is where the brand meets the pavement.",
    link: "/the-walk",
    type: "route" as const,
    status: null,
  },
];

const Pillars = () => {
  const navigate = useNavigate();

  const handleClick = (pillar: (typeof pillars)[0]) => {
    if (pillar.type === "route") {
      navigate(pillar.link);
    } else {
      const el = document.querySelector(pillar.link);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-28 px-6 bg-[hsl(0,0%,0%)] border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-tactical text-xs tracking-[0.5em] text-muted-foreground mb-3">
            STRATEGIC MANDATE
          </p>
          <h2 className="font-soul text-4xl md:text-5xl font-light tracking-[0.05em] text-foreground">
            Three Pillars. One Purpose.
          </h2>
          <div className="w-16 h-px bg-foreground/20 mt-6 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              onClick={() => handleClick(pillar)}
              className="relative border border-border bg-[hsl(0,0%,0%)] p-8 cursor-pointer group hover:border-muted-foreground/40 transition-colors duration-300"
            >
              {/* Status badge */}
              {pillar.status && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground/40 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground/60" />
                  </span>
                  <span className="font-tactical text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                    {pillar.status}
                  </span>
                </div>
              )}

              <pillar.icon className="h-6 w-6 text-foreground mb-6 group-hover:scale-110 transition-transform" />

              <h3 className="font-tactical text-lg tracking-[0.2em] text-foreground uppercase mb-4">
                {pillar.title}
              </h3>

              <p className="font-soul text-lg text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>

              <div className="mt-6 pt-4 border-t border-border">
                <span className="font-tactical text-sm tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                  Explore →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pillars;
