import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DemoProgress, { DEMO_STEP_TIPS, locateDemoTime } from '@/components/DemoProgress';
import DemoFeedback from '@/components/DemoFeedback';
import DemoNotes from '@/components/DemoNotes';
import { PanelRightOpen } from 'lucide-react';
import {
  Play, Pause, SkipForward, SkipBack, X,
  Monitor, ChevronRight, ChevronLeft, Clock, GripVertical,
  Minimize2, Maximize2, ChevronDown, ChevronUp,
  Shield, Hash, Brain, FileText, Users, Briefcase, Target
} from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { prepareDemoPresentation, DEMO_RENEWAL_ERROR } from '@/lib/demoSession';
import { PRESENTATION_START_EVENT, PRESENTATION_STOP_EVENT } from '@/lib/presentation';
import { toast } from 'sonner';

interface PresentationStep {
  id: number;
  title: string;
  subtitle: string;
  route: string;
  duration: number;
  keyPoints: string[];
  speakerNotes: string;
  innovation?: string;
  icon: typeof Shield;
}

// Eight-minute guided platform walkthrough with onboarding and inquiry capture
const presentationSteps: PresentationStep[] = [
  {
    id: 1,
    title: "RegulaSync Overview",
    subtitle: "AI-Powered Regulatory Compliance Platform",
    route: "/landing",
    duration: 45,
    icon: Target,
    keyPoints: [
      "Pre-launch governance automation prototype",
      "Two core innovations: SVAC + AI Regulatory Sync",
      "Target: UK financial services sector"
    ],
    speakerNotes: "RegulaSync is a pre-launch governance automation prototype, targeting launch in Q2 2027. This guided assessment uses illustrative examples, not customer results or proof of compliance. We are developing SVAC and AI Regulatory Sync."
  },
  {
    id: 2,
    title: "Innovation #1: SVAC",
    subtitle: "Self-Validating Audit Cache",
    route: "/audit-trail",
    duration: 75,
    icon: Hash,
    innovation: "CORE INNOVATION",
    keyPoints: [
      "SHA-256 cryptographic hash chain",
      "Blockchain-inspired tamper detection",
      "Demonstrated integrity checks",
      "Tamper-evident audit design"
    ],
    speakerNotes: "Our first core innovation is the Self-Validating Audit Cache. Each audit entry is cryptographically hashed using SHA-256 and linked to the previous entry. This demonstrates a tamper-evident design. Integrity checks do not constitute regulator approval, certification, or a guarantee that every possible modification will be detected."
  },
  {
    id: 3,
    title: "Innovation #2: AI Regulatory Sync",
    subtitle: "Automated Policy Gap Analysis",
    route: "/gap-analysis",
    duration: 75,
    icon: Brain,
    innovation: "CORE INNOVATION",
    keyPoints: [
      "LLM-powered regulatory analysis",
      "Automatic gap detection",
      "Policy-to-regulation matching",
      "Prioritized recommendations"
    ],
    speakerNotes: "Our second core innovation uses Large Language Models to automatically analyze regulatory updates and compare them against company policies. When FCA, PRA, or ICO publish new requirements, RegulaSync identifies gaps and generates prioritized remediation recommendations."
  },
  {
    id: 4,
    title: "Live Regulatory Feeds",
    subtitle: "Real-time UK Regulatory Updates",
    route: "/regulatory-updates",
    duration: 55,
    icon: FileText,
    keyPoints: [
      "Public-source regulatory feed prototype",
      "Live RSS feed monitoring",
      "Illustrative impact assessment",
      "Illustrative deadline tracking"
    ],
    speakerNotes: "The prototype can display public regulatory feeds alongside illustrative examples. This is not a direct regulator reporting integration. Example deadlines are not statutory requirements; source documents and professional review remain necessary."
  },
  {
    id: 5,
    title: "Compliance Dashboard",
    subtitle: "Executive Visibility & Control",
    route: "/dashboard",
    duration: 55,
    icon: Shield,
    keyPoints: [
      "Illustrative compliance scores",
      "Department-level tracking",
      "Risk indicators",
      "One-click reporting"
    ],
    speakerNotes: "The dashboard demonstrates governance visibility using illustrative scores and examples. It is not an independent assessment of actual legal compliance. Review the report prototype and editable workflows."
  },
  {
    id: 6,
    title: "UK Job Creation",
    subtitle: "Economic Impact & Growth Plan",
    route: "/about",
    duration: 50,
    icon: Users,
    keyPoints: [
      "Indicative Year 1 team: 6",
      "Indicative Year 2 team: 8",
      "Indicative Year 3 team: 13",
      "Proposed UK operations"
    ],
    speakerNotes: "RegulaSync is pre-launch. The indicative staffing plan is 6 people in Year 1, 8 in Year 2 and 13 in Year 3, subject to funding, product progress and demand. These figures are forecasts, not current employees or confirmed vacancies. Working arrangements are to be confirmed."
  },
  {
    id: 7,
    title: "Transparent Per-User Pricing",
    subtitle: "Three Proposed Subscription Tiers",
    route: "/pricing",
    duration: 65,
    icon: Briefcase,
    keyPoints: [
      "Core: £90 per user/month",
      "Professional: £175 per user/month",
      "Enterprise: £350 per user/month",
      "Licences priced per user, not per organisation"
    ],
    speakerNotes: "Our proposed three-tier pricing is Core £90, Professional £175 and Enterprise £350 per user per month. Multiply the selected rate by licensed users to calculate subscription cost. There are no included-user organisation bundles. The ROI calculator shows editable assumptions, implementation and training costs, and can correctly show no payback."
  },
  {
    id: 8,
    title: "Thank You",
    subtitle: "Ready to Transform UK Compliance",
    route: "/contact",
    duration: 60,
    icon: Target,
    keyPoints: [
      "Q2 2027 launch",
      "Early access partners welcome",
      "Contact: bhousen@regulasync.co.uk"
    ],
    speakerNotes: "Thank you for your time. RegulaSync targets launch in Q2 2027, and we're accepting early access partners. We believe our two core innovations - SVAC and AI Regulatory Sync - represent genuine advances in compliance technology. I'm happy to answer any questions."
  }
];

export default function PresentationMode() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(presentationSteps[0].duration);
  const [showNotes, setShowNotes] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [notesDetached, setNotesDetached] = useState(false);
  const [panelOpacity, setPanelOpacity] = useState(88);
  const [completed, setCompleted] = useState(false);
  const [location, setLocation] = useLocation();
  const returnRoute = useRef("/dashboard");
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 30_000 });
  const { mutateAsync: renewDemo } = trpc.passwordAuth.renewDemoSession.useMutation();
  const sessionFlight = useRef<Promise<unknown> | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const prepareSession = useCallback(() => {
    if (sessionFlight.current) return sessionFlight.current;
    const operation = localStorage.getItem('demoMode') === 'true'
      ? prepareDemoPresentation({
          cancelAuth: () => utils.auth.me.cancel(),
          renew: () => renewDemo(),
          invalidateAuth: () => utils.auth.me.invalidate(undefined, { refetchType: 'none' }),
          readUser: () => utils.auth.me.fetch(undefined, { staleTime: 0 }),
        })
      : utils.auth.me.fetch(undefined, { staleTime: 0 }).then(user => {
          if (!user) throw new Error('Please sign in before opening the platform demo.');
          return user;
        });
    sessionFlight.current = operation.finally(() => { sessionFlight.current = null; });
    return sessionFlight.current;
  }, [utils, renewDemo]);
  const showSessionError = useCallback(() => {
    setIsPaused(true);
    toast.error(DEMO_RENEWAL_ERROR, { action: { label: 'Re-enter access', onClick: () => window.location.assign('/') } });
  }, []);


  // Position and size state for dragging and resizing
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [size, setSize] = useState({ width: 360, height: 580 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const panelWidth = Math.min(size.width, viewport.width - 24);
  const panelHeight = Math.min(size.height, viewport.height - 24);
  const panelLeft = Math.max(12, Math.min(position.x, viewport.width - panelWidth - 12));
  const panelTop = Math.max(12, Math.min(position.y, viewport.height - (isMinimized ? 60 : panelHeight) - 12));

  const panelRef = useRef<HTMLDivElement>(null);

  const totalDuration = presentationSteps.reduce((acc, step) => acc + step.duration, 0);
  const elapsedDuration = presentationSteps.slice(0, currentStep).reduce((acc, step) => acc + step.duration, 0) + (presentationSteps[currentStep].duration - timeRemaining);

  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // Verify or renew the session before each guided route transition.
  useEffect(() => {
    if (!pendingRoute) return;
    let cancelled = false;
    prepareSession().then(() => {
      if (!cancelled) { setLocation(pendingRoute); setPendingRoute(null); }
    }).catch(() => {
      if (!cancelled) { setPendingRoute(null); showSessionError(); }
    });
    return () => { cancelled = true; };
  }, [pendingRoute, setLocation, prepareSession, showSessionError]);

  // Dragging logic
  useEffect(() => {
    const handleMouseMove = (e: PointerEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - (isMinimized ? 60 : size.height);
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
      if (isResizing) {
        const newWidth = Math.max(280, Math.min(window.innerWidth - position.x - 12, e.clientX - position.x));
        const newHeight = Math.max(320, Math.min(window.innerHeight - position.y - 12, e.clientY - position.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('pointermove', handleMouseMove);
      document.addEventListener('pointerup', handleMouseUp);
      document.addEventListener('pointercancel', handleMouseUp);
      return () => {
        document.removeEventListener('pointermove', handleMouseMove);
        document.removeEventListener('pointerup', handleMouseUp);
        document.removeEventListener('pointercancel', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, position, size, isMinimized]);

  const handleDragStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsResizing(true);
  };

  const startFlight = useRef(false);
  const startPresentation = useCallback(async () => {
    if (startFlight.current) return;
    startFlight.current = true;
    setIsStarting(true);
    try {
      await prepareSession();
      returnRoute.current = location;
      setIsActive(true); setIsPaused(false); setIsMinimized(false); setCompleted(false); setNotesDetached(false);
      setCurrentStep(0); setTimeRemaining(presentationSteps[0].duration);
      setPendingRoute(presentationSteps[0].route);
    } catch { showSessionError(); }
    finally { startFlight.current = false; setIsStarting(false); }
  }, [location, prepareSession, showSessionError]);
  useEffect(() => {
    const handler = () => void startPresentation();
    window.addEventListener(PRESENTATION_START_EVENT, handler);
    return () => window.removeEventListener(PRESENTATION_START_EVENT, handler);
  }, [startPresentation]);

  const stopPresentation = useCallback(() => {
    setIsActive(false);
    setCompleted(false);
    setNotesDetached(false);
    setIsPaused(false);
    setCurrentStep(0);
    setTimeRemaining(presentationSteps[0].duration);
    setPendingRoute(null);
    setLocation(returnRoute.current);
  }, [setLocation]);

  useEffect(() => {
    const handler = () => { setIsActive(false); setPendingRoute(null); setIsPaused(false); };
    window.addEventListener(PRESENTATION_STOP_EVENT, handler);
    return () => window.removeEventListener(PRESENTATION_STOP_EVENT, handler);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < presentationSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setTimeRemaining(presentationSteps[newStep].duration);
      setPendingRoute(presentationSteps[newStep].route);
    } else {
      setCompleted(true);
      setIsPaused(true);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCompleted(false);
      setIsPaused(true);
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setTimeRemaining(presentationSteps[newStep].duration);
      setPendingRoute(presentationSteps[newStep].route);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    setCompleted(false);
    setIsPaused(true);
    setCurrentStep(stepIndex);
    setTimeRemaining(presentationSteps[stepIndex].duration);
    setPendingRoute(presentationSteps[stepIndex].route);
  }, []);

  const seekDemo = useCallback((seconds: number) => {
    const target = locateDemoTime(presentationSteps, seconds);
    setCompleted(false); setIsPaused(true); setCurrentStep(target.index);
    setTimeRemaining(target.timeRemaining); setPendingRoute(presentationSteps[target.index].route);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (!isActive || isPaused || pendingRoute || completed) return;

    if (timeRemaining <= 0) {
      nextStep();
      return;
    }
    // Only the countdown is updated here; route/step changes run in the effect,
    // never as side effects inside a React state updater.
    const timer = setTimeout(() => setTimeRemaining(prev => Math.max(0, prev - 1)), 1000);
    return () => clearTimeout(timer);
  }, [isActive, isPaused, timeRemaining, nextStep, pendingRoute, completed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const step = presentationSteps[currentStep];
  const StepIcon = step.icon;

  // Floating start button when not active
  if (!isActive) {
    if (!user || ["/", "/home", "/landing", "/login", "/about", "/pricing", "/contact"].includes(location)) return null;
    return (
      <div className="fixed bottom-6 right-20 sm:right-24 z-40">
        <Button
          onClick={() => void startPresentation()}
          disabled={isStarting}
          size="lg"
          className="bg-gradient-to-r from-navy to-copper text-white shadow-2xl hover:shadow-copper/30 transition-all duration-300 gap-2 px-4 sm:px-6 py-6 rounded-full"
        >
          <Monitor className="w-5 h-5" />
          <span className="font-semibold">8-Min Demo</span>
          <Play className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Minimized view
  if (isMinimized) {
    return (
      <div
        ref={panelRef}
        className="fixed z-50 bg-background/95 backdrop-blur-md border rounded-lg shadow-2xl"
        style={{ left: panelLeft, top: panelTop, width: panelWidth }}
      >
        <div
          className="flex items-center justify-between p-3 cursor-move touch-none select-none"
          onPointerDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {currentStep + 1}/{presentationSteps.length}
            </Badge>
            <span className="text-sm font-medium truncate max-w-[150px]">{step.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button aria-label="Expand demo" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsMinimized(false)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button aria-label="Close demo" size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={stopPresentation}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full presentation panel
  return (
    <>
    {showNotes && notesDetached && <DemoNotes title={step.title} notes={step.speakerNotes} onDock={() => setNotesDetached(false)} />}
    <div
      ref={panelRef}
      className="fixed z-50 text-foreground border rounded-xl shadow-2xl flex flex-col overflow-hidden"
      style={{
        left: panelLeft,
        top: panelTop,
        width: panelWidth,
        height: panelHeight,
        backgroundColor: `color-mix(in oklab, var(--background) ${panelOpacity}%, transparent)`
      }}
    >
      {/* Header - Draggable */}
      <div
        className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-navy/10 to-copper/10 cursor-move touch-none select-none"
        onPointerDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <Monitor className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">8-Minute Guided Demo</span>
        </div>
        <div className="flex items-center gap-1">
          <Button aria-label="Minimize demo" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button aria-label="Close demo" size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-100" onClick={stopPresentation}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <DemoProgress steps={presentationSteps} currentStep={currentStep} elapsed={completed ? totalDuration : elapsedDuration}
        disabled={!!pendingRoute} onSeek={seekDemo} onStep={goToStep} />

      {/* Current Step */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <StepIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {step.innovation && (
              <Badge className="mb-1 bg-amber-500 text-white text-[10px]">{step.innovation}</Badge>
            )}
            <h3 className="font-bold text-base leading-tight">{step.title}</h3>
            <p className="text-xs text-muted-foreground">{step.subtitle}</p>
            {completed && <Badge className="mt-1">Demo complete</Badge>}
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-mono font-bold text-primary">{formatTime(timeRemaining)}</div>
            <div className="text-[10px] text-muted-foreground">remaining</div>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div role="note" className="rounded-lg bg-primary/10 p-3 text-xs leading-relaxed"><strong>Try this: </strong>{DEMO_STEP_TIPS[currentStep]}</div>
          {currentStep === presentationSteps.length - 1 && <DemoFeedback onEditing={() => setIsPaused(true)} />}
          {/* Key Points */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Points</h4>
            <ul className="space-y-1.5">
              {step.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Speaker Notes */}
          {showNotes && !notesDetached && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between gap-2 mb-2"><h4 className="text-xs font-semibold uppercase text-muted-foreground">Speaker Notes</h4><Button aria-label="Detach speaker notes" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setNotesDetached(true)}><PanelRightOpen className="w-3 h-3 mr-1" />Float notes</Button></div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.speakerNotes}</p>
            </div>
          )}
        </div>
      </div>

      <label className="px-3 py-2 border-t flex items-center gap-2 text-[10px]">Panel background
        <input aria-label="Demo panel background opacity" type="range" min={40} max={100} value={panelOpacity}
          onChange={event => setPanelOpacity(Number(event.target.value))} className="min-w-0 flex-1" /><span>{panelOpacity}%</span>
      </label>

      {/* Controls */}
      <div className="p-3 border-t flex items-center justify-between">
        <Button aria-label="Previous demo step" size="sm" variant="outline" onClick={prevStep} disabled={currentStep === 0 || !!pendingRoute}>
          <SkipBack className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPaused ? "default" : "outline"}
            aria-label={completed ? "Replay demo" : isPaused ? "Resume demo" : "Pause demo"}
            onClick={() => { if (completed) goToStep(0); else setIsPaused(!isPaused); }}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs"
          >
            {showNotes ? 'Hide' : 'Show'} Notes
          </Button>
        </div>

        <Button aria-label="Next demo step" size="sm" variant="outline" onClick={nextStep} disabled={currentStep === presentationSteps.length - 1 || !!pendingRoute}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Resize Handle */}
      <div
        role="button" tabIndex={0} aria-label="Resize demo panel"
        onKeyDown={e => { if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) { e.preventDefault(); setSize(current => ({ width: Math.max(280, current.width + (e.key === "ArrowRight" ? 20 : e.key === "ArrowLeft" ? -20 : 0)), height: Math.max(320, current.height + (e.key === "ArrowDown" ? 20 : e.key === "ArrowUp" ? -20 : 0)) })); } }}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize touch-none"
        onPointerDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-muted-foreground/30" />
      </div>
    </div>
    </>
  );
}
