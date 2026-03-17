import { useState, useRef } from "react";
import { Download, Upload, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";

const STORAGE_KEYS = {
    HIGHLIGHTS: "armorlight_highlights",
    NOTES: "armorlight_notes",
    LINKS: "armorlight_user_links",
    READING_PROGRESS: "armorlight_reading_progress",
    GEMINI_KEY: "gemini_key",
    EDIT_HISTORY: "armorlight_edit_history",
    FAVOURITES: "armorlight_favourites",
};

export function DataSettings() {
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleExport = () => {
        try {
            const data: Record<string, any> = {
                version: 2,
                timestamp: Date.now(),
            };

            for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
                if (key === "GEMINI_KEY") {
                    data[key.toLowerCase()] = localStorage.getItem(storageKey) || "";
                } else {
                    const raw = localStorage.getItem(storageKey);
                    // EDIT_HISTORY is stored as an array; everything else is an object
                    const fallback = key === "EDIT_HISTORY" ? [] : {};
                    data[key.toLowerCase()] = raw ? JSON.parse(raw) : fallback;
                }
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `armorlight-session-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({ title: "Export Successful", description: "Your study data has been saved to a file." });
            setOpen(false);
        } catch (error) {
            console.error("Export failed:", error);
            toast({ variant: "destructive", title: "Export Failed", description: "Could not save data." });
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);

                // Basic validation
                if (!json.highlights && !json.notes && !json.links) {
                    throw new Error("Invalid format");
                }

                if (json.highlights) localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(json.highlights));
                if (json.notes) localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(json.notes));
                if (json.links) localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(json.links));
                if (json.reading_progress) localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(json.reading_progress));
                if (json.gemini_key) localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, json.gemini_key);
                if (json.edit_history) localStorage.setItem(STORAGE_KEYS.EDIT_HISTORY, JSON.stringify(json.edit_history));
                if (json.favourites) localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(json.favourites));

                // Force reload of queries
                queryClient.invalidateQueries();

                toast({ title: "Import Successful", description: "Your study data has been restored." });
                setOpen(false);

                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error("Import failed:", error);
                toast({ variant: "destructive", title: "Import Failed", description: "Invalid file format." });
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleReset = () => {
        if (!confirm("Are you sure? This will delete all your highlights, notes, favourites, activity history, and personal connections. This cannot be undone.")) return;

        for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
            if (key === "GEMINI_KEY") continue; // Keep API key on reset
            localStorage.removeItem(storageKey);
        }

        queryClient.invalidateQueries();
        toast({ title: "Data Reset", description: "All local study data has been cleared." });
        setOpen(false);
        setTimeout(() => window.location.reload(), 500);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" title="Data Settings">
                    <Settings size={16} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Data Management</h4>
                        <p className="text-sm text-muted-foreground">
                            Save or load your study session.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Button onClick={handleExport} variant="outline" className="justify-start gap-2">
                            <Download className="h-4 w-4" /> Export Configuration
                        </Button>

                        <div className="relative">
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full justify-start gap-2">
                                <Upload className="h-4 w-4" /> Import Configuration
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".json"
                                onChange={handleImport}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <Button onClick={handleReset} variant="destructive" size="sm" className="w-full justify-start gap-2">
                            <AlertTriangle className="h-4 w-4" /> Reset All Data
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
