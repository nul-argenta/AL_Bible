import React, { createContext, useContext, useEffect, useState } from "react";

type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "grayscale";

interface AccessibilitySettings {
    zoomLevel: number; // 100 to 200
    highContrast: boolean;
    colorBlindMode: ColorBlindMode;
}

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
}

const defaultSettings: AccessibilitySettings = {
    zoomLevel: 100,
    highContrast: false,
    colorBlindMode: "none",
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        const saved = localStorage.getItem("armorlight-accessibility-settings");
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    const [isFullscreen, setIsFullscreen] = useState(false);

    // Persist settings
    useEffect(() => {
        localStorage.setItem("armorlight-accessibility-settings", JSON.stringify(settings));
        
        const root = window.document.documentElement;
        
        // Handle High Contrast
        if (settings.highContrast) {
            root.classList.add("high-contrast");
        } else {
            root.classList.remove("high-contrast");
        }

        // Handle Color Blindness
        root.classList.remove("protanopia", "deuteranopia", "tritanopia", "grayscale");
        if (settings.colorBlindMode !== "none") {
            root.classList.add(settings.colorBlindMode);
        }

        // Handle Zoom (CSS Variable and font-size)
        root.style.setProperty("--ui-zoom", `${settings.zoomLevel}%`);
        // We can also apply a base font size multiplier if needed
        // root.style.fontSize = `${settings.zoomLevel}%`;
    }, [settings]);

    // Handle Fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <AccessibilityContext.Provider value={{ settings, updateSettings, isFullscreen, toggleFullscreen }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error("useAccessibility must be used within an AccessibilityProvider");
    }
    return context;
}
