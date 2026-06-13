import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, SkipForward, SkipBack, X, 
  Monitor, ChevronRight, ChevronLeft, Clock, GripVertical,
  Minimize2, Maximize2, ChevronDown, ChevronUp,
  Shield, Hash, Brain, FileText, Users, Briefcase, Target
} from 'lucide-react';
import { useLocation } from 'wouter';

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

// Optimized 5-minute presentation focused on core innovations
const presentationSteps: PresentationStep[] = [
  {
    id: 1,
    title: "RegulaSync Overview",
    subtitle: "AI-Powered Regulatory Compliance Platform",
    route: "/home",
    duration: 30,
    icon: Target,
    keyPoints: [
      "Solving £2.8B UK compliance cost problem",
      "Two core innovations: SVAC + AI Regulatory Sync",
      "Target: UK financial services sector"
    ],
    speakerNotes: "RegulaSync addresses the £2.8 billion annual compliance cost burden for UK financial services. Our platform features two core innovations that differentiate us from competitors."
  },
  {
    id: 2,
    title: "Innovation #1: SVAC",
    subtitle: "Self-Validating Audit Cache",
    route: "/audit-trail",
    duration: 60,
    icon: Hash,
    innovation: "CORE INNOVATION",
    keyPoints: [
      "SHA-256 cryptographic hash chain",
      "Blockchain-inspired tamper detection",
      "Instant verification for regulators",
      "Immutable audit trail"
    ],
    speakerNotes: "Our first core innovation is the Self-Validating Audit Cache. Each audit entry is cryptographically hashed using SHA-256 and linked to the previous entry. This creates an immutable, tamper-evident chain that regulators can verify instantly. Any modification to historical records is immediately detectable."
  },
  {
    id: 3,
    title: "Innovation #2: AI Regulatory Sync",
    subtitle: "Automated Policy Gap Analysis",
    route: "/gap-analysis",
    duration: 60,
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
    duration: 40,
    icon: FileText,
    keyPoints: [
      "FCA, PRA, BOE, ICO integration",
      "Live RSS feed monitoring",
      "Automatic impact assessment",
      "Deadline tracking"
    ],
    speakerNotes: "RegulaSync connects to live regulatory feeds from all major UK regulators. When new guidance is published, our AI automatically assesses the impact on your organization and tracks compliance deadlines."
  },
  {
    id: 5,
    title: "Compliance Dashboard",
    subtitle: "Executive Visibility & Control",
    route: "/dashboard",
    duration: 40,
    icon: Shield,
    keyPoints: [
      "Real-time compliance scores",
      "Department-level tracking",
      "Risk indicators",
      "One-click reporting"
    ],
    speakerNotes: "The executive dashboard provides instant visibility into organizational compliance. Track scores by department, monitor risk indicators, and generate board-ready reports with a single click."
  },
  {
    id: 6,
    title: "UK Job Creation",
    subtitle: "Economic Impact & Growth Plan",
    route: "/about",
    duration: 30,
    icon: Users,
    keyPoints: [
      "Year 1: 6 UK employees",
      "Year 2: 8 UK employees", 
      "Year 3: 13 UK employees",
      "London HQ operations"
    ],
    speakerNotes: "RegulaSync is committed to creating skilled UK jobs. Our growth plan includes hiring 6 employees in Year 1, growing to 13 by Year 3. All positions will be based at our London headquarters, contributing to the UK tech ecosystem."
  },
  {
    id: 7,
    title: "Market Opportunity",
    subtitle: "£2.8B TAM in UK Financial Services",
    route: "/pricing",
    duration: 40,
    icon: Briefcase,
    keyPoints: [
      "TAM: £2.8B UK compliance market",
      "SAM: £420M mid-market segment",
      "SOM: £42M achievable in 5 years",
      "4-tier SaaS subscription model"
    ],
    speakerNotes: "The UK regulatory compliance market represents a £2.8 billion opportunity. We're targeting the underserved mid-market segment with a 4-tier SaaS subscription model ranging from £19 to £199 per user per month."
  },
  {
    id: 8,
    title: "Thank You",
    subtitle: "Ready to Transform UK Compliance",
    route: "/contact",
    duration: 20,
    icon: Target,
    keyPoints: [
      "Q2 2026 launch",
      "Early access partners welcome",
      "Contact: hello@regulasync.co.uk"
    ],
    speakerNotes: "Thank you for your time. RegulaSync launches Q2 2026, and we're accepting early access partners. We believe our two core innovations - SVAC and AI Regulatory Sync - represent genuine advances in compliance technology. I'm happy to answer any questions."
  }
];

export default function PresentationMode() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(presentationSteps[0].duration);
  const [showNotes, setShowNotes] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [, setLocation] = useLocation();

  // Position and size state for dragging and resizing
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [size, setSize] = useState({ width: 360, height: 580 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const panelRef = useRef<HTMLDivElement>(null);

  const totalDuration = presentationSteps.reduce((acc, step) => acc + step.duration, 0);
  const elapsedDuration = presentationSteps.slice(0, currentStep).reduce((acc, step) => acc + step.duration, 0) + (presentationSteps[currentStep].duration - timeRemaining);

  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // Handle navigation in useEffect
  useEffect(() => {
    if (pendingRoute) {
      setLocation(pendingRoute);
      setPendingRoute(null);
    }
  }, [pendingRoute, setLocation]);

  // Dragging logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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
        const newWidth = Math.max(320, Math.min(500, e.clientX - position.x));
        const newHeight = Math.max(400, Math.min(window.innerHeight - 100, e.clientY - position.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, position, size, isMinimized]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const startPresentation = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setCurrentStep(0);
    setTimeRemaining(presentationSteps[0].duration);
    setPendingRoute(presentationSteps[0].route);
  }, []);

  const stopPresentation = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentStep(0);
    setTimeRemaining(presentationSteps[0].duration);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < presentationSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setTimeRemaining(presentationSteps[newStep].duration);
      setPendingRoute(presentationSteps[newStep].route);
    } else {
      stopPresentation();
    }
  }, [currentStep, stopPresentation]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setTimeRemaining(presentationSteps[newStep].duration);
      setPendingRoute(presentationSteps[newStep].route);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
    setTimeRemaining(presentationSteps[stepIndex].duration);
    setPendingRoute(presentationSteps[stepIndex].route);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (!isActive || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          nextStep();
          return presentationSteps[Math.min(currentStep + 1, presentationSteps.length - 1)].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, currentStep, nextStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const step = presentationSteps[currentStep];
  const StepIcon = step.icon;

  // Floating start button when not active
  if (!isActive) {
    return (
      <div className="fixed bottom-6 right-24 z-40">
        <Button
          onClick={startPresentation}
          size="lg"
          className="bg-gradient-to-r from-navy to-copper text-white shadow-2xl hover:shadow-copper/30 transition-all duration-300 gap-2 px-6 py-6 rounded-full"
        >
          <Monitor className="w-5 h-5" />
          <span className="font-semibold">5-Min Demo</span>
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
        style={{ left: position.x, top: position.y, width: size.width }}
      >
        <div 
          className="flex items-center justify-between p-3 cursor-move"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {currentStep + 1}/{presentationSteps.length}
            </Badge>
            <span className="text-sm font-medium truncate max-w-[150px]">{step.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsMinimized(false)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={stopPresentation}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full presentation panel
  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-background/95 backdrop-blur-md border rounded-xl shadow-2xl flex flex-col overflow-hidden"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: size.width, 
        height: size.height 
      }}
    >
      {/* Header - Draggable */}
      <div 
        className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-navy/10 to-copper/10 cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <Monitor className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">5-Minute Demo</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-100" onClick={stopPresentation}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{formatTime(elapsedDuration)} / {formatTime(totalDuration)}</span>
        </div>
        <Progress value={(elapsedDuration / totalDuration) * 100} className="h-1.5" />
      </div>

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
          {showNotes && (
            <div className="pt-3 border-t">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Speaker Notes</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.speakerNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="p-2 border-t bg-muted/30">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {presentationSteps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToStep(i)}
              className={`shrink-0 w-8 h-8 rounded-md text-xs font-medium transition-all ${
                i === currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : i < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-t flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={isPaused ? "default" : "outline"}
            onClick={() => setIsPaused(!isPaused)}
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

        <Button size="sm" variant="outline" onClick={nextStep} disabled={currentStep === presentationSteps.length - 1}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-muted-foreground/30" />
      </div>
    </div>
  );
}
