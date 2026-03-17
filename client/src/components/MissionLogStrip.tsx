import { motion } from "framer-motion";
import { Heart, MapPin, Users } from "lucide-react";

const stats = [
  { icon: Heart, value: "200+", label: "HOODIES DELIVERED" },
  { icon: Users, value: "150+", label: "LIVES TOUCHED" },
  { icon: MapPin, value: "3", label: "MISSION DROPS" },
];

const MissionLogStrip = () => {
  return (
    <section className="relative py-12 px-6 bg-secondary/50 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <p className="font-tactical text-[10px] tracking-[0.4em] text-muted-foreground mb-2">
            TRANSPARENCY REPORT — WHERE YOUR PURCHASE GOES
          </p>
          <h2 className="font-soul text-2xl md:text-3xl text-foreground tracking-wide">
            Mission Log
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center"
            >
              <stat.icon className="w-5 h-5 text-foreground/50 mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-soul text-3xl md:text-4xl text-foreground mb-1">{stat.value}</p>
              <p className="font-tactical text-[9px] tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <p className="font-clean text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
            Every item sold directly funds street outreach, winter drops, and youth programs. 
            We publish every mission with full photo documentation.
          </p>
          <a
            href="/the-walk"
            className="inline-block font-tactical text-[10px] tracking-[0.3em] border border-foreground/30 px-8 py-3 text-foreground hover:bg-foreground hover:text-primary-foreground transition-all duration-500"
          >
            VIEW FULL MISSION LOG
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default MissionLogStrip;
