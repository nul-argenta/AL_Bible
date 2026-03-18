import { Switch, Route as WouterRoute, Router as WouterRouter } from "wouter";
import { useEffect } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { HashRouter, Routes, Route as RouterRoute, Navigate } from "react-router-dom";

// providers
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useCartSync } from "@/hooks/useCartSync";
import CartDrawer from "@/components/cart/CartDrawer";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import { AccessibilityFilters } from "@/components/AccessibilityFilters";

// Existing Pages
import HomePage from "@/pages/HomePage";
import ReaderPage from "@/pages/ReaderPage";
import CommunityPage from "@/pages/CommunityPage";
import ReadingPlanPage from "@/pages/ReadingPlanPage";
import EditHistoryPage from "@/pages/EditHistoryPage";
import FavouritesPage from "@/pages/FavouritesPage";
import ProfilePage from "@/pages/ProfilePage";
import DropPage from "@/pages/DropPage";
import QuizPage from "@/pages/QuizPage";
import JournalPage from "@/pages/JournalPage";
import MemoryPage from "@/pages/MemoryPage";
import StudyChainsPage from "@/pages/StudyChainsPage";
import VerseImagePage from "@/pages/VerseImagePage";
import PrayerPage from "@/pages/PrayerPage";
import StatsPage from "@/pages/StatsPage";
import CharacterStudiesPage from "@/pages/CharacterStudiesPage";
import NotFound from "@/pages/NotFound";

// Lovable Pages
import Index from "./pages/Index";
import TheWord from "./pages/TheWord";
import TheWalk from "./pages/TheWalk";
import TheCovenant from "./pages/TheCovenant";
import TheOrigin from "./pages/TheOrigin";
import MissionMap from "./pages/MissionMap";
import TheCollection from "./pages/TheCollection";
import Wishlist from "./pages/Wishlist";

function BibleAppRouter() {
    return (
        <div className="bible-theme min-h-screen bg-background text-foreground">
            <WouterRouter hook={useHashLocation}>
                <Switch>
                    <WouterRoute path="/" component={HomePage} />
                    <WouterRoute path="/read/:book?/:chapter?" component={ReaderPage} />
                    <WouterRoute path="/plans" component={ReadingPlanPage} />
                    <WouterRoute path="/community" component={CommunityPage} />
                    <WouterRoute path="/activity" component={EditHistoryPage} />
                    <WouterRoute path="/journal" component={JournalPage} />
                    <WouterRoute path="/favourites" component={FavouritesPage} />
                    <WouterRoute path="/profile" component={ProfilePage} />
                    <WouterRoute path="/quiz" component={QuizPage} />
                    <WouterRoute path="/memory" component={MemoryPage} />
                    <WouterRoute path="/study-chains/:id?" component={StudyChainsPage} />
                    <WouterRoute path="/verse-image" component={VerseImagePage} />
                    <WouterRoute path="/prayers" component={PrayerPage} />
                    <WouterRoute path="/stats" component={StatsPage} />
                    <WouterRoute path="/characters/:id?" component={CharacterStudiesPage} />
                    <WouterRoute path="/drop/:id" component={DropPage} />
                    <WouterRoute component={NotFound} />
                </Switch>
            </WouterRouter>
        </div>
    );
}

function AppContent() {
    useCartSync();
    return (
        <>
            <Toaster />
            <Sonner />
            <CartDrawer />
            <Routes>
                {/* Lovable Routes */}
                <RouterRoute path="/" element={<Index />} />
                <RouterRoute path="/the-word" element={<TheWord />} />
                <RouterRoute path="/the-walk" element={<TheWalk />} />
                <RouterRoute path="/the-covenant" element={<TheCovenant />} />
                <RouterRoute path="/origin" element={<TheOrigin />} />
                <RouterRoute path="/mission-map" element={<MissionMap />} />
                <RouterRoute path="/collection" element={<TheCollection />} />
                <RouterRoute path="/wishlist" element={<Wishlist />} />

                {/* Legacy Bible App Routes - Handled by Wouter */}
                {/* We map specific legacy paths to render the BibleAppRouter */}
                <RouterRoute path="/read/*" element={<BibleAppRouter />} />
                <RouterRoute path="/plans/*" element={<BibleAppRouter />} />
                <RouterRoute path="/community/*" element={<BibleAppRouter />} />
                <RouterRoute path="/activity/*" element={<BibleAppRouter />} />
                <RouterRoute path="/journal/*" element={<BibleAppRouter />} />
                <RouterRoute path="/favourites/*" element={<BibleAppRouter />} />
                <RouterRoute path="/profile/*" element={<BibleAppRouter />} />
                <RouterRoute path="/quiz/*" element={<BibleAppRouter />} />
                <RouterRoute path="/memory/*" element={<BibleAppRouter />} />
                <RouterRoute path="/study-chains/*" element={<BibleAppRouter />} />
                <RouterRoute path="/verse-image/*" element={<BibleAppRouter />} />
                <RouterRoute path="/prayers/*" element={<BibleAppRouter />} />
                <RouterRoute path="/stats/*" element={<BibleAppRouter />} />
                <RouterRoute path="/characters/*" element={<BibleAppRouter />} />
                <RouterRoute path="/drop/*" element={<BibleAppRouter />} />

                {/* Catch-All */}
                <RouterRoute path="*" element={<NotFound />} />
            </Routes>
            <AccessibilityFilters />
        </>
    );
}

export default function App() {
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const parentDomain = import.meta.env.VITE_PARENT_DOMAIN || "http://localhost:3000";
            if (event.origin !== parentDomain) return;

            if (event.data?.type === 'AUTH_TOKEN_SYNC') {
                const token = event.data.token;
                if (token) {
                    sessionStorage.setItem('iframe_auth_token', token);
                    window.location.reload();
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <TooltipProvider>
            <AccessibilityProvider>
                <WishlistProvider>
                    <HashRouter>
                        <AppContent />
                    </HashRouter>
                </WishlistProvider>
            </AccessibilityProvider>
        </TooltipProvider>
    );
}


