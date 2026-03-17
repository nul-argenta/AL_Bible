import { useReaderSettings } from "@/hooks/useReaderSettings";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, Type, AlignLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export function ReaderSettingsMenu() {
    const { settings, updateSettings } = useReaderSettings();

    // Map Slider values 1-5 to Size strings
    const sizeMap: Record<number, "sm" | "base" | "lg" | "xl" | "2xl"> = {
        1: "sm",
        2: "base",
        3: "lg",
        4: "xl",
        5: "2xl"
    };

    const reverseSizeMap: Record<string, number> = {
        "sm": 1,
        "base": 2,
        "lg": 3,
        "xl": 4,
        "2xl": 5
    };

    const handleSizeChange = (val: number[]) => {
        const size = sizeMap[val[0]];
        if (size) updateSettings({ fontSize: size });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title="Reader Settings">
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Reader Settings</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Reading Environment</h4>
                        <p className="text-sm text-muted-foreground">
                            Customize your display settings.
                        </p>
                    </div>

                    {/* Font Family Selection */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2"><Type size={16} /> Font Style</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={settings.fontFamily === "sans" ? "default" : "outline"}
                                size="sm"
                                className="font-sans"
                                onClick={() => updateSettings({ fontFamily: "sans" })}
                            >
                                Sans
                            </Button>
                            <Button
                                variant={settings.fontFamily === "serif" ? "default" : "outline"}
                                size="sm"
                                className="font-serif"
                                onClick={() => updateSettings({ fontFamily: "serif" })}
                            >
                                Serif
                            </Button>
                            <Button
                                variant={settings.fontFamily === "dyslexic" ? "default" : "outline"}
                                size="sm"
                                // Use inline style strictly for this button demo if the tailwind class isn't mapped
                                style={{ fontFamily: "Atkinson Hyperlegible, sans-serif" }}
                                onClick={() => updateSettings({ fontFamily: "dyslexic" })}
                            >
                                Dyslexic
                            </Button>
                        </div>
                    </div>

                    {/* Font Size Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>Text Size</Label>
                            <span className="text-xs text-muted-foreground uppercase">{settings.fontSize}</span>
                        </div>
                        <div className="px-2">
                            <Slider
                                defaultValue={[reverseSizeMap[settings.fontSize] || 2]}
                                value={[reverseSizeMap[settings.fontSize] || 2]}
                                max={5}
                                min={1}
                                step={1}
                                onValueChange={handleSizeChange}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-2">
                            <span>A</span>
                            <span className="text-lg font-bold">A</span>
                        </div>
                    </div>

                    {/* Line Spacing */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2"><AlignLeft size={16} /> Spacing</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={settings.lineSpacing === "tight" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSettings({ lineSpacing: "tight" })}
                            >
                                Tight
                            </Button>
                            <Button
                                variant={settings.lineSpacing === "normal" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSettings({ lineSpacing: "normal" })}
                            >
                                Normal
                            </Button>
                            <Button
                                variant={settings.lineSpacing === "loose" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSettings({ lineSpacing: "loose" })}
                            >
                                Loose
                            </Button>
                        </div>
                    </div>

                    {/* Red Letter Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="space-y-0.5">
                            <Label>Red Letters</Label>
                            <p className="text-xs text-muted-foreground">Words of Christ in red</p>
                        </div>
                        <Switch
                            checked={settings.redLetters}
                            onCheckedChange={(checked: boolean) => updateSettings({ redLetters: checked })}
                        />
                    </div>

                </div>
            </PopoverContent>
        </Popover>
    );
}
