import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Shield, Users, Workflow, Key, Webhook, Settings, ChevronRight } from "lucide-react";

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
Go to Policies → Upload. Import your existing policy documents (PDF, Word, or plain text). The AI will analyse them against your selected frameworks and identify gaps.

**Step 5 — Connect Integrations**
Navigate to Enterprise → Integrations to connect Slack, Microsoft Teams, or configure webhooks for your existing systems.`,
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

RegulaSync offers three subscription tiers:

### Core — £90/month
Ideal for small compliance teams getting started.
- Up to 5 users
- 3 regulatory frameworks (FCA, PRA, ICO)
- Core policy management
- Basic SVAC audit trail
- Email support

### Professional — £175/month
For growing compliance functions.
- Up to 25 users
- Unlimited frameworks
- AI policy drafting
- Predictive risk engine
- Board-ready reports
- Slack/Teams integration
- Priority support

### Enterprise — £350/month
For large regulated firms requiring full capability.
- Unlimited users
- All Professional features
- White-label configuration
- Custom domain
- API access
- Webhooks
- Dedicated account manager
- SLA-backed support

### Upgrading
Contact your account manager or email sales@regulasync.co.uk to upgrade your subscription. Changes take effect within 24 hours.`,
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

White labelling allows you to replace RegulaSync branding with your own for reselling or internal deployment.

### What Gets Branded
- Platform logo and favicon
- Colour scheme (primary, secondary, accent)
- Browser tab title
- Support email address
- Privacy policy and terms of service links
- Custom domain (e.g. compliance.yourfirm.com)

### Setup Steps
1. Navigate to **Enterprise → White Label**
2. Upload your logo (recommended: SVG or PNG, minimum 200×60px)
3. Set your colour scheme using the colour pickers
4. Enter your custom domain (requires DNS CNAME configuration)
5. Toggle **Active** and save

### DNS Configuration
To use a custom domain, add a CNAME record pointing to your RegulaSync instance. Contact support@regulasync.co.uk for the target hostname.

### Reseller Considerations
Each client organisation can have independent white-label settings. Super Admins can configure white-label settings for any organisation from the Global Dashboard.`,
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

Your dashboard provides a real-time overview of your organisation's compliance posture.

### Key Metrics
- **Compliance Score** — Overall percentage of obligations met across all active frameworks
- **Open Risks** — Number of risk items requiring attention, colour-coded by severity
- **Pending Tasks** — Actions assigned to you or your team
- **Policy Status** — Count of policies by status (active, under review, expiring)

### Regulatory Intelligence Feed
The right panel shows the latest regulatory updates from FCA, PRA, ICO, and Bank of England. Each update is AI-analysed to show its potential impact on your organisation.

### Compliance Health Scorecard
The scorecard breaks down compliance by framework, showing which areas are strong and which need attention. Click any framework to drill into specific obligations.

### Notifications
The bell icon in the top navigation shows unread alerts. Critical compliance alerts are also sent to your configured notification channels (Slack, Teams, email).`,
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
The AI Predictive Risk Engine analyses patterns across your compliance data to forecast emerging risks. Navigate to **Risk → Predictive Analysis** to view:
- Trend direction (improving/deteriorating)
- Top predicted risks for the next 90 days
- Recommended pre-emptive actions

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

The audit trail is an immutable record of every action taken on the platform. It cannot be edited or deleted, making it suitable for regulatory submissions.

### What Is Recorded
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
The AI-powered Smart Audit Search understands natural language queries. Try: "Show me all policy approvals by Jane Smith in Q1 2026" or "Find all high-risk items that were closed last month".`,
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
The Regulatory Intelligence Feed will surface the new regulation automatically. You will receive a notification in the platform and optionally via Slack/Teams.

### Step 2 — Assess Impact
Click on the regulatory update to see the AI-generated impact assessment. This shows:
- Which of your existing frameworks are affected
- Which policies may need updating
- Estimated compliance effort

### Step 3 — Run Gap Analysis
Navigate to **Compliance → Gap Analysis** and select the new regulation. The system will compare your current compliance posture against the new requirements and generate a gap report.

### Step 4 — Create an Action Plan
From the gap report, click **Generate Action Plan**. This creates a set of tasks assigned to relevant team members with suggested deadlines.

### Step 5 — Update or Create Policies
For each gap, either update an existing policy or create a new one using the AI Policy Copilot. The copilot is pre-loaded with the regulatory context.

### Step 6 — Approve and Activate
Submit updated policies for approval. Once approved, they become active and the gap is automatically closed.

### Step 7 — Generate Evidence
Export a Board Report or Regulatory Submission report showing your compliance response for the regulator.`,
      },
      {
        id: "journey-audit",
        title: "Preparing for a Regulatory Audit",
        tags: ["workflow", "audit", "regulator", "evidence"],
        content: `## Journey: Preparing for a Regulatory Audit

### Step 1 — Audit Readiness Check
Navigate to **Reports → Audit Readiness**. This generates a checklist of items regulators typically request, with your current status for each.

### Step 2 — Compile Evidence Pack
Use the **Board Report** generator to compile a comprehensive evidence pack. Select the frameworks and date range the regulator is interested in.

### Step 3 — Export Audit Trail
Export the full audit trail for the relevant period as a PDF. This provides an immutable record of all compliance activities.

### Step 4 — Review Open Risks
Ensure all critical and high risks have documented mitigation plans. Regulators will scrutinise unmitigated risks.

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
    description: "Technical guides for connecting RegulaSync to enterprise systems.",
    sections: [
      {
        id: "int-slack",
        title: "Slack Integration",
        tags: ["slack", "notifications", "integration"],
        content: `## Slack Integration

Receive compliance alerts and notifications directly in your Slack workspace.

### Setup
1. In Slack, navigate to **Apps → Manage Apps → Build → Create New App**
2. Choose **From Scratch**, name it "RegulaSync Alerts", select your workspace
3. Under **Incoming Webhooks**, enable and click **Add New Webhook to Workspace**
4. Select the channel (e.g. #compliance-alerts) and authorise
5. Copy the Webhook URL
6. In RegulaSync, go to **Enterprise → Integrations → Notifications → Add Channel**
7. Select **Slack**, paste the webhook URL, and choose which events to subscribe to
8. Click **Test** to send a test message

### Recommended Events
- \`compliance.alert\` — Immediate compliance issues
- \`risk.critical\` — Critical risk items
- \`delegation.expiring\` — Delegations expiring within 7 days
- \`regulatory.update\` — New regulatory updates from FCA/PRA/ICO
- \`policy.pending_review\` — Policies due for review`,
      },
      {
        id: "int-teams",
        title: "Microsoft Teams Integration",
        tags: ["teams", "microsoft", "notifications", "integration"],
        content: `## Microsoft Teams Integration

### Setup via Incoming Webhook
1. In Teams, navigate to the channel where you want notifications
2. Click **...** → **Connectors** → **Incoming Webhook** → **Configure**
3. Name it "RegulaSync" and optionally upload the RegulaSync logo
4. Copy the webhook URL
5. In RegulaSync, go to **Enterprise → Integrations → Notifications → Add Channel**
6. Select **Microsoft Teams**, paste the URL, and select events
7. Click **Test** to verify

### Message Format
RegulaSync sends Adaptive Cards to Teams, which display rich formatted messages with action buttons where applicable.`,
      },
      {
        id: "int-api",
        title: "REST API Integration",
        tags: ["api", "integration", "developer", "rest"],
        content: `## REST API Integration

### Authentication
All API requests require a Bearer token. Generate API keys from **Enterprise → Integrations → API Keys**.

\`\`\`bash
curl https://your-domain.com/api/v1/frameworks \\
  -H "Authorization: Bearer rsk_live_your_key_here" \\
  -H "Content-Type: application/json"
\`\`\`

### Pagination
All list endpoints support \`limit\` and \`offset\` parameters. The response includes a \`total\` field for calculating page count.

### Webhooks for Real-Time Events
Instead of polling the API, use webhooks to receive events as they happen. See the Webhooks section in Enterprise → Integrations.

### Webhook Signature Verification
All webhook payloads include an \`X-RegulaSync-Signature\` header. Verify it using your webhook secret:

\`\`\`javascript
const crypto = require('crypto');
const signature = req.headers['x-regulasync-signature'];
const expected = 'sha256=' + crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(req.body))
  .digest('hex');
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature), Buffer.from(expected)
);
\`\`\`

### Rate Limits
| Tier | Requests/Minute |
|---|---|
| Core | 60 |
| Professional | 300 |
| Enterprise | 1,000 |

Rate limit headers are included in every response: \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`.`,
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
