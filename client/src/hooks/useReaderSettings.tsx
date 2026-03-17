import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

type FontFamily = "sans" | "serif" | "dyslexic";
type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";
type LineSpacing = "tight" | "normal" | "loose";

interface ReaderSettings {
    fontFamily: FontFamily;
    fontSize: FontSize;
    lineSpacing: LineSpacing;
    redLetters: boolean;
}

interface ReaderSettingsContextType {
    settings: ReaderSettings;
    updateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

const defaultSettings: ReaderSettings = {
    fontFamily: "sans",
    fontSize: "base",
    lineSpacing: "normal",
    redLetters: true,
};

const ReaderSettingsContext = createContext<ReaderSettingsContextType | undefined>(undefined);

export function ReaderSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load from API (fall back to local storage then default)
    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await apiRequest("GET", "/api/settings");
                const cloudSettings = await res.json();

                if (cloudSettings) {
                    setSettings(cloudSettings);
                } else {
                    // Fallback to localStorage if no cloud settings found
                    const saved = localStorage.getItem("armorlight-reader-settings");
                    if (saved) setSettings(JSON.parse(saved));
                }
            } catch (err) {
                console.error("Failed to load reader settings from API", err);
                const saved = localStorage.getItem("armorlight-reader-settings");
                if (saved) setSettings(JSON.parse(saved));
            } finally {
                setIsLoaded(true);
            }
        }
        loadSettings();
    }, []);

    // Save to API and local storage on change
    const updateSettings = async (newSettings: Partial<ReaderSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // Sync to localStorage immediately for performance
        localStorage.setItem("armorlight-reader-settings", JSON.stringify(updated));

        // Background sync to API
        try {
            await apiRequest("POST", "/api/settings", updated);
        } catch (err) {
            console.error("Failed to sync settings to API", err);
        }
    };

    return (
        <ReaderSettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </ReaderSettingsContext.Provider>
    );
}

export function useReaderSettings() {
    const context = useContext(ReaderSettingsContext);
    if (!context) {
        throw new Error("useReaderSettings must be used within a ReaderSettingsProvider");
    }
    return context;
}
