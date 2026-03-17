import logoLongWhite from "@/assets/logo-long-white.png";

const Footer = () => {
  return (
    <footer className="bg-charcoal-deep border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Brand */}
          <div>
            <img src={logoLongWhite} alt="Armor // Light" className="h-6 object-contain mb-2" />
            <p className="font-tactical text-[9px] tracking-[0.3em] text-muted-foreground mt-2">
              STREET DEVOTION — EST. MMXXV
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div className="space-y-3">
              <p className="font-tactical text-[9px] tracking-[0.4em] text-muted-foreground">NAVIGATE</p>
              <a href="#products" className="block font-tactical text-[11px] tracking-[0.15em] text-foreground/60 hover:text-foreground transition-colors">
                The Collection
              </a>
              <a href="/the-walk" className="block font-tactical text-[11px] tracking-[0.15em] text-foreground/60 hover:text-foreground transition-colors">
                The Walk
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-tactical text-[9px] tracking-[0.2em] text-muted-foreground">
            © MMXXV ARMOR & LIGHT. ALL RIGHTS RESERVED.
          </p>
          <p className="font-soul text-sm italic text-foreground/40">
            Christ the power of God, and the wisdom of God.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
