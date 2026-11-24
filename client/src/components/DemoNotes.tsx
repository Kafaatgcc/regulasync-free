import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { GripVertical, PanelLeftClose, Maximize2 } from "lucide-react";

export default function DemoNotes({ title, notes, onDock }: { title: string; notes: string; onDock: () => void }) {
  const [position, setPosition] = useState({ x: Math.max(12, window.innerWidth - 390), y: 140 });
  const [size, setSize] = useState({ width: 350, height: 290 });
  const [opacity, setOpacity] = useState(80);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const operation = useRef<{ kind: "move" | "resize"; x: number; y: number; left: number; top: number; width: number; height: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const current = operation.current; if (!current) return;
      if (current.kind === "move") setPosition({ x: current.left + e.clientX - current.x, y: current.top + e.clientY - current.y });
      else setSize({ width: Math.max(260, current.width + e.clientX - current.x), height: Math.max(180, current.height + e.clientY - current.y) });
    };
    const stop = () => { operation.current = null; };
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop); window.addEventListener("pointercancel", stop); window.addEventListener("resize", resize);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); window.removeEventListener("resize", resize); };
  }, []);
  const width = Math.min(size.width, viewport.width - 24), height = Math.min(size.height, viewport.height - 24);
  const left = Math.max(12, Math.min(position.x, viewport.width - width - 12));
  const top = Math.max(12, Math.min(position.y, viewport.height - height - 12));
  return <div ref={panel} role="region" aria-label="Floating speaker notes" className="fixed z-[60] rounded-xl border shadow-xl flex flex-col overflow-hidden text-foreground"
    style={{ left, top, width, height, backgroundColor: `color-mix(in oklab, var(--background) ${opacity}%, transparent)` }}>
    <div className="p-3 border-b flex items-center justify-between touch-none cursor-move select-none" onPointerDown={e => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault(); operation.current = { kind: "move", x: e.clientX, y: e.clientY, left, top, width, height };
    }}>
      <div className="flex gap-2 items-center text-sm font-semibold"><GripVertical className="w-4 h-4" />Speaker notes</div>
      <Button size="icon" variant="ghost" aria-label="Dock speaker notes" onClick={onDock}><PanelLeftClose className="w-4 h-4" /></Button>
    </div>
    <div className="flex-1 overflow-y-auto p-4"><h4 className="font-semibold text-sm mb-2">{title}</h4><p className="text-sm leading-relaxed whitespace-pre-wrap">{notes}</p></div>
    <label className="border-t px-3 py-2 text-xs flex items-center gap-2">Background<input aria-label="Speaker notes background opacity" type="range" min={40} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="min-w-0 flex-1 accent-[var(--primary)]" /><span>{opacity}%</span></label>
    <button type="button" aria-label="Resize speaker notes" title="Drag to resize. Arrow keys also resize." className="absolute bottom-0 right-0 p-1 cursor-se-resize touch-none" onPointerDown={e => {
      e.preventDefault(); operation.current = { kind: "resize", x: e.clientX, y: e.clientY, left, top, width, height };
    }} onKeyDown={e => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault(); setSize(current => ({ width: Math.max(260, current.width + (e.key === "ArrowRight" ? 20 : e.key === "ArrowLeft" ? -20 : 0)), height: Math.max(180, current.height + (e.key === "ArrowDown" ? 20 : e.key === "ArrowUp" ? -20 : 0)) }));
    }}><Maximize2 className="w-3 h-3" /></button>
  </div>;
}
