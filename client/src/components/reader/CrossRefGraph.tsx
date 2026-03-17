import { useRef, useEffect, useMemo } from "react";

interface CrossRef {
    from_verse_id: number;
    to_verse_id: number;
    from_ref?: string;
    to_ref?: string;
    votes?: number;
}

interface Props {
    refs: CrossRef[];
    centerRef?: string;
    width?: number;
    height?: number;
}

/**
 * Canvas-based cross-reference network graph.
 * Renders a force-directed-style layout showing connections between verses.
 */
export default function CrossRefGraph({ refs, centerRef = "This Verse", width = 400, height = 320 }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const nodes = useMemo(() => {
        const nodeMap = new Map<string, { label: string; x: number; y: number; isCenter: boolean }>();

        // Center node
        nodeMap.set("center", { label: centerRef, x: width / 2, y: height / 2, isCenter: true });

        // Surrounding nodes in a circle
        const uniqueRefs = [...new Set(refs.map(r => r.to_ref || `Verse ${r.to_verse_id}`))];
        const count = uniqueRefs.length;
        const radius = Math.min(width, height) * 0.35;

        uniqueRefs.forEach((ref, i) => {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const jitter = (Math.random() - 0.5) * 20;
            nodeMap.set(ref, {
                label: ref,
                x: width / 2 + Math.cos(angle) * (radius + jitter),
                y: height / 2 + Math.sin(angle) * (radius + jitter),
                isCenter: false,
            });
        });

        return nodeMap;
    }, [refs, centerRef, width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = width * 2;
        canvas.height = height * 2;
        ctx.scale(2, 2);

        // Clear
        ctx.clearRect(0, 0, width, height);

        const isDark = document.documentElement.classList.contains("dark");
        const lineColor = isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(100, 116, 139, 0.15)";
        const nodeColor = isDark ? "rgba(99, 102, 241, 0.8)" : "rgba(79, 70, 229, 0.7)";
        const centerColor = isDark ? "rgba(236, 72, 153, 0.9)" : "rgba(219, 39, 119, 0.85)";
        const textColor = isDark ? "#e2e8f0" : "#1e293b";
        const labelColor = isDark ? "rgba(226, 232, 240, 0.8)" : "rgba(30, 41, 59, 0.7)";

        // Draw edges
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.5;
        const centerNode = nodes.get("center")!;
        for (const [key, node] of nodes) {
            if (key === "center") continue;
            ctx.beginPath();
            ctx.moveTo(centerNode.x, centerNode.y);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
        }

        // Draw nodes
        for (const [key, node] of nodes) {
            const r = node.isCenter ? 8 : 5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fillStyle = node.isCenter ? centerColor : nodeColor;
            ctx.fill();

            // Glow
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2);
            ctx.fillStyle = node.isCenter ? "rgba(236, 72, 153, 0.15)" : "rgba(99, 102, 241, 0.1)";
            ctx.fill();
        }

        // Draw labels
        ctx.font = "10px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        for (const [key, node] of nodes) {
            if (node.isCenter) {
                ctx.fillStyle = textColor;
                ctx.font = "bold 11px Inter, system-ui, sans-serif";
            } else {
                ctx.fillStyle = labelColor;
                ctx.font = "10px Inter, system-ui, sans-serif";
            }
            ctx.fillText(node.label, node.x, node.y + (node.isCenter ? -14 : 16));
        }
    }, [nodes, width, height]);

    if (refs.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
                No cross-references to visualize
            </div>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className="w-full"
            style={{ width, height, maxWidth: "100%" }}
        />
    );
}
