
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  FileText, 
  GitBranch, 
  Shield, 
  Brain, 
  History, 
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
  Building2,
  Eye,
  Moon,
  Sun,
  Users,
  RefreshCw,
  User,
  LogIn,
  Calendar,
  Presentation,
  Target,
  Sparkles,
  Bot,
  Leaf,
  FileCheck,
  Award,
  Activity,
  BarChart2,
  BookOpen,
  GraduationCap,
  Sliders,
  Rss,
  TrendingDown
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { CSSProperties, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import GuidedTour, { resetGuidedTour } from './GuidedTour';
import NotificationCenter from './NotificationCenter';import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';

// Role-based nav permissions
const ROLE_LEVELS: Record<string, number> = {
  super_admin: 5,
  company_admin: 4,
  compliance_manager: 3,
  department_user: 2,
  auditor: 1,
  admin: 4,
  user: 2,
};
const hasRole = (userRole: string | undefined, minRole: string) =>
  (ROLE_LEVELS[userRole || 'user'] || 0) >= (ROLE_LEVELS[minRole] || 0);

const mainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Target, label: "Exec Summary", path: "/executive-summary" },
  { icon: FileText, label: "Policies", path: "/policies" },
  { icon: GitBranch, label: "Delegation", path: "/delegation" },
  { icon: Shield, label: "Compliance", path: "/compliance" },
];

const insightsMenuItems = [
  { icon: Brain, label: "AI Insights", path: "/ai-recommendations" },
  { icon: Rss, label: "Reg Intelligence", path: "/regulatory-intelligence" },
  { icon: TrendingDown, label: "Predictive Risk", path: "/predictive-risk" },
  { icon: Bell, label: "Reg Updates", path: "/regulatory-updates" },
  { icon: Calendar, label: "Reg Timeline", path: "/regulatory-timeline" },
  { icon: RefreshCw, label: "Reg Sync", path: "/regulatory-sync" },
  { icon: Sparkles, label: "Gap Analysis", path: "/gap-analysis" },
];

const systemMenuItems = [
  { icon: History, label: "Audit Trail", path: "/audit-trail", minRole: "department_user" },
  { icon: BarChart3, label: "Reports", path: "/reports", minRole: "compliance_manager" },
  { icon: Users, label: "User Management", path: "/user-management", minRole: "company_admin" },
  { icon: Users, label: "Contacts", path: "/admin/contacts", minRole: "company_admin" },
  { icon: Settings, label: "Admin Panel", path: "/admin", minRole: "company_admin" },
];

import { GitCompare, Calculator, Workflow, Scale, Webhook, CreditCard, Globe, ShieldCheck } from "lucide-react";

const toolsMenuItems = [
  { icon: Workflow, label: "Workflow Sim", path: "/workflow-simulator" },
  { icon: GitCompare, label: "Gov Logic", path: "/governance-logic" },
  { icon: Scale, label: "Competitors", path: "/competitor-comparison" },
  { icon: Award, label: "Certifications", path: "/certifications" },
  { icon: Calculator, label: "ROI Calc", path: "/roi-calculator" },
];

const innovationMenuItems = [
  { icon: Bot, label: "Agentic AI", path: "/agentic-tasks" },
  { icon: Brain, label: "XAI Logs", path: "/xai-logs" },
  { icon: Building2, label: "Vendor Risk", path: "/vendor-risk" },
  { icon: FileCheck, label: "Evidence", path: "/evidence-collection" },
  { icon: BarChart2, label: "Benchmarking", path: "/benchmarking" },
];

const horizonMenuItems = [
  { icon: Award, label: "Compliance Passport", path: "/compliance-passport" },
  { icon: Activity, label: "Incident Sim", path: "/incident-simulation" },
  { icon: Leaf, label: "ESG Tracking", path: "/esg-tracking" },
  { icon: Shield, label: "Regulator Portal", path: "/regulator-portal" },
  { icon: GraduationCap, label: "University Partners", path: "/university-partnerships" },
  { icon: Sliders, label: "Platform Settings", path: "/platform-settings" },
];

const enterpriseMenuItems = [
  { icon: Globe, label: "Super Admin", path: "/super-admin", minRole: "super_admin" },
  { icon: Globe, label: "White Label", path: "/enterprise/white-label", minRole: "company_admin" },
  { icon: Webhook, label: "Integrations", path: "/enterprise/integrations", minRole: "company_admin" },
  { icon: CreditCard, label: "Subscription", path: "/subscription", minRole: "company_admin" },
  { icon: BookOpen, label: "Documentation", path: "/docs" },
  { icon: BookOpen, label: "API Docs", path: "/api-docs", minRole: "company_admin" },
  { icon: ShieldCheck, label: "Security", path: "/security-settings" },
  { icon: Settings, label: "Onboarding", path: "/onboarding", minRole: "company_admin" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

// Production user object
const getDefaultUser = () => {
  const savedName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
  return {
    id: 0,
    name: savedName || 'Demo User',
    email: 'demo@regulasync.com',
    openId: 'user',
    role: 'user' as const,
    loginMethod: 'production',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Try to get the real authenticated user from the server
  const { data: authUser, isLoading: authLoading } = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 30_000 });
  // Redirect to login if not authenticated
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/login');
    }
  }, [authUser, authLoading, navigate]);
  // Merge real user with fallback defaults
  const [localName, setLocalName] = useState(() => localStorage.getItem('userName') || '');
  const user = authUser
    ? { ...authUser, name: authUser.name || localName || 'User', email: authUser.email || 'user@regulasync.com' }
    : getDefaultUser();

  const updateUserName = useCallback((name: string) => {
    localStorage.setItem('userName', name);
    setLocalName(name);
  }, []);
  const resetData = useCallback(() => {
    localStorage.removeItem('userName');
    setLocalName('');
    window.location.reload();
  }, []);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // Production mode - full access
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent 
        setSidebarWidth={setSidebarWidth}
        user={user}
        onUpdateUserName={updateUserName}
        onResetData={resetData}
      >
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type AnyUser = {
  id: number;
  name: string;
  email: string;
  openId: string;
  role: string;
  department?: string | null;
  jobTitle?: string | null;
  loginMethod?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};
type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  user: AnyUser | null;
  onUpdateUserName: (name: string) => void;
  onResetData: () => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  user,
  onUpdateUserName,
  onResetData,
}: DashboardLayoutContentProps) {
  const currentUser = user;
  const logoutMutation = trpc.auth.logout.useMutation({
    onSettled: () => {
      localStorage.removeItem('regulasync_demo_access');
      localStorage.removeItem('userName');
      window.location.href = '/';
    },
  });
  // Sign out: call server logout then redirect
  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newName, setNewName] = useState('');

  // Resizable sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setSidebarWidth]);

  // Navigate helper
  const navigate = (path: string) => {
    setLocation(path);
  };

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border py-2.5">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className="h-[19px] hover:bg-transparent cursor-pointer"
                  onClick={() => window.location.href = '/'}
                >
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <img 
                        src="/manus-storage/logo_optimized_92a39fa3.png" 
                        alt="RegulaSync" 
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <span className="font-semibold text-sm text-sidebar-foreground">
                      Regula<span className="text-copper">Sync</span>
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          
          <SidebarContent className="py-2">
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 py-1">
                Main
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={location === item.path}
                        className="h-[19px] space-y-0.5"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Insights */}
            <SidebarGroup className="mt-2">
              <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 py-1">
                Insights
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {insightsMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={location === item.path}
                        className="h-[19px] space-y-0.5"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Tools */}
            <SidebarGroup className="mt-2">
              <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 py-1">
                Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {toolsMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={location === item.path}
                        className="h-[19px] space-y-0.5"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Innovation */}
            <SidebarGroup className="mt-2">
              <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 py-1">
                Innovation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {innovationMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={location === item.path}
                        className="h-[19px] space-y-0.5"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Horizon */}
            <SidebarGroup className="mt-2">
              <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 py-1">
                Horizon
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {horizonMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={location === item.path}
                        className="h-[19px] space-y-0.5"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* System */}
            <SidebarGroup className="mt-2">
              <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 py-1">
                System
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemMenuItems.filter(item => hasRole(currentUser?.role, item.minRole)).map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={location === item.path}
                        className="h-[19px] space-y-0.5"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Enterprise */}
            <SidebarGroup className="mt-2">
              <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 py-1">
                Enterprise
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {enterpriseMenuItems.filter(item => !item.minRole || hasRole(currentUser?.role, item.minRole)).map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={location === item.path}
                        className="h-[19px] space-y-0.5"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-sidebar-border py-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <UserMenu 
                  user={currentUser}
                  onUpdateUserName={onUpdateUserName}
                  onResetData={onResetData}
                  onSignOut={handleSignOut}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        {/* Resize handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors z-50"
          onMouseDown={handleMouseDown}
        />
      </div>
      
      <SidebarInset>
        {/* Dashboard Header with Navigation */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-12 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
              <nav className="hidden md:flex items-center gap-4 text-sm">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTheme?.()}
                className="h-8 w-8"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
        
        {/* Dashboard Footer */}
        <footer className="border-t py-4 px-6 text-center text-xs text-muted-foreground">
          <p>© 2026 RegulaSync. All rights reserved.</p>
        </footer>
      </SidebarInset>
      
      {/* Guided Tour */}
      <GuidedTour isDemoMode={false} />
    </>
  );
}

// User Menu Component
function UserMenu({ 
  user, 
  onUpdateUserName,
  onResetData,
  onSignOut
}: { 
  user: AnyUser | null;
  onUpdateUserName: (name: string) => void;
  onResetData: () => void;
  onSignOut: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const handleSaveName = () => {
    if (newName.trim()) {
      onUpdateUserName(newName.trim());
      setShowNameDialog(false);
      setNewName('');
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="h-10 w-full">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left min-w-0 flex-1">
                <span className="text-xs font-medium truncate w-full">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">
                  {user?.email || 'user@regulasync.com'}
                </span>
              </div>
            )}
            {!isCollapsed && <ChevronRight className="h-4 w-4 ml-auto" />}
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          side="right" 
          align="end" 
          className="w-56"
          sideOffset={8}
        >
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {user?.role && user.role !== 'user' && (
              <p className="text-[10px] text-primary font-medium mt-0.5 capitalize">
                {user.role.replace(/_/g, ' ')}
                {user.department ? ` · ${user.department}` : ''}
              </p>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setShowNameDialog(true); setIsOpen(false); }}>
            <User className="h-4 w-4 mr-2" /> Edit Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { onSignOut(); setIsOpen(false); }} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Name Edit Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Your Name</DialogTitle>
            <DialogDescription>
              Enter your name to personalize your experience.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={user?.name || 'Enter your name'}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
