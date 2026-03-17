import { MapPin, Clock, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import mission001 from "@/assets/mission-001.jpg";
import mission002 from "@/assets/mission-002.jpg";
import mission003 from "@/assets/mission-003.jpg";

const reports = [
  {
    id: "DROP-001",
    title: "Winter Drop — Sydney CBD",
    timestamp: "2025-07-14 · 21:30 AEST",
    coords: "33.8150° S, 151.0011° E",
    image: mission001,
    description:
      "Night-time street outreach in Sydney's central business district. The team distributed insulated hoodies and shared prayer with those sleeping rough through the winter cold.",
    outcome: "50 Hoodies Delivered",
    status: "COMPLETE",
  },
  {
    id: "DROP-002",
    title: "The Gathering — Warehouse Revival",
    timestamp: "2025-06-22 · 18:00 AEST",
    coords: "33.8688° S, 151.2093° E",
    image: mission002,
    description:
      "A faith-based community gathering held inside a converted warehouse. Worship, testimony, and fellowship — bringing the church outside the four walls.",
    outcome: "120 Lives Touched",
    status: "COMPLETE",
  },
  {
    id: "DROP-003",
    title: "Youth Workshop — Urban Canvas",
    timestamp: "2025-05-10 · 14:00 AEST",
    coords: "33.8836° S, 151.2006° E",
    image: mission003,
    description:
      "A creative workshop pairing at-risk youth with local artists to paint murals across the community centre. Art as a vehicle for hope and identity.",
    outcome: "30 Youth Engaged",
    status: "COMPLETE",
  },
];

const TheWalk = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="font-soul text-4xl md:text-5xl text-center text-foreground mb-3 tracking-wide">
            The Walk
          </h1>
          <p className="font-tactical text-xs tracking-[0.2em] text-muted-foreground text-center mb-4 uppercase">
            Stories · Impact · Community
          </p>
          <div className="w-16 h-px bg-border mx-auto mb-16" />

          {/* Reports */}
          <div className="flex flex-col gap-16">
            {reports.map((report) => (
              <article
                key={report.id}
                className="border border-border bg-secondary/40 overflow-hidden"
              >
                {/* Report Header Bar */}
                <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="font-tactical text-xs tracking-[0.2em] text-foreground">
                      {report.id}
                    </span>
                    <span className="font-tactical text-[10px] tracking-wider text-muted-foreground px-2 py-0.5 border border-muted-foreground/30">
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-5 text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-tactical text-[10px] tracking-wider">
                      <Clock className="h-3 w-3" />
                      {report.timestamp}
                    </span>
                    <span className="flex items-center gap-1.5 font-tactical text-[10px] tracking-wider">
                      <MapPin className="h-3 w-3" />
                      {report.coords}
                    </span>
                  </div>
                </div>

                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={report.image}
                    alt={report.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <h2 className="absolute bottom-6 left-6 font-soul text-2xl md:text-3xl text-foreground">
                    {report.title}
                  </h2>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {report.description}
                  </p>

                  {/* Mission Outcome */}
                  <div className="flex items-center gap-3 border border-border bg-background/50 px-4 py-3">
                    <Heart className="h-4 w-4 text-foreground shrink-0" />
                    <div>
                      <span className="font-tactical text-[10px] tracking-[0.15em] text-muted-foreground uppercase block">
                        Impact
                      </span>
                      <span className="font-tactical text-sm tracking-wider text-foreground">
                        {report.outcome}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="group flex items-center gap-3 border border-foreground/30 hover:border-foreground bg-transparent px-5 py-3 transition-all duration-300 hover:bg-foreground/5">
                    <Heart className="h-4 w-4 text-foreground group-hover:scale-110 transition-transform" />
                    <span className="font-tactical text-[11px] tracking-[0.2em] text-foreground uppercase">
                      Stand With Us
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TheWalk;
