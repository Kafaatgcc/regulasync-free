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
- [ ] Seed full demo database (policies, users, regulatory updates, departments, AI recommendations)
- [ ] Seed audit trail with hash chain data
- [ ] Seed gap analysis with UK regulatory scenarios
- [ ] Seed ESG metrics data
- [ ] Configure Stripe integration (set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET)
- [ ] Verify all seeded data appears correctly on each dashboard page
- [ ] Guide user on custom domain connection (regulasync.co.uk)

## 10 Transformative Enhancements
- [x] FIX #1: Logo rendering issue — fixed, re-uploaded to /manus-storage/logo_70fab7aa.png
- [x] FIX #2: Seed full demo database — 6 policies, 8 reg updates, 6 depts, 30 audit entries, 14 AI recs, 6 compliance records, 3 delegations
- [ ] FIX #3: Configure Stripe integration (awaiting user's STRIPE_SECRET_KEY)
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
