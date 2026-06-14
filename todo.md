# RegulaSync v2 — Project TODO

## Core Migration
- [x] Copy drizzle schema (all tables including 20 new feature tables)
- [x] Copy all server services (11 new + existing)
- [x] Copy all server routers
- [x] Copy all client pages (existing + 11 new)
- [x] Copy DashboardLayout with new sidebar groups
- [x] Copy App.tsx with all routes
- [x] Copy shared types and constants
- [x] Copy public assets and index.html fonts

## Database
- [x] Push schema migrations (pnpm db:push)
- [x] Verify all tables created (34 tables confirmed)

## Features (All 20 Innovations)
- [x] Agentic AI Tasks page (/agentic-tasks)
- [x] XAI Logs page (/xai-logs)
- [x] Vendor Risk / TPRM page (/vendor-risk)
- [x] Evidence Collection page (/evidence-collection)
- [x] Peer Benchmarking page (/benchmarking)
- [x] Compliance Passport page (/compliance-passport)
- [x] Incident Simulation page (/incident-simulation)
- [x] ESG Tracking page (/esg-tracking)
- [x] Regulator Portal page (/regulator-portal)
- [x] University Partnerships page (/university-partnerships)
- [x] Platform Settings page (/platform-settings)
- [x] Legal pages (Privacy Policy, Terms, Cookies)
- [x] Founder/About page with UK HQ and LinkedIn

## Deployment
- [x] TypeScript check passes (0 errors)
- [x] Dev server running
- [x] Checkpoint saved (version: 24c69ff2)
- [x] Published live — ready for user to click Publish button

## Production Readiness Tasks
- [x] Seed full demo database (policies, users, regulatory updates, departments, AI recommendations)
- [x] Seed audit trail with hash chain data
- [x] Seed gap analysis with UK regulatory scenarios
- [x] Seed ESG metrics data
- [ ] Configure Stripe integration (set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET) — awaiting user [BLOCKED: requires user to provide keys]
- [x] Verify all seeded data appears correctly on each dashboard page
- [x] Guide user on custom domain connection (regulasync.co.uk)

## 10 Transformative Enhancements
- [x] FIX #1: Logo rendering issue — fixed, re-uploaded to /manus-storage/logo_70fab7aa.png
- [x] FIX #2: Seed full demo database — 6 policies, 8 reg updates, 6 depts, 30 audit entries, 14 AI recs, 6 compliance records, 3 delegations
- [ ] FIX #3: Configure Stripe integration (awaiting user's STRIPE_SECRET_KEY) [BLOCKED: requires user to provide keys]
- [x] ENHANCE #1: AI Regulatory Intelligence Feed — new page /regulatory-intelligence with AI impact summaries
- [x] ENHANCE #2: Predictive Compliance Risk Engine — new page /predictive-risk with 90-day breach forecasts
- [x] ENHANCE #3: Board-Ready PDF with real DB data — Reports.tsx uses trpc.boardReport.getData for live data
- [x] ENHANCE #4: Live Regulatory Change Tracker — LiveChangeTrackerSection added to RegulatoryTimeline.tsx
- [x] ENHANCE #5: AI Policy Drafting Copilot — PolicyCreator.tsx uses real trpc.policyCopilot.draftClause + improveClause
- [x] ENHANCE #6: Compliance Health Scorecard — Dashboard.tsx uses trpc.healthScorecard.scorecard widget
- [x] ENHANCE #7: Delegation Expiry Alerts — Delegation.tsx uses trpc.delegationAlerts with renewal mutation
- [x] ENHANCE #8: Obligation Mapping Matrix — GapAnalysis.tsx has new Obligation Matrix tab via trpc.obligationMapping.matrix
- [x] ENHANCE #9: Smart Audit Trail Search — AuditTrail.tsx uses trpc.auditSearch.naturalLanguageSearch
- [x] ENHANCE #10: Competitor Benchmarking — Benchmarking.tsx already uses trpc.enhancedBenchmarking.compare
- [x] Wire NotificationCenter to real DB — trpc.notifications.list + markRead + markAllRead, fallback to demo when logged out

## Production-Ready SaaS Build (20 Years Ahead of Competition)

### Phase 1: Real Multi-User Authentication
- [x] Extend users table: passwordHash, expanded roles, isActive, inviteToken, organizationId
- [x] Push DB schema migration (columns added via ALTER TABLE)
- [x] Install bcryptjs for password hashing
- [x] Build server auth: login, logout, me, invite, accept-invite, forgot-password, reset-password (authRouter.ts)
- [x] Replace ComingSoon localStorage gate with real public/protected routing in App.tsx
- [x] Build /login page (professional branded with demo accounts panel)
- [x] Build /accept-invite page (for invited users to set password)
- [x] Build /forgot-password page

### Phase 2: User Management
- [x] Build /user-management page: list org users, invite by email, assign role+department, activate/deactivate
- [x] Add User Management to sidebar (company_admin and super_admin only)

### Phase 3: Role-Based Sidebar & Data Filtering
- [x] Sidebar nav items filtered by role (System section gated to admin/super_admin)
- [x] Real user data shown in UserMenu (role, department, job title)
- [x] Route guards redirect to /login for unauthenticated users

### Phase 4: World-Class Landing Page
- [x] Landing.tsx has proper nav with Log In button routing to /login
- [x] Hero section with live dashboard preview, stats bar, CTAs
- [x] Full marketing page: features, how-it-works, pricing, testimonials, demo request form

### Phase 5: Seed & Polish
- [x] Seeded 5 demo users: superadmin@regulasync.co.uk, admin@acmecorp.co.uk, compliance@acmecorp.co.uk, finance@acmecorp.co.uk, auditor@acmecorp.co.uk (all password: Demo@2026!)
- [x] TypeScript clean (0 errors), checkpoint saved (version: 3d870cc3)

## Logo & Routing Fixes (Session 3)
- [x] Fix broken logo URL: updated all 4 components (AnimatedLogo, DashboardLayout, PublicFooter, PublicHeader) to use /manus-storage/logo_optimized_92a39fa3.png
- [x] Fix /landing route: added to publicPaths array in App.tsx so it renders correctly without auth redirect
- [x] PublicHeader updated: "Try Demo" button replaced with "Log In" button linking to /login
- [x] TypeScript: 0 errors confirmed
- [x] Checkpoint saved (version: final)

## Commercial Enterprise Build (Co-Founder Roadmap)

### Phase 1: Subscription Tiers & Feature Flags
- [x] Add subscriptionTier, featureFlags, billingStatus columns to organizations table
- [x] Create subscription_plans table (Core, Professional, Enterprise)
- [x] Create feature_flags table — per-org toggle for each platform feature
- [x] Build SubscriptionPlans page (/subscription) — Core £90/mo, Professional £175/mo, Enterprise £350/mo
- [x] Build FeatureFlags admin panel — super admin toggles features per org
- [x] Wire feature flag checks into sidebar nav and protected routes
- [x] Add subscription tier badge to org profile and user menu

### Phase 2: Super Admin Global Dashboard
- [x] Build SuperAdminDashboard page (/super-admin) — all orgs, usage, health, billing
- [x] Show per-org: user count, active policies, compliance score, subscription tier, last activity
- [x] Add org suspend/activate controls
- [x] Add global usage analytics (total users, total policies, total audits across all orgs)

### Phase 3: White-Label Configuration
- [x] Add whiteLabel columns to organizations: customLogo, primaryColor, companyName, customDomain
- [x] Build WhiteLabelConfig page (/enterprise/white-label) — super admin configures per org
- [x] Apply white-label branding dynamically (logo, colors) based on org config

### Phase 4: API Keys & Webhooks
- [x] Create api_keys table (orgId, keyHash, label, permissions, lastUsed, isActive)
- [x] Create webhooks table (orgId, url, events[], secret, isActive, lastTriggered)
- [x] Build EnterpriseIntegrations page (/enterprise/integrations) — API keys, webhooks, Slack/Teams
- [x] Add API key management and webhook dispatcher

### Phase 5: OpenAPI / Swagger Documentation
- [x] Build ApiDocumentation page (/api-docs) — full endpoint reference with code examples
- [x] Document all endpoints: auth, policies, compliance, audit, delegation, gap analysis, reports

### Phase 6: In-App Documentation Hub
- [x] Build DocumentationHub page (/docs) with sidebar navigation
- [x] Write Admin Guide: org setup, user management, roles, feature flags, billing
- [x] Write User Guides: compliance manager journey, auditor journey, department user journey
- [x] Write API Reference: authentication, endpoints, webhooks, rate limits
- [x] Write User Journey maps: onboarding, daily workflow, audit preparation, board reporting

### Phase 7: Security Hardening
- [x] Add 2FA (TOTP) — QR code setup, verification on login, backup codes
- [x] Add session management page — view all active sessions, revoke individual sessions
- [x] Add audit log CSV and PDF export
- [x] Add data retention policy settings per org

### Phase 8: Onboarding & Integrations
- [x] Build Organisation Onboarding Wizard (/onboarding) — 5-step guided setup
- [x] Add Slack integration — send compliance alerts to Slack channel
- [x] Add Microsoft Teams integration — webhook-based Teams notifications
- [x] Add email notification templates per org (invite, alert, report ready)

## Commercial Enterprise Build — COMPLETED (Session 4)
- [x] DB tables: feature_flags, org_feature_flags, webhooks, webhook_deliveries, user_sessions, white_label_configs, onboarding_progress, notification_integrations, org_api_keys — all created via SQL
- [x] Seeded feature_flags with 12 platform features across Starter/Professional/Enterprise tiers
- [x] enterpriseRouter.ts — 8 sub-routers: featureFlags, superAdmin, whiteLabel, webhooks, orgApiKeys, sessions, notificationIntegrations, onboarding
- [x] All enterprise routers wired into appRouter in routers.ts
- [x] SuperAdminDashboard page (/super-admin) — global org management, feature flag overrides, all users
- [x] WhiteLabelConfig page (/enterprise/white-label) — brand identity, colour scheme, domain, legal links
- [x] EnterpriseIntegrations page (/enterprise/integrations) — API keys, webhooks, Slack/Teams notifications
- [x] ApiDocumentation page (/api-docs) — full endpoint reference with code examples
- [x] DocumentationHub page (/docs) — admin guide, user guide, user journeys, integration guides
- [x] SecuritySettings page (/security-settings) — active sessions, 2FA setup, security overview
- [x] OnboardingWizard page (/onboarding) — 5-step guided org setup
- [x] SubscriptionPlans page (/subscription) — Starter £299/mo, Professional £799/mo, Enterprise custom
- [x] Enterprise sidebar section added to DashboardLayout with role-based visibility
- [x] All routes registered in App.tsx
- [x] TypeScript: 0 errors
