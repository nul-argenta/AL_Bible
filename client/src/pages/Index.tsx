import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MissionLogStrip from "@/components/MissionLogStrip";
import Pillars from "@/components/Pillars";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
import Sanctuary from "@/components/Sanctuary";
import FlashToggle from "@/components/FlashToggle";
import UnifiedStatement from "@/components/UnifiedStatement";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-[hsl(0,0%,0%)]">
      <Navbar />
      <Hero />
      <MissionLogStrip />
      <Pillars />
      <ProductGrid />
      <Testimonials />
      <Sanctuary />
      <FlashToggle />
      <UnifiedStatement />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
