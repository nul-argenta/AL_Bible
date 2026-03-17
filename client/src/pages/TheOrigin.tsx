import { motion } from "framer-motion";
import { Compass, BookOpen, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import originEditorial from "@/assets/origin-editorial.jpg";

const units = [
  {
    code: "UNIT 01",
    title: "DESIGN & LOGISTICS",
    description:
      "Tactical manufacturing and quality control. Every stitch, every fibre, every detail is engineered with purpose — built to last, designed to serve.",
    icon: Compass,
  },
  {
    code: "UNIT 02",
    title: "THEOLOGICAL RESEARCH",
    description:
      "The Word: Greek and Hebrew repository. Tracing scripture back to its original language to understand what was truly spoken.",
    icon: BookOpen,
  },
  {
    code: "UNIT 03",
    title: "COMMUNITY OUTREACH",
    description:
      "Ground missions and distribution. Showing up on the streets, clothing the less fortunate, and proving faith without works is dead.",
    icon: Users,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const TheOrigin = () => {
  return (
    <div className="min-h-screen bg-[hsl(0,0%,0%)] text-foreground">
      <Navbar />

      {/* Blueprint grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0,0%,6.7%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,6.7%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Hero Header ── */}
      <section className="relative z-10 pt-40 pb-24 px-6 text-center">
        <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
          <p className="font-tactical text-xs tracking-[0.5em] text-muted-foreground mb-4">
            FIELD REPORT // DECLASSIFIED
          </p>
          <h1 className="font-soul text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.1em] text-foreground mb-6">
            THE ORIGIN
          </h1>
          <p className="font-soul text-xl md:text-2xl italic text-foreground/70">
            From Precision to Purpose.
          </p>
          <div className="w-24 h-px bg-foreground/20 mt-10 mx-auto" />
        </motion.div>
      </section>

      {/* ── The Transition (Narrative) ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="font-tactical text-xs tracking-[0.4em] text-muted-foreground mb-12"
          >
            01 // THE TRANSITION
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.1 }}>
              <p className="font-soul text-lg md:text-xl leading-[1.8] text-foreground/85">
                For years, our team's focus was on the external—the precision of
                technical engineering and the high-end aesthetics of the
                automotive industry. We understood what it meant to protect and
                transform high-value assets.
              </p>
              <p className="font-soul text-lg md:text-xl leading-[1.8] text-foreground/85 mt-6">
                But Christ called for a different kind of transformation.
              </p>
              <p className="font-soul text-lg md:text-xl leading-[1.8] text-foreground/85 mt-6">
                Armour &amp; Light was born from a realization that while we
                spend our lives protecting what we own, we often leave our
                spirits and our communities unguarded. We have pivoted our
                obsession with technical excellence toward a higher mandate:
                equipping the Body of Christ.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="relative border border-border overflow-hidden min-h-[400px]"
            >
              <img
                src={originEditorial}
                alt="Hooded figure standing in a gritty urban alleyway — high-contrast black and white editorial"
                className="w-full h-full object-cover"
              />
              {/* Corner markers */}
              <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-foreground/20" />
              <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-foreground/20" />
              <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-foreground/20" />
              <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-foreground/20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── The Philosophy (Full-Width Callout) ── */}
      <section className="relative z-10 py-28 px-6 border-t border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-tactical text-xs tracking-[0.4em] text-muted-foreground mb-8">
              02 // THE PHILOSOPHY
            </p>
            <h2 className="font-soul text-3xl md:text-5xl font-light tracking-[0.06em] leading-[1.2] text-foreground mb-10">
              Built for the Battle,
              <br />
              <span className="italic">Designed for Unity.</span>
            </h2>
            <p className="font-soul text-lg md:text-xl leading-[1.9] text-foreground/80 max-w-3xl mx-auto">
              We don't just make clothes; we manufacture identity. In the world,
              fashion is used to create a divide. At Armour &amp; Light, we
              bridge that gap. Our tactical streetwear is a uniform of equality.
              Whether you are a donor from a city church or a brother receiving a
              warm hoodie on a cold night, the garment is the same. Under the
              Armour, we are one. In the Light, we are equal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Mission Command (The Team) ── */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="mb-16">
            <p className="font-tactical text-xs tracking-[0.4em] text-muted-foreground mb-4">
              03 // MISSION COMMAND
            </p>
            <h2 className="font-soul text-3xl md:text-4xl font-light tracking-[0.05em] text-foreground">
              Operational Units
            </h2>
            <div className="w-16 h-px bg-foreground/20 mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {units.map((unit, i) => (
              <motion.div
                key={unit.code}
                {...fadeUp}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="border border-border bg-[hsl(0,0%,0%)] p-8 group hover:border-muted-foreground/40 transition-colors duration-300"
              >
                <p className="font-tactical text-xs tracking-[0.3em] text-muted-foreground mb-6">
                  {unit.code}
                </p>
                <unit.icon className="h-7 w-7 text-foreground mb-5 group-hover:scale-110 transition-transform" />
                <h3 className="font-tactical text-lg tracking-[0.2em] text-foreground uppercase mb-4">
                  {unit.title}
                </h3>
                <p className="font-soul text-lg text-muted-foreground leading-relaxed">
                  {unit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer Signature ── */}
      <section className="relative z-10 py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-tactical text-sm tracking-[0.25em] text-foreground mb-4">
              ARMOUR &amp; LIGHT // MISSION COMMAND.
            </p>
            <p className="font-tactical text-sm tracking-[0.2em] text-foreground/80 mb-8">
              UNITED IN CHRIST. OPERATING FOR HUMANITY.
            </p>
            <p className="font-tactical text-[10px] tracking-[0.3em] text-muted-foreground/50">
              ROMANS 12:4-5
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TheOrigin;
