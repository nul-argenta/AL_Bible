import { Link } from "wouter";
import { Feather, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppHeaderProps {
    /** Page title shown in the center. Omit for default "Armor & Light" branding. */
    title?: string;
    /** Right side content slot (e.g. extra buttons). ThemeToggle is always included. */
    rightSlot?: React.ReactNode;
    /** Override the default back-link destination. Defaults to "/" */
    backTo?: string;
    /** Show the Feather logo. Defaults to true. */
    showLogo?: boolean;
}

/**
 * Shared sticky app header used across all internal pages.
 * Provides consistent branding, back navigation, and theme toggle.
 */
export function AppHeader({ title, rightSlot, backTo = "/", showLogo = true }: AppHeaderProps) {
    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md shadow-sm">
            <Link href={backTo} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                {showLogo && <Feather size={18} />}
                <span className="hidden sm:inline font-serif">Armor &amp; Light</span>
            </Link>

            {title && (
                <h1 className="font-semibold text-lg">{title}</h1>
            )}

            <div className="flex items-center gap-2">
                {rightSlot}
                <ThemeToggle />
            </div>
        </header>
    );
}
