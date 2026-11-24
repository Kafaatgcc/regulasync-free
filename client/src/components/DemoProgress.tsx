import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface DemoTimelineStep { title: string; duration: number }
export const DEMO_STEP_TIPS = [
  "Explore the homepage to understand how policies, compliance and audit records connect.",
  "Open an audit entry and inspect its linked hashes to understand how changes are detected.",
  "Review the gap analysis and recommendations. A person should check suggestions before acting.",
  "Explore regulatory updates and their source links, then review which policies may be affected.",
  "Use the dashboard to see compliance indicators, pending work and department-level activity.",
  "Read the founder profile and planned UK growth. This section describes future plans.",
  "Compare subscription plans and decide which capabilities your organisation needs.",
  "Share your questions, feedback or interest using the form below. You can stay here after the timer ends.",
];
export function locateDemoTime(steps: DemoTimelineStep[], seconds: number) {
  const total = steps.reduce((sum, step) => sum + step.duration, 0);
  let remaining = Math.max(0, Math.min(seconds, total - 1));
  for (let index = 0; index < steps.length; index++) {
    if (remaining < steps[index].duration) return { index, timeRemaining: steps[index].duration - remaining };
    remaining -= steps[index].duration;
  }
  return { index: steps.length - 1, timeRemaining: 1 };
}
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export default function DemoProgress({ steps, currentStep, elapsed, disabled, onSeek, onStep }: {
  steps: DemoTimelineStep[]; currentStep: number; elapsed: number; disabled: boolean;
  onSeek: (seconds: number) => void; onStep: (index: number) => void;
}) {
  const [draft, setDraft] = useState<number | null>(null);
  const total = steps.reduce((sum, step) => sum + step.duration, 0);
  return <div className="px-3 py-3 border-b bg-muted/20 space-y-2">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Step {currentStep + 1} of {steps.length}</span>
      <span>{time(draft ?? elapsed)} / {time(total)}</span>
    </div>
    <Slider aria-label="Demo timeline" min={0} max={total} step={1} value={[draft ?? elapsed]}
      disabled={disabled} onValueChange={([value]) => setDraft(value)}
      onValueCommit={([value]) => { onSeek(value); setDraft(null); }}
      aria-valuetext={`${time(draft ?? elapsed)} of ${time(total)}. Move to explore another part of the demo.`} />
    <div className="flex justify-between gap-1" aria-label="Demo steps">
      {steps.map((step, index) => <Tooltip key={step.title}>
        <TooltipTrigger asChild>
          <button type="button" aria-label={String(index + 1)} aria-current={currentStep === index ? "step" : undefined}
            disabled={disabled} onClick={() => onStep(index)}
            className={`h-7 min-w-0 flex-1 rounded-md text-xs font-semibold focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 ${currentStep === index ? "bg-primary text-primary-foreground" : index < currentStep ? "bg-primary/15 text-primary" : "bg-muted/60 hover:bg-muted"}`}>
            {index + 1}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-64 z-[70]">
          <p className="font-semibold">Step {index + 1}: {step.title}</p>
          <p className="mt-1">{DEMO_STEP_TIPS[index]}</p>
        </TooltipContent>
      </Tooltip>)}
    </div>
    <p className="text-[10px] text-muted-foreground">Drag the timeline or select a step. Seeking pauses the demo.</p>
  </div>;
}
