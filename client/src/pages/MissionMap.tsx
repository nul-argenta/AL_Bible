import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Types ─────────────────────────────────────────────────
type MarkerCategory = "church" | "community" | "support";

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: MarkerCategory;
  rating: number;
  type: string;
  hours: string;
  status: string;
  objective: string;
  update: string;
}

const locations: MapLocation[] = [
  {
    id: "st-patricks",
    name: "Saint Patricks Cathedral, Parramatta",
    lat: -33.8151,
    lng: 151.0028,
    category: "church",
    rating: 4.7,
    type: "Church",
    hours: "Open · Closes at 6:00 pm",
    status: "Partner Church",
    objective: "Bridging community outreach with local discipleship.",
    update: "Parramatta — 50 hoodies delivered to the community",
  },
  {
    id: "st-johns",
    name: "St John's Anglican Cathedral",
    lat: -33.8138,
    lng: 151.0012,
    category: "church",
    rating: 4.5,
    type: "Church",
    hours: "Open · Closes at 5:00 pm",
    status: "Partner Church",
    objective: "Heritage hub for Anglican community worship and outreach.",
    update: "St John's — Community gathering hosted",
  },
  {
    id: "reach-church",
    name: "Reach Church Parramatta",
    lat: -33.8175,
    lng: 151.0035,
    category: "church",
    rating: 4.6,
    type: "Church",
    hours: "Open · Sunday Services",
    status: "Partner Church",
    objective: "Bridging community outreach with local discipleship.",
    update: "Reach — Discipleship network growing",
  },
  {
    id: "reg-byrne",
    name: "Reg Byrne Community Centre",
    lat: -33.8072,
    lng: 150.9725,
    category: "community",
    rating: 4.2,
    type: "Community Centre",
    hours: "Open · Closes at 12:00 am",
    status: "Community Hub",
    objective: "Local distribution hub for community engagement programs.",
    update: "Reg Byrne — 30 care packs prepared",
  },
  {
    id: "wentworthville",
    name: "Wentworthville Community Centre",
    lat: -33.8068,
    lng: 150.9695,
    category: "community",
    rating: 4.3,
    type: "Community Centre",
    hours: "Open · Closes at 9:00 pm",
    status: "Community Hub",
    objective: "Outreach coordination for western Sydney programs.",
    update: "Wentworthville — Outreach programs underway",
  },
  {
    id: "matthew-talbot",
    name: "Matthew Talbot Hostel",
    lat: -33.8688,
    lng: 151.2093,
    category: "support",
    rating: 4.0,
    type: "Organisation",
    hours: "Open · Closes at 4:30 pm",
    status: "Distribution Partner",
    objective: "Distributing the 'Armour' line to those in need across the Sydney CBD.",
    update: "Talbot — 80 units of the Armour line shared",
  },
  {
    id: "foster-house",
    name: "Foster House",
    lat: -33.8792,
    lng: 151.2075,
    category: "support",
    rating: 4.1,
    type: "Shelter",
    hours: "Open · 24 Hours",
    status: "Distribution Partner",
    objective: "Emergency shelter distribution point for essential apparel.",
    update: "Foster House — Emergency kits delivered",
  },
  {
    id: "inner-city-homeless",
    name: "Inner City Homelessness Service",
    lat: -33.8735,
    lng: 151.2110,
    category: "support",
    rating: 4.0,
    type: "Services",
    hours: "Open",
    status: "Distribution Partner",
    objective: "Distributing the 'Armour' line to those in need across the Sydney CBD.",
    update: "ICHS — Active distribution partnership",
  },
  {
    id: "reach-support",
    name: "Reach Support Services for Homeless and Disability",
    lat: -33.8160,
    lng: 151.0050,
    category: "community",
    rating: 5.0,
    type: "Non-profit Organisation",
    hours: "Open · Closes at 5:00 pm",
    status: "Outreach Partner",
    objective: "Coordinating community support for specialised needs.",
    update: "Reach Support — Community impact logs updated",
  },
];

const markerColors: Record<MarkerCategory, string> = {
  church: "#e8e4de",
  community: "#d4a574",
  support: "#7eb8c9",
};

const categoryLabels: Record<MarkerCategory, string> = {
  church: "Partner Church",
  community: "Community Hub",
  support: "Support Partner",
};

const categoryTailwind: Record<MarkerCategory, string> = {
  church: "text-limestone",
  community: "text-amber-300",
  support: "text-sky-300",
};

const categoryDotClass: Record<MarkerCategory, string> = {
  church: "bg-limestone",
  community: "bg-amber-300",
  support: "bg-sky-300",
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="font-clean text-xs text-amber-300/80">
      {"★".repeat(full)}
      {half && "½"} {rating.toFixed(1)}
    </span>
  );
}

const MissionMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [selected, setSelected] = useState<MapLocation | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [-33.83, 151.05],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(map);

    locations.forEach((loc) => {
      const color = markerColors[loc.category];
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2,
        opacity: 0.9,
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:'Inter',sans-serif;font-size:13px;padding:6px;max-width:240px;">
          <div style="font-size:11px;letter-spacing:0.05em;color:${color};margin-bottom:6px;opacity:0.8;">${categoryLabels[loc.category]}</div>
          <strong style="font-size:14px;">${loc.name}</strong><br/>
          <span style="opacity:0.6;font-size:12px;">${loc.hours}</span><br/>
          <span style="opacity:0.6;font-size:12px;line-height:1.5;">${loc.objective}</span>
        </div>`,
        { className: "community-popup" }
      );

      marker.on("click", () => setSelected(loc));
    });

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  const handleSelect = (loc: MapLocation) => {
    setSelected(loc);
    mapInstance.current?.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-[65px] relative">
        {/* ── Sidebar ── */}
        <div className="w-[340px] shrink-0 bg-background border-r border-border flex flex-col z-10">
          {/* Header */}
          <div className="p-5 border-b border-border">
            <div className="font-clean text-xs tracking-[0.15em] text-muted-foreground mb-1 uppercase">
              ARMOR // LIGHT
            </div>
            <h2 className="font-soul text-2xl tracking-wide text-foreground">
              Where We Walk
            </h2>
            <p className="font-clean text-sm text-muted-foreground mt-2 leading-relaxed">
              Every pin marks a place where the community has been served, supported, or strengthened.
            </p>
            <div className="mt-3 h-px bg-gradient-to-r from-amber-300/30 via-sky-300/20 to-transparent" />
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-b border-border flex flex-wrap gap-4">
            {(Object.entries(categoryLabels) as [MarkerCategory, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${categoryDotClass[key]}`}
                  style={{ opacity: 0.8 }}
                />
                <span className="font-clean text-xs text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Entries */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selected?.id === loc.id
                      ? "border-amber-300/30 bg-amber-300/5"
                      : "border-border hover:border-muted-foreground/20 bg-transparent hover:bg-secondary/30"
                  }`}
                >
                  <div className={`font-clean text-[11px] tracking-[0.1em] uppercase ${categoryTailwind[loc.category]} mb-1 opacity-80`}>
                    {categoryLabels[loc.category]}
                  </div>
                  <div className="font-clean text-sm font-medium text-foreground leading-snug mb-1.5">
                    {loc.name}
                  </div>
                  <div className="font-clean text-xs text-muted-foreground leading-snug">
                    {loc.update}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars rating={loc.rating} />
                    <span className="font-clean text-[11px] text-muted-foreground opacity-70">
                      {loc.hours}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="font-soul text-sm text-muted-foreground text-center leading-relaxed italic">
              "The body has many parts, but they all form one body." — 1 Cor 12:12
            </p>
          </div>
        </div>

        {/* ── Map ── */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="h-full w-full" style={{ background: "hsl(0 0% 7%)" }} />

          {/* Detail panel */}
          {selected && (
            <div className="absolute top-4 right-4 z-30 w-[300px] bg-card/95 border border-border backdrop-blur-md rounded-lg p-5">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-4 font-clean text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
              <div className={`font-clean text-[11px] tracking-[0.1em] uppercase ${categoryTailwind[selected.category]} mb-2 opacity-80`}>
                {categoryLabels[selected.category]}
              </div>
              <h3 className="font-clean text-base font-medium text-foreground mb-2 leading-snug pr-6">
                {selected.name}
              </h3>
              <Stars rating={selected.rating} />
              <div className="mt-2 font-clean text-xs text-muted-foreground">
                📍 {selected.type}
              </div>
              <div className="font-clean text-xs text-muted-foreground mt-0.5">
                {selected.hours}
              </div>
              <div className="mt-3 h-px bg-border" />
              <div className="mt-3">
                <div className="font-clean text-[11px] tracking-[0.08em] uppercase text-foreground/60 mb-1">Impact</div>
                <div className="font-clean text-sm text-foreground">{selected.status}</div>
              </div>
              <div className="mt-2">
                <div className="font-clean text-[11px] tracking-[0.08em] uppercase text-foreground/60 mb-1">Purpose</div>
                <div className="font-clean text-sm text-muted-foreground leading-relaxed">
                  {selected.objective}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionMap;
