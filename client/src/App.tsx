import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Security from "./pages/Security";
import Integrations from "./pages/Integrations";
import CaseStudies from "./pages/CaseStudies";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Delegation from "./pages/Delegation";
import Compliance from "./pages/Compliance";
import AIRecommendations from "./pages/AIRecommendations";
import RegulatoryUpdates from "./pages/RegulatoryUpdates";
import AuditTrail from "./pages/AuditTrail";
import Reports from "./pages/Reports";
import AdminContacts from "./pages/AdminContacts";
import RegulatorySyncDemo from "./pages/RegulatorySyncDemo";
import ExecutiveSummary from "./pages/ExecutiveSummary";
import RegulatoryTimeline from "./pages/RegulatoryTimeline";
import AdminPanel from "./pages/AdminPanel";
import GapAnalysis from "./pages/GapAnalysis";
import WorkflowSimulator from "./pages/WorkflowSimulator";
import GovernanceLogic from "./pages/GovernanceLogic";
import CompetitorComparison from "./pages/CompetitorComparison";
import CertificationReadiness from "./pages/CertificationReadiness";
import ROICalculator from "./pages/ROICalculator";
import ComingSoon from "./pages/ComingSoon";
import DashboardLayout from "./components/DashboardLayout";
import VendorRisk from "./pages/VendorRisk";
import AgenticTasks from "./pages/AgenticTasks";
import ESGTracking from "./pages/ESGTracking";
import EvidenceCollection from "./pages/EvidenceCollection";
import CompliancePassport from "./pages/CompliancePassport";
import IncidentSimulation from "./pages/IncidentSimulation";
import Benchmarking from "./pages/Benchmarking";
import XAILogs from "./pages/XAILogs";
import RegulatorPortal from "./pages/RegulatorPortal";
import UniversityPartnership from "./pages/UniversityPartnership";
import PlatformSettings from "./pages/PlatformSettings";
import LiveChat from "./components/LiveChat";
import PresentationMode from "./components/PresentationMode";

// Scroll to top on route change
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  
  return null;
}

// Check if demo access has been granted
function hasAccess(): boolean {
  return localStorage.getItem('regulasync_demo_access') === 'true';
}

// Protected route wrapper - redirects to Coming Soon if no access
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!hasAccess()) {
    return <Redirect to="/" />;
  }
  return <>{children}</>;
}

// Main Router - Coming Soon gate first, then full platform
function Router() {
  const [accessGranted, setAccessGranted] = useState(hasAccess());

  useEffect(() => {
    const handleAccessChange = () => {
      setAccessGranted(hasAccess());
    };
    window.addEventListener('regulasync-access-changed', handleAccessChange);
    return () => window.removeEventListener('regulasync-access-changed', handleAccessChange);
  }, []);

  // If no access, always show Coming Soon page
  if (!accessGranted) {
    return (
      <>
        <ScrollToTop />
        <ComingSoon />
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <LiveChat />
      <PresentationMode />
      <Switch>
        {/* Landing page - default route after access */}
        <Route path="/">
          <Landing />
        </Route>
        
        <Route path="/home">
          <Landing />
        </Route>
        
        {/* Public pages */}
        <Route path="/about">
          <About />
        </Route>
        <Route path="/pricing">
          <Pricing />
        </Route>
        <Route path="/security">
          <Security />
        </Route>
        <Route path="/integrations">
          <Integrations />
        </Route>
        <Route path="/case-studies">
          <CaseStudies />
        </Route>
        <Route path="/privacy">
          <PrivacyPolicy />
        </Route>
        <Route path="/terms">
          <Terms />
        </Route>
        <Route path="/cookies">
          <Cookies />
        </Route>
        <Route path="/careers">
          <Careers />
        </Route>
        <Route path="/contact">
          <Contact />
        </Route>
        
        {/* Dashboard Routes */}
        <Route path="/dashboard">
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </Route>
        
        <Route path="/policies">
          <DashboardLayout>
            <Policies />
          </DashboardLayout>
        </Route>
        
        <Route path="/delegation">
          <DashboardLayout>
            <Delegation />
          </DashboardLayout>
        </Route>
        
        <Route path="/compliance">
          <DashboardLayout>
            <Compliance />
          </DashboardLayout>
        </Route>
        
        <Route path="/ai-recommendations">
          <DashboardLayout>
            <AIRecommendations />
          </DashboardLayout>
        </Route>
        
        <Route path="/regulatory-updates">
          <DashboardLayout>
            <RegulatoryUpdates />
          </DashboardLayout>
        </Route>
        
        <Route path="/audit-trail">
          <DashboardLayout>
            <AuditTrail />
          </DashboardLayout>
        </Route>
        
        <Route path="/reports">
          <DashboardLayout>
            <Reports />
          </DashboardLayout>
        </Route>
        
        <Route path="/admin/contacts">
          <DashboardLayout>
            <AdminContacts />
          </DashboardLayout>
        </Route>
        
        <Route path="/gap-analysis">
          <DashboardLayout>
            <GapAnalysis />
          </DashboardLayout>
        </Route>
        
        <Route path="/regulatory-sync">
          <DashboardLayout>
            <RegulatorySyncDemo />
          </DashboardLayout>
        </Route>
        
        <Route path="/executive-summary">
          <DashboardLayout>
            <ExecutiveSummary />
          </DashboardLayout>
        </Route>
        
        <Route path="/regulatory-timeline">
          <DashboardLayout>
            <RegulatoryTimeline />
          </DashboardLayout>
        </Route>
        
        <Route path="/admin">
          <DashboardLayout>
            <AdminPanel />
          </DashboardLayout>
        </Route>
        
        {/* Tools Routes */}
        <Route path="/workflow-simulator">
          <DashboardLayout>
            <WorkflowSimulator />
          </DashboardLayout>
        </Route>
        
        <Route path="/governance-logic">
          <DashboardLayout>
            <GovernanceLogic />
          </DashboardLayout>
        </Route>
        
        <Route path="/competitor-comparison">
          <DashboardLayout>
            <CompetitorComparison />
          </DashboardLayout>
        </Route>
        
        <Route path="/certifications">
          <DashboardLayout>
            <CertificationReadiness />
          </DashboardLayout>
        </Route>
        
        <Route path="/roi-calculator">
          <DashboardLayout>
            <ROICalculator />
          </DashboardLayout>
        </Route>
        
        {/* New Feature Routes */}
        <Route path="/vendor-risk">
          <DashboardLayout>
            <VendorRisk />
          </DashboardLayout>
        </Route>

        <Route path="/agentic-tasks">
          <DashboardLayout>
            <AgenticTasks />
          </DashboardLayout>
        </Route>

        <Route path="/esg-tracking">
          <DashboardLayout>
            <ESGTracking />
          </DashboardLayout>
        </Route>

        <Route path="/evidence-collection">
          <DashboardLayout>
            <EvidenceCollection />
          </DashboardLayout>
        </Route>

        <Route path="/compliance-passport">
          <DashboardLayout>
            <CompliancePassport />
          </DashboardLayout>
        </Route>

        <Route path="/incident-simulation">
          <DashboardLayout>
            <IncidentSimulation />
          </DashboardLayout>
        </Route>

        <Route path="/benchmarking">
          <DashboardLayout>
            <Benchmarking />
          </DashboardLayout>
        </Route>

        <Route path="/xai-logs">
          <DashboardLayout>
            <XAILogs />
          </DashboardLayout>
        </Route>

        <Route path="/regulator-portal">
          <DashboardLayout>
            <RegulatorPortal />
          </DashboardLayout>
        </Route>

        <Route path="/university-partnerships">
          <DashboardLayout>
            <UniversityPartnership />
          </DashboardLayout>
        </Route>

        <Route path="/platform-settings">
          <DashboardLayout>
            <PlatformSettings />
          </DashboardLayout>
        </Route>

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
