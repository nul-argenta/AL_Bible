import { useState } from "react";
import { Heart, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const partnerOptions = [
  { value: "donation", label: "Donation Support" },
  { value: "event", label: "Community Event Host" },
  { value: "distribution", label: "Distribution Partner" },
];

const TheCovenant = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleOption = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-6 relative">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-foreground" />
              <span className="font-tactical text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                Stand Together
              </span>
              <Heart className="h-5 w-5 text-foreground" />
            </div>
            <h1 className="font-tactical text-xl md:text-2xl tracking-[0.15em] text-foreground uppercase mb-3">
              The Covenant: Walk With Us
            </h1>
            <div className="w-24 h-px bg-border mx-auto" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1 — About You */}
            <section className="border border-border bg-secondary/30 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-tactical text-[10px] tracking-[0.2em] text-muted-foreground bg-border px-2 py-0.5">
                  01
                </span>
                <h2 className="font-tactical text-xs tracking-[0.2em] text-foreground uppercase">
                  About Your Community
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="font-tactical text-[10px] tracking-[0.15em] text-muted-foreground uppercase block">
                    Church / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full h-11 px-4 bg-background border border-border text-foreground font-tactical text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-tactical text-[10px] tracking-[0.15em] text-muted-foreground uppercase block">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full h-11 px-4 bg-background border border-border text-foreground font-tactical text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    placeholder="City, State/Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="font-tactical text-[10px] tracking-[0.15em] text-muted-foreground uppercase block">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full h-11 px-4 bg-background border border-border text-foreground font-tactical text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-tactical text-[10px] tracking-[0.15em] text-muted-foreground uppercase block">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full h-11 px-4 bg-background border border-border text-foreground font-tactical text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    placeholder="email@church.org"
                  />
                </div>
              </div>
            </section>

            {/* Section 2 — How You'd Like to Connect */}
            <section className="border border-border bg-secondary/30 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-tactical text-[10px] tracking-[0.2em] text-muted-foreground bg-border px-2 py-0.5">
                  02
                </span>
                <h2 className="font-tactical text-xs tracking-[0.2em] text-foreground uppercase">
                  How You'd Like to Connect
                </h2>
              </div>

              <p className="font-tactical text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                How would you like to walk with us? (Select all that apply)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {partnerOptions.map((opt) => {
                  const isActive = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleOption(opt.value)}
                      className={`border px-4 py-4 text-center transition-all duration-300 ${
                        isActive
                          ? "border-foreground bg-foreground/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                      }`}
                    >
                      <span className="font-tactical text-[11px] tracking-[0.15em] uppercase">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Section 3 — Your Message */}
            <section className="border border-border bg-secondary/30 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-tactical text-[10px] tracking-[0.2em] text-muted-foreground bg-border px-2 py-0.5">
                  03
                </span>
                <h2 className="font-tactical text-xs tracking-[0.2em] text-foreground uppercase">
                  Your Message
                </h2>
              </div>

              <div className="space-y-2">
                <label className="font-tactical text-[10px] tracking-[0.15em] text-muted-foreground uppercase block">
                  Message / Details
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground font-tactical text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-all resize-none"
                  placeholder="Describe your vision for partnership, available resources, or questions..."
                />
              </div>
            </section>

            {/* Submit */}
            <div className="flex flex-col items-center gap-6">
              <button
                type="submit"
                disabled={submitted}
                className="group flex items-center gap-3 bg-foreground text-background px-8 py-4 hover:bg-foreground/90 transition-all duration-300 disabled:opacity-60"
              >
                <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                <span className="font-tactical text-[11px] tracking-[0.2em] uppercase">
                  {submitted ? "Submitted — We'll Be in Touch" : "Submit Your Proposal"}
                </span>
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-16 border-t border-border pt-8 text-center">
            <p className="font-soul text-base italic text-muted-foreground leading-relaxed max-w-lg mx-auto">
              "Armour &amp; Light is a cross-denominational movement. We stand united in Christ."
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TheCovenant;
