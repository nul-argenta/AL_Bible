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
import { useAccessibility } from "@/hooks/useAccessibility";
import { 
    Maximize, 
    Minimize, 
    Eye, 
    Contrast, 
    ZoomIn,
    Check
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ReaderSettingsMenu() {
    const { settings, updateSettings } = useReaderSettings();
    const { 
        settings: accSettings, 
        updateSettings: updateAccSettings, 
        isFullscreen, 
        toggleFullscreen 
    } = useAccessibility();

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

                    {/* ─── ACCESSIBILITY SECTION ────────────────────────── */}
                    <div className="pt-4 border-t space-y-4">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                            <Eye size={16} /> Accessibility
                        </h4>

                        {/* Fullscreen Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Fullscreen Mode</Label>
                                <p className="text-xs text-muted-foreground">Immersive reading</p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={toggleFullscreen}
                                className="gap-2"
                            >
                                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                                {isFullscreen ? "Exit" : "Enter"}
                            </Button>
                        </div>

                        {/* High Contrast */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    <Contrast size={14} /> High Contrast
                                </Label>
                                <p className="text-xs text-muted-foreground">OLED black & white</p>
                            </div>
                            <Switch
                                checked={accSettings.highContrast}
                                onCheckedChange={(checked: boolean) => updateAccSettings({ highContrast: checked })}
                            />
                        </div>

                        {/* Color Blindness */}
                        <div className="space-y-2">
                            <Label className="text-xs">Color Blindness Mode</Label>
                            <Select 
                                value={accSettings.colorBlindMode} 
                                onValueChange={(val: any) => updateAccSettings({ colorBlindMode: val })}
                            >
                                <SelectTrigger className="w-full h-8 text-xs">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Default)</SelectItem>
                                    <SelectItem value="protanopia">Protanopia (Red blind)</SelectItem>
                                    <SelectItem value="deuteranopia">Deuteranopia (Green blind)</SelectItem>
                                    <SelectItem value="tritanopia">Tritanopia (Blue blind)</SelectItem>
                                    <SelectItem value="grayscale">Grayscale</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Interface Zoom */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2">
                                    <ZoomIn size={14} /> Interface Zoom
                                </Label>
                                <span className="text-xs text-muted-foreground">{accSettings.zoomLevel}%</span>
                            </div>
                            <Slider
                                defaultValue={[accSettings.zoomLevel]}
                                max={150}
                                min={100}
                                step={10}
                                onValueChange={(val) => updateAccSettings({ zoomLevel: val[0] })}
                            />
                        </div>
                    </div>

                </div>
            </PopoverContent>
        </Popover>
    );
}
