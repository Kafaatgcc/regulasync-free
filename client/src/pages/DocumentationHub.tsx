import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Shield, Users, Workflow, Key, Webhook, Settings, ChevronRight } from "lucide-react";
import { PLAN_PRICING, ANNUAL_BILLING_EXPLANATION, USER_BILLING_EXPLANATION, formatGBP } from "@shared/planPricing";

interface DocSection {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

interface DocCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  sections: DocSection[];
}

const DOCS: DocCategory[] = [
  {
    id: "admin",
    title: "Admin Guide",
    icon: Shield,
    description: "Complete guide for Company Admins and Super Admins managing the platform.",
    sections: [
      {
        id: "admin-setup",
        title: "Initial Organisation Setup",
        tags: ["setup", "onboarding", "admin"],
        content: `## Initial Organisation Setup

After your organisation is provisioned, the Company Admin should complete these steps in order:

**Step 1 — Organisation Profile**
Navigate to Settings → Organisation Profile. Fill in your organisation name, industry, regulatory jurisdiction, and company size. This information is used to personalise regulatory intelligence feeds.

**Step 2 — Invite Your Team**
Go to User Management → Invite Users. Enter the email address and select the appropriate role:
- **Company Admin** — Full platform access, can manage all settings
- **Compliance Manager** — Manage frameworks, policies, and risk assessments
- **Department User** — View and respond to assigned tasks
- **Auditor** — Read-only access to audit trails and reports

**Step 3 — Configure Frameworks**
Navigate to Compliance → Frameworks. Select the regulatory frameworks applicable to your organisation (FCA SYSC, PRA, ICO, Basel III, etc.). Each framework will populate with relevant obligations.

**Step 4 — Upload Existing Policies**
Go to Policies → Upload. Import your existing policy documents (PDF, Word, or plain text). AI analysis may suggest gaps against selected frameworks. Outputs are unvalidated review aids; verify them against source requirements before acting.

**Step 5 — Review Planned Integrations**
Navigate to Enterprise → Integrations to explore configuration options. The demo does not confirm production Slack, Microsoft Teams, or webhook delivery. Confirm availability and requirements with bhousen@regulasync.co.uk before connecting production systems.`,
      },
      {
        id: "admin-users",
        title: "User Management",
        tags: ["users", "roles", "permissions", "admin"],
        content: `## User Management

### Role Hierarchy

| Role | Access Level | Key Capabilities |
|---|---|---|
| Super Admin | Platform-wide | Manage all organisations, billing, feature flags |
| Company Admin | Organisation-wide | Invite users, configure settings, all features |
| Compliance Manager | Operational | Manage frameworks, policies, risks, reports |
| Department User | Limited | View assigned tasks, submit evidence |
| Auditor | Read-only | View audit trails, export reports |

### Inviting Users
1. Navigate to **User Management** in the sidebar
2. Click **Invite User**
3. Enter the email address and select a role
4. The user will receive an invitation email with a secure link
5. Invitations expire after 7 days — resend from the pending invitations list

### Deactivating Users
Users who leave the organisation should be deactivated, not deleted, to preserve audit trail integrity. Go to User Management, find the user, and click **Deactivate**. Their data and audit history is preserved.

### Role Changes
To change a user's role, navigate to User Management, click the user's name, and select a new role from the dropdown. Changes take effect immediately.`,
      },
      {
        id: "admin-billing",
        title: "Subscription & Billing",
        tags: ["billing", "subscription", "tiers", "admin"],
        content: `## Subscription Tiers

RegulaSync offers three subscription tiers priced per user/month:

${USER_BILLING_EXPLANATION}

${ANNUAL_BILLING_EXPLANATION}

### Core — ${formatGBP(PLAN_PRICING.core.monthlyPence)} per user/month
Ideal for small compliance teams getting started.
- Annual billing: ${formatGBP(PLAN_PRICING.core.annualPence)} per user/year
- Per-user licensing
- 3 regulatory frameworks (FCA, PRA, ICO)
- Core policy management
- Basic SVAC audit trail
- Email support

### Professional — ${formatGBP(PLAN_PRICING.professional.monthlyPence)} per user/month
For growing compliance functions.
- Annual billing: ${formatGBP(PLAN_PRICING.professional.annualPence)} per user/year
- Per-user licensing
- Unlimited frameworks
- AI policy drafting
- Predictive risk engine
- Board-ready reports
- Planned Slack/Teams integration — production availability to be confirmed
- Priority support

### Enterprise — ${formatGBP(PLAN_PRICING.enterprise.monthlyPence)} per user/month
For large regulated firms requiring full capability.
- Annual billing: ${formatGBP(PLAN_PRICING.enterprise.annualPence)} per user/year
- Per-user licensing
- All Professional features
- White-label configuration
- Planned custom domain — production availability to be confirmed
- Planned API access — production availability to be confirmed
- Planned webhooks — production availability to be confirmed
- Dedicated account manager
- SLA-backed support

### Calculating Team Costs
Multiply the plan's per-user rate by the number of licensed users. For example, 5 Core users cost ${formatGBP(PLAN_PRICING.core.monthlyPence)} × 5 = ${formatGBP(PLAN_PRICING.core.monthlyPence * 5)} per month in total. This is illustrative, not a bundle offer. VAT may apply.

### Upgrading
Contact your account manager or email bhousen@regulasync.co.uk to arrange a team subscription or discuss plan changes. The Pricing page checkout purchases one user licence. Team quantities, planned feature availability, and any bespoke commercial terms must be confirmed in writing.`,
      },
      {
        id: "admin-security",
        title: "Security Configuration",
        tags: ["security", "2fa", "sessions", "admin"],
        content: `## Security Configuration

### Session Management
Navigate to **Settings → Security → Active Sessions** to view all active login sessions for your account. You can revoke individual sessions or revoke all sessions except the current one.

### Two-Factor Authentication (2FA)
RegulaSync supports TOTP-based 2FA (compatible with Google Authenticator, Authy, 1Password, etc.).

To enable 2FA:
1. Go to **Settings → Security → Two-Factor Authentication**
2. Click **Enable 2FA**
3. Scan the QR code with your authenticator app
4. Enter the 6-digit code to confirm
5. Save your backup codes in a secure location

**Enforcing 2FA organisation-wide:** Company Admins can require all users to enable 2FA from **Settings → Security → Enforce 2FA**. Users will be prompted on next login.

### API Key Security
- API keys are shown only once at creation — store them securely
- Rotate keys regularly (recommended: every 90 days)
- Use the minimum permissions required for each integration
- Revoke unused keys immediately`,
      },
      {
        id: "admin-whitelabel",
        title: "White Label Configuration",
        tags: ["white label", "branding", "reseller", "admin"],
        content: `## White Label Configuration

White-label configuration screens illustrate branding options for potential reselling or internal deployment. Production availability and deployment requirements must be confirmed separately.

### Branding Options Shown
- Platform logo and favicon
- Colour scheme (primary, secondary, accent)
- Browser tab title
- Support email address
- Privacy policy and terms of service links
- Planned custom domain (e.g. compliance.yourfirm.com) — not a confirmed production service

### Reviewing Configuration
Explore **Enterprise → White Label** to review logo, colour, and domain configuration fields. Saving settings or toggling **Active** does not confirm production domain provisioning.

### Planned Custom Domains
Do not change production DNS based on this demo. Contact bhousen@regulasync.co.uk to confirm service availability, hosting requirements, and any agreed setup process before deployment.

### Reseller Considerations
Organisation-level white-label settings can be reviewed from the Global Dashboard by Super Admins. Reseller deployment and commercial terms require separate confirmation.`,
      },
    ],
  },
  {
    id: "user",
    title: "User Guide",
    icon: Users,
    description: "Step-by-step guides for compliance managers, department users, and auditors.",
    sections: [
      {
        id: "user-dashboard",
        title: "Understanding Your Dashboard",
        tags: ["dashboard", "overview", "getting started"],
        content: `## Understanding Your Dashboard

Your dashboard summarises available compliance data. Demo metrics are illustrative, not evidence of a customer's compliance or a regulatory determination.

### Key Metrics
- **Compliance Score** — Indicator based on recorded obligation statuses; not a verified measure of compliance
- **Open Risks** — Number of risk items requiring attention, colour-coded by severity
- **Pending Tasks** — Actions assigned to you or your team
- **Policy Status** — Count of policies by status (active, under review, expiring)

### Regulatory Intelligence Feed
The right panel shows regulatory updates from FCA, PRA, ICO, and Bank of England. AI-generated impact suggestions are unvalidated aids for human review; check source publications and relevance before relying on them.

### Compliance Health Scorecard
The scorecard breaks down compliance by framework, showing which areas are strong and which need attention. Click any framework to drill into specific obligations.

### Notifications
The bell icon in the top navigation shows unread alerts. External notification delivery depends on supported integrations and configuration; planned Slack/Teams delivery is not confirmed by the demo.`,
      },
      {
        id: "user-policies",
        title: "Managing Policies",
        tags: ["policies", "documents", "approval", "version control"],
        content: `## Managing Policies

### Creating a New Policy
1. Navigate to **Policies** in the sidebar
2. Click **New Policy**
3. Enter a title and select a category
4. Either write the content directly or use **AI Drafting** — enter a prompt describing what the policy should cover and the AI will generate a draft
5. Link the policy to one or more compliance frameworks
6. Set the review date
7. Save as **Draft**

AI-generated drafts are unvalidated review support. A qualified reviewer should check accuracy, applicability, and completeness before approval.

### Policy Lifecycle
Policies move through these statuses:
- **Draft** — Being written, not yet active
- **Under Review** — Submitted for approval
- **Active** — Approved and in force
- **Archived** — Superseded or withdrawn

### Approving Policies
Compliance Managers and Company Admins can approve policies. Navigate to the policy, review the content, and click **Approve**. The approval is recorded in the audit trail with timestamp and approver identity.

### Version Control
Every change to a policy creates a new version. Click **Version History** on any policy to see all previous versions and who made each change.`,
      },
      {
        id: "user-risks",
        title: "Risk Management",
        tags: ["risks", "assessment", "mitigation", "scoring"],
        content: `## Risk Management

### Risk Register
The Risk Register lists all identified risks with severity scores, owners, and mitigation status. Use the filters to focus on critical or unmitigated risks.

### Risk Severity Levels
| Level | Score Range | Action Required |
|---|---|---|
| Critical | 80–100 | Immediate escalation to senior management |
| High | 60–79 | Mitigation plan required within 5 business days |
| Medium | 40–59 | Mitigation plan required within 30 days |
| Low | 0–39 | Monitor and review quarterly |

### Predictive Risk Engine
The AI Predictive Risk Engine presents potential risk indicators for human review. Demo predictions and confidence scores are illustrative; other AI outputs are unvalidated and are not calibrated probabilities or customer evidence. Navigate to **Risk → Predictive Analysis** to view:
- Trend direction (improving/deteriorating)
- Potential risks over an illustrative 90-day horizon
- Suggested pre-emptive actions to assess with a qualified reviewer

### Logging a Risk
1. Go to **Risk → New Risk**
2. Enter a title, description, and category
3. Assign an owner and set the likelihood/impact scores
4. The system calculates the overall risk score
5. Add mitigation actions and set target completion dates`,
      },
      {
        id: "user-audit",
        title: "Audit Trail",
        tags: ["audit", "evidence", "export", "compliance"],
        content: `## Audit Trail

The audit trail stores recorded platform events. Its hash-linked design is intended to support tamper-evident integrity checks and human review, not to guarantee immutability or complete event coverage. Assurance depends on implementation, verification, access controls, and retention. Review records and supporting evidence before any regulatory submission; regulator acceptance is not guaranteed.

### Event Types to Review
- User logins and logouts
- Policy creation, modification, and approval
- Risk assessments and status changes
- Framework obligation updates
- User invitations and role changes
- Document uploads and downloads
- API access events

### Searching the Audit Trail
Use the search bar to find specific events. You can filter by:
- Date range
- User
- Action type
- Resource type

### Exporting for Regulators
1. Navigate to **Audit Trail**
2. Set your date range and filters
3. Click **Export**
4. Choose PDF (formatted report) or CSV (raw data)
5. The export is also recorded in the audit trail

### Smart Audit Search
Smart Audit Search supports natural-language queries. AI search output may be incomplete or inaccurate; verify results against the underlying records. Try: "Show me all policy approvals by Jane Smith in Q1 2026" or "Find all high-risk items that were closed last month".`,
      },
    ],
  },
  {
    id: "journeys",
    title: "User Journeys",
    icon: Workflow,
    description: "End-to-end workflow guides for common compliance scenarios.",
    sections: [
      {
        id: "journey-new-regulation",
        title: "Responding to a New Regulation",
        tags: ["workflow", "regulation", "gap analysis", "policy"],
        content: `## Journey: Responding to a New Regulation

This journey covers the complete workflow when a new regulation is announced (e.g. a new FCA policy statement).

### Step 1 — Receive the Alert
Review the Regulatory Intelligence Feed and relevant official publications. Feed and notification coverage is not guaranteed; planned Slack/Teams delivery requires production availability to be confirmed.

### Step 2 — Assess Impact
Click on the regulatory update to see AI-generated impact suggestions. These are unvalidated human-review support, not a compliance determination. Verify:
- Which of your existing frameworks are affected
- Which policies may need updating
- Estimated compliance effort

### Step 3 — Run Gap Analysis
Navigate to **Compliance → Gap Analysis** and select the new regulation. Review the suggested gaps against source requirements and organisational evidence; the output does not establish complete coverage.

### Step 4 — Create an Action Plan
From the gap report, click **Generate Action Plan**. This creates a set of tasks assigned to relevant team members with suggested deadlines.

### Step 5 — Update or Create Policies
For each gap, either update an existing policy or create a new one using the AI Policy Copilot. The copilot is pre-loaded with the regulatory context.

### Step 6 — Approve and Activate
Submit updated policies for human approval. Policy activation or a recorded gap status does not establish that the underlying obligation has been met; verify implementation and evidence before closing a gap.

### Step 7 — Generate Evidence
Export a Board Report or Regulatory Submission report to support review of your response. Validate the report and supporting evidence; export does not guarantee compliance or regulator acceptance.`,
      },
      {
        id: "journey-audit",
        title: "Preparing for a Regulatory Audit",
        tags: ["workflow", "audit", "regulator", "evidence"],
        content: `## Journey: Preparing for a Regulatory Audit

### Step 1 — Audit Readiness Check
Navigate to **Reports → Audit Readiness**. This generates a checklist of items regulators typically request, with your current status for each.

### Step 2 — Compile Evidence Pack
Use the **Board Report** generator to assemble material for an evidence pack. Select the relevant frameworks and date range, and check completeness against the regulator's actual requests.

### Step 3 — Export Audit Trail
Export available audit records for the relevant period as a PDF. These support review of recorded activities; a PDF export does not establish immutability, complete activity coverage, or regulator approval.

### Step 4 — Review Open Risks
Check that critical and high risks have documented mitigation plans and assess any remaining exposure. Documented plans alone do not ensure compliance or a favourable audit outcome.

### Step 5 — Verify Policy Currency
Check that all active policies have been reviewed within their scheduled review period. Policies overdue for review are flagged in the Policy dashboard.

### Step 6 — Prepare Personnel
Use the User Management export to provide the regulator with a list of staff and their compliance responsibilities.

### Step 7 — Post-Audit Actions
After the audit, log any findings as risks or policy updates. Track remediation progress through the Risk Register.`,
      },
      {
        id: "journey-onboarding",
        title: "Onboarding a New Team Member",
        tags: ["workflow", "onboarding", "users", "training"],
        content: `## Journey: Onboarding a New Compliance Team Member

### Step 1 — Send Invitation
Company Admin navigates to **User Management → Invite User**, enters the new team member's email, and selects their role.

### Step 2 — Account Setup
The new user receives an invitation email and sets up their account (password + optional 2FA).

### Step 3 — Role-Specific Orientation
Direct the new user to the documentation relevant to their role:
- **Compliance Manager** → Admin Guide + User Guide (Policies, Risks, Audit)
- **Department User** → User Guide (Dashboard, Tasks)
- **Auditor** → User Guide (Audit Trail, Reports)

### Step 4 — Assign Initial Tasks
Create a set of orientation tasks in the Task Manager — for example, reviewing the organisation's key policies and acknowledging the compliance framework.

### Step 5 — Set Notification Preferences
The new user should configure their notification preferences in **Settings → Notifications** to ensure they receive relevant alerts.

### Step 6 — Verify Access
Confirm the user can access the sections relevant to their role. If they need access to additional areas, adjust their role or permissions.`,
      },
    ],
  },
  {
    id: "integrations",
    title: "Integration Guides",
    icon: Webhook,
    description: "Overview of planned enterprise integrations; production availability and technical requirements need separate confirmation.",
    sections: [
      {
        id: "int-slack",
        title: "Slack Integration",
        tags: ["slack", "notifications", "integration"],
        content: `## Slack Integration

Slack alert delivery is a planned integration. Configuration screens in the demo do not confirm a production connection or successful delivery.

### Availability and Setup
Before configuring a production workspace or sharing webhook credentials, contact bhousen@regulasync.co.uk to confirm availability, supported events, and an agreed setup and testing process.

### Illustrative Alert Categories
- Compliance issues
- Critical risk items
- Delegations approaching expiry
- Regulatory updates
- Policies due for review

These examples are not a confirmed production event contract.`,
      },
      {
        id: "int-teams",
        title: "Microsoft Teams Integration",
        tags: ["teams", "microsoft", "notifications", "integration"],
        content: `## Microsoft Teams Integration

### Planned Integration
Microsoft Teams notification delivery is planned. Demo configuration fields and test controls are not evidence of a working production connection.

### Availability and Setup
Contact bhousen@regulasync.co.uk to confirm availability, supported Microsoft Teams connection methods, permissions, message formats, and an agreed testing process before configuring production channels.`,
      },
      {
        id: "int-api",
        title: "REST API Integration",
        tags: ["api", "integration", "developer", "rest"],
        content: `## REST API Integration

### Planned Enterprise API
Enterprise API access and outbound webhooks are planned capabilities. Demo API-key and webhook configuration screens do not confirm production endpoint availability or delivery.

### Confirm Before Integration
Contact bhousen@regulasync.co.uk for confirmed availability and an agreed technical specification before connecting production systems or sharing credentials.

### Specification to Agree
- Supported endpoints and authentication requirements
- Permissions, pagination, and response formats
- Webhook events, delivery behaviour, and signature verification
- Rate limits and any service commitments

This overview is not a production API contract or deployment instruction.`,
      },
    ],
  },
];

export default function DocumentationHub() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("admin");

  const filteredDocs = DOCS.map((cat) => ({
    ...cat,
    sections: cat.sections.filter(
      (s) =>
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.content.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some((t) => t.includes(search.toLowerCase()))
    ),
  }));

  const allResults = search ? filteredDocs.flatMap((c) => c.sections.map((s) => ({ ...s, category: c.title }))) : [];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-amber-500" />
          Documentation Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete guides for administrators, compliance managers, auditors, and developers.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documentation..."
          className="pl-9 bg-muted/30 border-border"
        />
      </div>

      {/* Search Results */}
      {search && allResults.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {allResults.length} result{allResults.length !== 1 ? "s" : ""} for "{search}"
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allResults.map((r) => (
              <button
                key={r.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left"
                onClick={() => { setSearch(""); setActiveCategory(DOCS.find((c) => c.sections.some((s) => s.id === r.id))?.id ?? "admin"); }}
              >
                <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.category}</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {r.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {search && allResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No documentation found for "{search}"</p>
        </div>
      )}

      {/* Category Tabs */}
      {!search && (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="bg-muted flex-wrap h-auto gap-1">
            {DOCS.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-1.5">
                <cat.icon className="w-3.5 h-3.5" />
                {cat.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {DOCS.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
              <Accordion type="multiple" className="space-y-2">
                {cat.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id} className="bg-card border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-medium text-foreground">{section.title}</span>
                        <div className="flex gap-1 hidden md:flex">
                          {section.tags.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm prose-invert max-w-none pb-4">
                        {section.content.split("\n").map((line, i) => {
                          if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-foreground mt-4 mb-2">{line.slice(3)}</h2>;
                          if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-amber-400 mt-3 mb-1">{line.slice(4)}</h3>;
                          if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-foreground mt-2">{line.slice(2, -2)}</p>;
                          if (line.startsWith("- ")) return <li key={i} className="text-muted-foreground ml-4 list-disc">{line.slice(2)}</li>;
                          if (line.match(/^\d+\. /)) return <li key={i} className="text-muted-foreground ml-4 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
                          if (line.startsWith("| ")) return null; // skip table rows in simple renderer
                          if (line.startsWith("```")) return null;
                          if (line.startsWith("`") && line.endsWith("`")) return <code key={i} className="bg-muted px-1 rounded text-xs font-mono text-amber-300">{line.slice(1, -1)}</code>;
                          if (line === "") return <br key={i} />;
                          return <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>;
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
