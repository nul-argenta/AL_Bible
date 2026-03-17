/**
 * Safe wrapper around Clerk's useAuth hook.
 * Returns dummy "signed out" values when Clerk is not configured,
 * preventing crashes in desktop/local mode.
 */
import { useAuth as clerkUseAuth } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const isClerkEnabled = PUBLISHABLE_KEY.length > 10 && !PUBLISHABLE_KEY.includes("placeholder");

const SIGNED_OUT_FALLBACK = {
    isSignedIn: false as const,
    getToken: async () => null,
    userId: null,
    isLoaded: true,
};

export function useSafeAuth() {
    // Priority 1: Iframe token bypass
    const iframeToken = typeof window !== 'undefined' ? sessionStorage.getItem('iframe_auth_token') : null;

    if (iframeToken) {
        return {
            isSignedIn: true as const,
            getToken: async () => iframeToken,
            userId: "iframe-user",
            isLoaded: true,
        };
    }

    if (isClerkEnabled) {
        // Safe to call — ClerkProvider is mounted
        return clerkUseAuth();
    }
    // No ClerkProvider — return static signed-out state
    return SIGNED_OUT_FALLBACK;
}
