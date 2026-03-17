import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { Shield } from "lucide-react";
import heroStoneVideo from "@/assets/hero-stone.mp4";
import heroTacticalVideo from "@/assets/hero-tactical.mp4";

const armorPieces = [
  "BELT OF TRUTH",
  "BREASTPLATE OF RIGHTEOUSNESS",
  "SHOES OF PEACE",
  "SHIELD OF FAITH",
  "HELMET OF SALVATION",
  "SWORD OF THE SPIRIT",
];

const Hero = () => {
  const videoLeftRef = useRef<HTMLVideoElement>(null);
  const videoRightRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    [videoLeftRef, videoRightRef].forEach((ref) => {
      if (ref.current) {
        ref.current.playbackRate = 0.625;
      }
    });
  }, []);

  return (
    <section className="relative min-h-screen flex">
      {/* Left: Sanctuary / Stone */}
      <div className="relative w-1/2 hidden md:block overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0">
          <video
            ref={videoLeftRef}
            src={heroStoneVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/60" />
          <div className="reflective-flash-overlay" />
        </motion.div>
      </div>

      {/* Right: Tactical */}
      <div className="relative w-full md:w-1/2 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="absolute inset-0">
          <video
            ref={videoRightRef}
            src={heroTacticalVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/65" />
        </motion.div>
      </div>

      {/* Center content overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center px-6 max-w-3xl">
          {/* Armor of God — immediate metaphor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex justify-center"
          >
            <Shield className="w-10 h-10 text-foreground/60" strokeWidth={1} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <p className="font-tactical text-[10px] tracking-[0.5em] text-foreground/50 mb-2">
              EPHESIANS 6:11 — PUT ON THE FULL ARMOR
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-soul text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.08em] leading-[1.1] text-foreground mb-4">
            ARMOUR FOR THE SOUL.
            <br />
            <span className="italic font-light">Light for the World.</span>
          </motion.h1>

          {/* Armor pieces ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6"
          >
            {armorPieces.map((piece, i) => (
              <motion.span
                key={piece}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }}
                className="font-tactical text-[9px] tracking-[0.3em] text-foreground/35"
              >
                {piece}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.0 }}>
            <p className="font-soul text-lg md:text-xl text-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
              Tactical streetwear forged from faith. Every piece you wear funds missions that bridge the fortunate and the forgotten.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/collection"
              className="inline-block font-tactical text-xs tracking-[0.3em] border border-foreground/40 px-10 py-4 text-foreground hover:bg-foreground hover:text-primary-foreground transition-all duration-500">
              EXPLORE THE COLLECTION
            </a>
            <a
              href="/the-walk"
              className="inline-block font-tactical text-[10px] tracking-[0.3em] text-foreground/50 hover:text-foreground transition-colors duration-300 underline underline-offset-4 decoration-foreground/20">
              SEE WHERE YOUR MONEY GOES →
            </a>
          </motion.div>
        </div>
      </div>

      {/* Vertical divider line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/10 origin-top hidden md:block z-10" />
    </section>
  );
};

export default Hero;