import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step, EventData } from 'react-joyride';
import { useLocation } from 'wouter';

const TOUR_COMPLETED_KEY = 'regulasync-tour-completed';

// Tour steps for the dashboard
const dashboardSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">Welcome to RegulaSync! 🎉</h3>
        <p className="text-sm text-muted-foreground">
          Let's take a quick tour of the AI-powered governance automation platform. 
          This demo showcases how RegulaSync transforms compliance operations for regulated industries.
        </p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="compliance-score"]',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">Real-Time Compliance Score</h3>
        <p className="text-sm text-muted-foreground">
          Your organization's overall compliance health at a glance. 
          RegulaSync continuously monitors policies and regulations to calculate this score.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="ai-recommendations"]',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">AI-Powered Recommendations</h3>
        <p className="text-sm text-muted-foreground">
          Our AI analyzes regulatory changes and your policies to provide actionable recommendations. 
          Each suggestion includes a confidence score and priority level.
        </p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '[data-tour="recent-activity"]',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">Activity Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Track all governance activities in real-time. Every action is logged with 
          cryptographic hashes for complete audit trail integrity.
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="sidebar-nav"]',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">Explore More Features</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Navigate through the platform to explore:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Policies</strong> - Manage and automate policy lifecycle</li>
          <li>• <strong>Delegation</strong> - Visual approval chains</li>
          <li>• <strong>Regulatory Updates</strong> - UK-specific FCA, PRA, ICO alerts</li>
          <li>• <strong>Audit Trail</strong> - Self-Validating Audit Cache (SVAC)</li>
        </ul>
      </div>
    ),
    placement: 'right',
  },
];

interface GuidedTourProps {
  isDemoMode: boolean;
}

export default function GuidedTour({ isDemoMode }: GuidedTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [location] = useLocation();

  useEffect(() => {
    // Only run tour in demo mode on dashboard, and only if not completed before
    if (isDemoMode && location.includes('/dashboard')) {
      const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
      if (!tourCompleted) {
        // Small delay to let the page render
        const timer = setTimeout(() => setRun(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isDemoMode, location]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status, index, type } = data;
    
    if (type === 'step:after') {
      setStepIndex(index + 1);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    }
  };

  // Reset tour function (can be called from outside)
  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setStepIndex(0);
    setRun(true);
  };

  if (!isDemoMode) return null;

  return (
    <Joyride
      steps={dashboardSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
      onEvent={handleJoyrideCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      styles={{
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        buttonPrimary: {
          backgroundColor: '#1e3a5f',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#1e3a5f',
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#6b7280',
        },
        spotlight: {
          rx: '8',
        },
      }}
    />
  );
}

// Export reset function for use in other components
export const resetGuidedTour = () => {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
};
