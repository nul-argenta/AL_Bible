import { useState, useEffect } from "react";
import { Play, Pause, Square, Volume2, X, Settings2, Mic } from "lucide-react";
import { useAudioBible } from "@/hooks/useAudioBible";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
    text: string;
    title: string; // e.g., "Genesis 1"
    isOpen: boolean;
    onClose: () => void;
}

export function AudioPlayer({ text, title, isOpen, onClose }: AudioPlayerProps) {
    const {
        isPlaying,
        isPaused,
        voice,
        rate,
        voices,
        supported,
        play,
        pause,
        resume,
        stop,
        setVoice,
        setRate
    } = useAudioBible();

    // Auto-play when opened? Or wait for user?
    // Let's wait for user to click play efficiently, or auto-play if they clicked "Listen".
    // For now, manual play to ensure consistency.

    useEffect(() => {
        if (!isOpen) {
            stop();
        }
    }, [isOpen, stop]);

    if (!isOpen || !supported) return null;

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else if (isPaused) {
            resume();
        } else {
            play(text);
        }
    };

    const handleStop = () => {
        stop();
        // optionally close?
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl p-4 transition-colors duration-300 ease-in-out animate-fade-in-up">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">

                {/* Info */}
                <div className="flex items-center gap-3 w-1/4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Volume2 size={20} />
                    </div>
                    <div className="hidden sm:block">
                        <h4 className="font-bold text-sm">{title}</h4>
                        <p className="text-xs text-muted-foreground">{isPlaying ? "Playing..." : isPaused ? "Paused" : "Ready"}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 sm:gap-4 justify-center flex-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleStop}
                        className="text-muted-foreground hover:text-destructive"
                        title="Stop"
                    >
                        <Square size={16} fill="currentColor" />
                    </Button>

                    <Button
                        size="icon"
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg"
                        onClick={handlePlayPause}
                    >
                        {isPlaying ? (
                            <Pause size={20} fill="currentColor" />
                        ) : (
                            <Play size={20} fill="currentColor" className="ml-1" />
                        )}
                    </Button>

                    {/* Settings Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground" title="Audio Settings">
                                <Settings2 size={18} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 space-y-4" side="top">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Speed ({rate}x)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">0.5x</span>
                                    <Slider
                                        value={[rate]}
                                        min={0.5}
                                        max={2.0}
                                        step={0.1}
                                        onValueChange={([val]) => setRate(val)}
                                        className="flex-1"
                                    />
                                    <span className="text-xs">2x</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                    <Mic size={12} /> Voice
                                </label>
                                {voices.length > 0 ? (
                                    <Select
                                        value={voice?.name || ""}
                                        onValueChange={(val) => {
                                            const v = voices.find(vox => vox.name === val);
                                            if (v) setVoice(v);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Select Voice" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {voices
                                                .filter(v => v.lang.startsWith("en"))
                                                .map((v) => (
                                                    <SelectItem key={v.name} value={v.name} className="text-xs">
                                                        {v.name} ({v.lang})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-xs text-destructive">No voices found on this device.</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Close */}
                <div className="w-1/4 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
                        <X size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
