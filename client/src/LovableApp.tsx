import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useCartSync } from "@/hooks/useCartSync";
import CartDrawer from "@/components/cart/CartDrawer";
import Index from "./pages/Index";
import TheWord from "./pages/TheWord";
import TheWalk from "./pages/TheWalk";
import TheCovenant from "./pages/TheCovenant";
import TheOrigin from "./pages/TheOrigin";
import MissionMap from "./pages/MissionMap";
import TheCollection from "./pages/TheCollection";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return (
    <>
      <Toaster />
      <Sonner />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/the-word" element={<TheWord />} />
        <Route path="/the-walk" element={<TheWalk />} />
        <Route path="/the-covenant" element={<TheCovenant />} />
        <Route path="/origin" element={<TheOrigin />} />
        <Route path="/mission-map" element={<MissionMap />} />
        <Route path="/collection" element={<TheCollection />} />
        <Route path="/wishlist" element={<Wishlist />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WishlistProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </WishlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
