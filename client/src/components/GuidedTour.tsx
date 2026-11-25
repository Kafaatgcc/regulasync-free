import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step, EventData } from 'react-joyride';
import { useLocation } from 'wouter';
import { PLAN_PRICING, ANNUAL_BILLING_EXPLANATION, USER_BILLING_EXPLANATION, formatGBP } from '@shared/planPricing';

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
          This demo illustrates governance workflows. Demo metrics and AI outputs are not validated customer evidence or compliance determinations.
        </p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="compliance-score"]',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">Illustrative Compliance Score</h3>
        <p className="text-sm text-muted-foreground">
          Explore a summary indicator of recorded obligation statuses.
          The demo score is illustrative, not a verified measure of your organization's compliance.
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
          Explore AI-generated suggestions for human review.
          Demo confidence scores, predictions, and explanations are illustrative and unvalidated, not calibrated probabilities or proof of accuracy. Check sources before acting.
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
          Review recorded governance activity. The hash-linked audit design is intended
          to support tamper-evident checks; integrity assurance depends on verification and access controls, not a guarantee of complete coverage or immutability.
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="sidebar-nav"]',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">Core Compliance Modules</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Navigate through the platform to explore:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Policies</strong> — AI-powered policy lifecycle management</li>
          <li>• <strong>Delegation</strong> — 7-level visual approval chains</li>
          <li>• <strong>Regulatory Updates</strong> — Review FCA, PRA, ICO, HM Treasury updates; verify source coverage</li>
          <li>• <strong>Audit Trail</strong> — Self-Validating Audit Cache (SVAC)</li>
          <li>• <strong>Risk Register</strong> — Illustrative predictive AI indicators for human review</li>
        </ul>
      </div>
    ),
    placement: 'right',
  },
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">💳 Subscription Tiers</h3>
        <p className="text-sm text-muted-foreground mb-3">
          RegulaSync is available on three plans, all built for UK regulated businesses:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Core — {formatGBP(PLAN_PRICING.core.monthlyPence)} per user/month</strong>: 3 frameworks, basic SVAC audit trail</li>
          <li>• <strong>Professional — {formatGBP(PLAN_PRICING.professional.monthlyPence)} per user/month</strong>: AI policy drafting, predictive risk, board reports</li>
          <li>• <strong>Enterprise — {formatGBP(PLAN_PRICING.enterprise.monthlyPence)} per user/month</strong>: White-label options, planned API access and webhooks, dedicated manager; production availability requires confirmation</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">{USER_BILLING_EXPLANATION}</p>
        <p className="text-xs text-muted-foreground mt-2">{ANNUAL_BILLING_EXPLANATION}</p>
        <p className="text-xs text-muted-foreground mt-2">Navigate to <strong>Subscription Plans</strong> in the sidebar to compare features.</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">🔗 Enterprise Integrations</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Explore planned enterprise integration options:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>API Keys</strong> — Review configuration options for planned machine-to-machine access</li>
          <li>• <strong>Webhooks</strong> — Planned event delivery; demo controls do not confirm production delivery</li>
          <li>• <strong>Slack / Microsoft Teams</strong> — Planned notification integrations</li>
          <li>• <strong>White-Label</strong> — Logo and colour options; custom-domain service requires confirmation</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">Explore under <strong>Enterprise</strong> in the sidebar. Contact bhousen@regulasync.co.uk to confirm production availability before changing DNS or connecting production systems.</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">📚 Documentation Hub</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Everything you need to get the most from RegulaSync:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Admin Guide</strong> — Organisation setup, user management, billing, security</li>
          <li>• <strong>User Guide</strong> — Dashboard, policies, risks, audit trail</li>
          <li>• <strong>User Journeys</strong> — Step-by-step workflows for common compliance scenarios</li>
          <li>• <strong>Integration Guides</strong> — Planned capabilities and requirements to confirm before production use</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">Access via <strong>Help &amp; Docs</strong> in the sidebar.</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="font-bold text-lg mb-2">🔒 Security &amp; You're Ready!</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Explore security controls and review deployment-specific assurance before production use:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Two-Factor Authentication (2FA)</strong> — TOTP-based, compatible with all authenticator apps</li>
          <li>• <strong>Session Management</strong> — View and revoke active sessions from any device</li>
          <li>• <strong>SVAC Audit Trail</strong> — Hash-linked design intended to support tamper-evident integrity review</li>
          <li>• <strong>Data Protection</strong> — Confirm hosting, residency, and UK GDPR obligations for your deployment; this demo does not establish compliance</li>
        </ul>
        <p className="text-sm font-medium text-primary mt-3">You're all set. Welcome to RegulaSync! 🇬🇧</p>
      </div>
    ),
    placement: 'center',
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
