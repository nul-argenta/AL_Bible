import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const resultCards = [
  {
    title: "English Translation",
    placeholder: "The full passage will appear here in a modern English translation, formatted for readability and study.",
    ref: "—",
  },
  {
    title: "Original Language (Greek/Hebrew)",
    placeholder: "The original text with transliteration and word-by-word breakdown will render here for deep study.",
    ref: "—",
  },
  {
    title: "Etymology & Origin",
    placeholder: "Root words, linguistic origins, and historical context of key terms will be surfaced here.",
    ref: "—",
  },
];

const TheWord = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="font-soul text-4xl md:text-5xl text-center text-foreground mb-3 tracking-wide">
            The Word
          </h1>
          <p className="font-tactical text-xs tracking-[0.2em] text-muted-foreground text-center mb-10 uppercase">
            Search · Study · Understand
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-16">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Book, Chapter, or Verse (e.g., Ephesians 6:10)"
              className="w-full h-14 pl-12 pr-4 bg-secondary border border-border text-foreground font-tactical text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
          </div>

          {/* Result Shell */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resultCards.map((card) => (
              <Card
                key={card.title}
                className="relative bg-secondary border-border overflow-hidden group hover:border-muted-foreground/30 transition-colors duration-300"
              >
                {/* Beta badge */}
                <Badge
                  variant="outline"
                  className="absolute top-3 right-3 text-[9px] font-tactical tracking-[0.15em] text-muted-foreground border-muted-foreground/30 uppercase"
                >
                  Beta Access
                </Badge>

                <CardHeader className="pb-3">
                  <CardTitle className="font-tactical text-xs tracking-[0.2em] text-foreground uppercase">
                    {card.title}
                  </CardTitle>
                  <span className="font-tactical text-[10px] text-muted-foreground tracking-widest">
                    REF: {card.ref}
                  </span>
                </CardHeader>

                <CardContent>
                  <p className="font-soul text-sm text-muted-foreground leading-relaxed italic">
                    {card.placeholder}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TheWord;
