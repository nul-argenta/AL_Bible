import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";
import { ClerkProvider } from "@clerk/clerk-react";
import { ReaderSettingsProvider } from "./hooks/useReaderSettings";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const isClerkEnabled = PUBLISHABLE_KEY.length > 10 && !PUBLISHABLE_KEY.includes("placeholder");

function AuthWrapper({ children }: { children: React.ReactNode }) {
    if (isClerkEnabled) {
        return <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">{children}</ClerkProvider>;
    }
    return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthWrapper>
            <ThemeProvider defaultTheme="system" storageKey="armorlight-ui-theme">
                <ReaderSettingsProvider>
                    <QueryClientProvider client={queryClient}>
                        <App />
                    </QueryClientProvider>
                </ReaderSettingsProvider>
            </ThemeProvider>
        </AuthWrapper>
    </StrictMode>
);

// ─── PWA Service Worker Registration ────────────────────────────────
if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => console.log("✅ SW registered:", reg.scope))
            .catch((err) => console.warn("⚠️ SW registration failed:", err));
    });
}
