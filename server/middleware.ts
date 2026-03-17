/**
 * Shared server security & middleware utilities.
 * Extracted from routes.ts to avoid duplication across route modules.
 */

/** Strip HTML tags to prevent stored XSS */
export function sanitizeHtml(str: string): string {
    return str.replace(/<[^>]*>/g, "").trim();
}

/** Validate and parse an integer parameter, returns NaN if invalid */
export function validateInt(value: string | undefined): number {
    if (!value) return NaN;
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0 || !Number.isFinite(n)) return NaN;
    return n;
}

/** Maximum allowed community post length */
export const MAX_POST_LENGTH = 2000;

// ─── In-Memory Rate Limiter ──────────────────────────────────────────

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map<string, { count: number; expires: number }>();

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = requestCounts.get(ip);
    if (!record || record.expires < now) {
        requestCounts.set(ip, { count: 1, expires: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (record.count >= MAX_REQUESTS_PER_WINDOW) return false;
    record.count++;
    return true;
}

// ─── Guest User Helper ──────────────────────────────────────────────

import { getDb } from "./bible/reader";

/**
 * Ensure the Guest User (id=1) exists. Used by offline/local mode routes
 * where there is no real authentication.
 */
export function ensureGuestUser(): void {
    const db = getDb();
    const user = db.prepare("SELECT id FROM users WHERE id = 1").get();
    if (!user) {
        db.prepare(`
            INSERT INTO users (id, username, email, password_hash, display_name, role)
            VALUES (1, 'guest', 'guest@example.com', 'hash', 'Guest User', 'member')
        `).run();
    }
}

/** Set CSP headers for iframe embedding */
export function setCspHeaders(req: any, res: any, next: any): void {
    const parentDomain = process.env.VITE_PARENT_DOMAIN || "http://localhost:3000";
    res.setHeader("Content-Security-Policy", `frame-ancestors 'self' ${parentDomain}`);
    next();
}
