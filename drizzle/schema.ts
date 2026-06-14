import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 256 }),
  authMethod: varchar("authMethod", { length: 64 }).default("password"),
  role: mysqlEnum("role", ["super_admin", "company_admin", "compliance_manager", "department_user", "auditor", "user", "admin"]).default("department_user").notNull(),
  department: varchar("department", { length: 128 }),
  jobTitle: varchar("jobTitle", { length: 128 }),
  organizationId: int("organizationId"),
  isActive: boolean("isActive").default(true).notNull(),
  invitedBy: int("invitedBy"),
  inviteToken: varchar("inviteToken", { length: 128 }),
  inviteTokenExpiry: timestamp("inviteTokenExpiry"),
  passwordResetToken: varchar("passwordResetToken", { length: 128 }),
  passwordResetExpiry: timestamp("passwordResetExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Policies - Core governance policies
 */
export const policies = mysqlTable("policies", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "compliance",
    "risk_management",
    "data_protection",
    "financial",
    "operational",
    "hr",
    "it_security",
    "environmental"
  ]).notNull(),
  status: mysqlEnum("status", ["draft", "pending_review", "approved", "active", "archived"]).default("draft").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  effectiveDate: timestamp("effectiveDate"),
  reviewDate: timestamp("reviewDate"),
  ownerId: int("ownerId").references(() => users.id),
  departmentScope: varchar("departmentScope", { length: 256 }),
  complianceScore: int("complianceScore").default(0),
  automationEnabled: boolean("automationEnabled").default(false),
  automationRules: json("automationRules"),
  version: int("version").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = typeof policies.$inferInsert;

/**
 * Delegation of Authority - Authority matrix and approval chains
 */
export const delegationAuthority = mysqlTable("delegation_authority", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  authorityType: mysqlEnum("authorityType", [
    "financial",
    "operational",
    "contractual",
    "hr",
    "procurement",
    "compliance"
  ]).notNull(),
  delegatorId: int("delegatorId").references(() => users.id),
  delegateeId: int("delegateeId").references(() => users.id),
  thresholdAmount: decimal("thresholdAmount", { precision: 15, scale: 2 }),
  thresholdCurrency: varchar("thresholdCurrency", { length: 3 }).default("GBP"),
  conditions: text("conditions"),
  status: mysqlEnum("status", ["active", "pending", "expired", "revoked"]).default("pending").notNull(),
  effectiveFrom: timestamp("effectiveFrom"),
  effectiveTo: timestamp("effectiveTo"),
  approvalChain: json("approvalChain"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DelegationAuthority = typeof delegationAuthority.$inferSelect;
export type InsertDelegationAuthority = typeof delegationAuthority.$inferInsert;

/**
 * Approval Requests - Pending approvals in the workflow
 */
export const approvalRequests = mysqlTable("approval_requests", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  requestType: mysqlEnum("requestType", [
    "policy_approval",
    "delegation_approval",
    "expense_approval",
    "contract_approval",
    "compliance_exception"
  ]).notNull(),
  requesterId: int("requesterId").references(() => users.id),
  approverId: int("approverId").references(() => users.id),
  relatedPolicyId: int("relatedPolicyId").references(() => policies.id),
  relatedDelegationId: int("relatedDelegationId").references(() => delegationAuthority.id),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "escalated"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  dueDate: timestamp("dueDate"),
  approvedAt: timestamp("approvedAt"),
  rejectedAt: timestamp("rejectedAt"),
  comments: text("comments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type InsertApprovalRequest = typeof approvalRequests.$inferInsert;

/**
 * Compliance Records - Track compliance status across departments
 */
export const complianceRecords = mysqlTable("compliance_records", {
  id: int("id").autoincrement().primaryKey(),
  policyId: int("policyId").references(() => policies.id),
  department: varchar("department", { length: 128 }).notNull(),
  complianceStatus: mysqlEnum("complianceStatus", ["compliant", "partial", "non_compliant", "pending_review"]).default("pending_review").notNull(),
  score: int("score").default(0),
  lastAssessmentDate: timestamp("lastAssessmentDate"),
  nextAssessmentDate: timestamp("nextAssessmentDate"),
  findings: text("findings"),
  remediation: text("remediation"),
  assessorId: int("assessorId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type InsertComplianceRecord = typeof complianceRecords.$inferInsert;

/**
 * Audit Trail - Immutable audit log (Self-Validating Audit Cache)
 */
export const auditTrail = mysqlTable("audit_trail", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: int("entityId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete", "approve", "reject", "view", "export"]).notNull(),
  userId: int("userId").references(() => users.id),
  userName: varchar("userName", { length: 256 }),
  previousValue: json("previousValue"),
  newValue: json("newValue"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  hashValue: varchar("hashValue", { length: 64 }),
  previousHashValue: varchar("previousHashValue", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditTrail = typeof auditTrail.$inferSelect;
export type InsertAuditTrail = typeof auditTrail.$inferInsert;

/**
 * AI Recommendations - AI-generated governance suggestions
 */
export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "risk_alert",
    "compliance_suggestion",
    "policy_update",
    "efficiency_improvement",
    "regulatory_change"
  ]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  relatedPolicyId: int("relatedPolicyId").references(() => policies.id),
  relatedDepartment: varchar("relatedDepartment", { length: 128 }),
  status: mysqlEnum("status", ["new", "acknowledged", "implemented", "dismissed"]).default("new").notNull(),
  confidenceScore: int("confidenceScore").default(0),
  actionItems: json("actionItems"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;

/**
 * Regulatory Updates - Track regulatory changes and their impact
 */
export const regulatoryUpdates = mysqlTable("regulatory_updates", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  summary: text("summary"),
  source: varchar("source", { length: 256 }),
  sourceUrl: text("sourceUrl"),
  regulatoryBody: varchar("regulatoryBody", { length: 128 }),
  jurisdiction: varchar("jurisdiction", { length: 64 }).default("UK"),
  effectiveDate: timestamp("effectiveDate"),
  impactLevel: mysqlEnum("impactLevel", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  affectedPolicies: json("affectedPolicies"),
  status: mysqlEnum("status", ["new", "under_review", "action_required", "implemented", "not_applicable"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RegulatoryUpdate = typeof regulatoryUpdates.$inferSelect;
export type InsertRegulatoryUpdate = typeof regulatoryUpdates.$inferInsert;

/**
 * Departments - Organization structure
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  description: text("description"),
  headId: int("headId").references(() => users.id),
  parentId: int("parentId"),
  complianceScore: int("complianceScore").default(0),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).default("low").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Demo Requests - Leads from landing page
 */
export const demoRequests = mysqlTable("demo_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "closed"]).default("new").notNull(),
  source: varchar("source", { length: 64 }).default("website"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoRequest = typeof demoRequests.$inferInsert;

/**
 * Contact Submissions - CRM for contact form inquiries
 */
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 256 }),
  phone: varchar("phone", { length: 32 }),
  inquiryType: mysqlEnum("inquiryType", [
    "demo",
    "pricing",
    "partnership",
    "support",
    "general",
    "media"
  ]).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied", "resolved", "archived"]).default("new").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  assignedTo: int("assignedTo").references(() => users.id),
  notes: text("notes"),
  repliedAt: timestamp("repliedAt"),
  resolvedAt: timestamp("resolvedAt"),
  source: varchar("source", { length: 64 }).default("contact_page"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;


/**
 * Policy-Regulation Mapping - Links policies to regulatory updates with gap analysis
 */
export const policyRegulationMapping = mysqlTable("policy_reg_mapping", {
  id: int("id").autoincrement().primaryKey(),
  policyId: int("policyId").references(() => policies.id).notNull(),
  regUpdateId: int("regUpdateId").references(() => regulatoryUpdates.id).notNull(),
  mappingType: mysqlEnum("mappingType", [
    "gap_identified",
    "compliant",
    "partially_compliant",
    "not_applicable",
    "pending_review"
  ]).default("pending_review").notNull(),
  gapDescription: text("gapDescription"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]),
  status: mysqlEnum("status", ["pending_review", "in_progress", "resolved", "dismissed"]).default("pending_review").notNull(),
  confidenceScore: int("confidenceScore").default(0),
  aiAnalysis: json("aiAnalysis"),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PolicyRegulationMapping = typeof policyRegulationMapping.$inferSelect;
export type InsertPolicyRegulationMapping = typeof policyRegulationMapping.$inferInsert;

/**
 * Notifications - User notifications for reminders and alerts
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", [
    "reminder",
    "alert",
    "info",
    "warning",
    "success"
  ]).default("info").notNull(),
  category: mysqlEnum("category", [
    "deadline",
    "compliance",
    "policy",
    "regulatory",
    "system"
  ]).default("system").notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 64 }),
  relatedEntityId: int("relatedEntityId"),
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  actionUrl: varchar("actionUrl", { length: 512 }),
  scheduledFor: timestamp("scheduledFor"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Reminders - Scheduled reminders for deadlines and events
 */
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  reminderType: mysqlEnum("reminderType", ["email", "notification", "both"]).default("both").notNull(),
  triggerAt: timestamp("triggerAt").notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 64 }),
  relatedEntityId: int("relatedEntityId"),
  status: mysqlEnum("status", ["pending", "sent", "cancelled"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Policy Versions - Track policy version history
 */
export const policyVersions = mysqlTable("policy_versions", {
  id: int("id").autoincrement().primaryKey(),
  policyId: int("policyId").references(() => policies.id).notNull(),
  versionNumber: int("versionNumber").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  content: text("content"),
  changesSummary: text("changesSummary"),
  documentUrl: text("documentUrl"),
  changedBy: int("changedBy").references(() => users.id),
  status: mysqlEnum("status", ["draft", "pending_review", "approved", "active", "archived"]).notNull(),
  approvedBy: int("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PolicyVersion = typeof policyVersions.$inferSelect;
export type InsertPolicyVersion = typeof policyVersions.$inferInsert;


/**
 * Subscriptions - Stripe subscription management
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 256 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 256 }),
  stripePriceId: varchar("stripePriceId", { length: 256 }),
  plan: mysqlEnum("plan", ["core", "professional", "enterprise"]).default("core").notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  trialEnd: timestamp("trialEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Payment History - Track all payments
 */
export const paymentHistory = mysqlTable("payment_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 256 }),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  status: mysqlEnum("status", ["succeeded", "failed", "pending", "refunded"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof paymentHistory.$inferInsert;

/**
 * Organizations - Multi-tenant support
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  industry: varchar("industry", { length: 128 }),
  size: mysqlEnum("size", ["1-10", "11-50", "51-200", "201-500", "500+"]),
  plan: mysqlEnum("plan", ["core", "professional", "enterprise"]).default("core").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 256 }),
  ownerId: int("ownerId").references(() => users.id),
  settings: json("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * API Keys - For external integrations
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  keyHash: varchar("keyHash", { length: 256 }).notNull(),
  keyPrefix: varchar("keyPrefix", { length: 16 }).notNull(),
  permissions: json("permissions"),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Webhook Logs - Track webhook deliveries
 */
export const webhookLogs = mysqlTable("webhook_logs", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 128 }).notNull(),
  payload: json("payload"),
  status: mysqlEnum("status", ["received", "processed", "failed"]).notNull(),
  errorMessage: text("errorMessage"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

/**
 * Vendor Risk Management (TPRM) - Third-party vendor compliance tracking
 */
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  website: varchar("website", { length: 512 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactName: varchar("contactName", { length: 256 }),
  industry: varchar("industry", { length: 128 }),
  country: varchar("country", { length: 128 }).default("United Kingdom"),
  riskTier: mysqlEnum("riskTier", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  overallRiskScore: int("overallRiskScore").default(0),
  status: mysqlEnum("status", ["active", "under_review", "suspended", "offboarded"]).default("active").notNull(),
  lastAssessedAt: timestamp("lastAssessedAt"),
  nextReviewDate: timestamp("nextReviewDate"),
  notes: text("notes"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * Vendor Assessments - Questionnaire responses and scores
 */
export const vendorAssessments = mysqlTable("vendor_assessments", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").references(() => vendors.id).notNull(),
  assessedBy: int("assessedBy").references(() => users.id),
  questionnaire: json("questionnaire"),
  responses: json("responses"),
  aiScore: int("aiScore"),
  aiSummary: text("aiSummary"),
  riskFindings: json("riskFindings"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "expired"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type VendorAssessment = typeof vendorAssessments.$inferSelect;
export type InsertVendorAssessment = typeof vendorAssessments.$inferInsert;

/**
 * Evidence Collection - Automated compliance evidence
 */
export const evidenceItems = mysqlTable("evidence_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  evidenceType: mysqlEnum("evidenceType", [
    "access_log", "training_certificate", "policy_acknowledgment",
    "audit_report", "test_result", "screenshot", "document", "api_response"
  ]).notNull(),
  source: mysqlEnum("source", ["manual", "microsoft365", "google_workspace", "aws", "api", "automated"]).default("manual").notNull(),
  relatedPolicyId: int("relatedPolicyId").references(() => policies.id),
  relatedControlId: varchar("relatedControlId", { length: 128 }),
  fileUrl: text("fileUrl"),
  fileHash: varchar("fileHash", { length: 256 }),
  collectedBy: int("collectedBy").references(() => users.id),
  verifiedBy: int("verifiedBy").references(() => users.id),
  verifiedAt: timestamp("verifiedAt"),
  expiresAt: timestamp("expiresAt"),
  metadata: json("metadata"),
  status: mysqlEnum("status", ["collected", "verified", "expired", "rejected"]).default("collected").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EvidenceItem = typeof evidenceItems.$inferSelect;
export type InsertEvidenceItem = typeof evidenceItems.$inferInsert;

/**
 * Peer Benchmarking - Anonymous compliance score comparisons
 */
export const benchmarkSnapshots = mysqlTable("benchmark_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id),
  industry: varchar("industry", { length: 128 }).notNull(),
  orgSize: mysqlEnum("orgSize", ["1-10", "11-50", "51-200", "201-500", "500+"]).notNull(),
  overallScore: int("overallScore").notNull(),
  policyScore: int("policyScore"),
  auditScore: int("auditScore"),
  riskScore: int("riskScore"),
  complianceScore: int("complianceScore"),
  anonymizedId: varchar("anonymizedId", { length: 64 }).notNull(),
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BenchmarkSnapshot = typeof benchmarkSnapshots.$inferSelect;
export type InsertBenchmarkSnapshot = typeof benchmarkSnapshots.$inferInsert;

/**
 * AI Explainability Logs - XAI audit trail for every AI recommendation
 */
export const aiExplainabilityLogs = mysqlTable("ai_explainability_logs", {
  id: int("id").autoincrement().primaryKey(),
  recommendationId: int("recommendationId").references(() => aiRecommendations.id),
  policyId: int("policyId").references(() => policies.id),
  regulatoryUpdateId: int("regulatoryUpdateId"),
  modelUsed: varchar("modelUsed", { length: 128 }),
  inputContext: text("inputContext"),
  regulatoryReferences: json("regulatoryReferences"),
  policyClausesAnalyzed: json("policyClausesAnalyzed"),
  confidenceScore: int("confidenceScore"),
  reasoning: text("reasoning"),
  decisionFactors: json("decisionFactors"),
  alternativesConsidered: json("alternativesConsidered"),
  humanReviewRequired: boolean("humanReviewRequired").default(false),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiExplainabilityLog = typeof aiExplainabilityLogs.$inferSelect;
export type InsertAiExplainabilityLog = typeof aiExplainabilityLogs.$inferInsert;

/**
 * Compliance Passports - Exportable proof of compliance status
 */
export const compliancePassports = mysqlTable("compliance_passports", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id),
  issuedTo: int("issuedTo").references(() => users.id),
  passportHash: varchar("passportHash", { length: 256 }).notNull().unique(),
  overallScore: int("overallScore").notNull(),
  frameworks: json("frameworks"),
  certifications: json("certifications"),
  validFrom: timestamp("validFrom").defaultNow().notNull(),
  validUntil: timestamp("validUntil").notNull(),
  status: mysqlEnum("status", ["active", "expired", "revoked"]).default("active").notNull(),
  accessLog: json("accessLog"),
  sharedWith: json("sharedWith"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CompliancePassport = typeof compliancePassports.$inferSelect;
export type InsertCompliancePassport = typeof compliancePassports.$inferInsert;

/**
 * ESG Tracking - Environmental, Social, Governance metrics
 */
export const esgMetrics = mysqlTable("esg_metrics", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id),
  reportingPeriod: varchar("reportingPeriod", { length: 32 }).notNull(),
  category: mysqlEnum("category", ["environmental", "social", "governance"]).notNull(),
  metricName: varchar("metricName", { length: 256 }).notNull(),
  metricValue: varchar("metricValue", { length: 256 }),
  unit: varchar("unit", { length: 64 }),
  target: varchar("target", { length: 256 }),
  status: mysqlEnum("status", ["on_track", "at_risk", "off_track", "achieved"]).default("on_track").notNull(),
  regulatoryFramework: varchar("regulatoryFramework", { length: 128 }),
  evidenceUrl: text("evidenceUrl"),
  notes: text("notes"),
  recordedBy: int("recordedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EsgMetric = typeof esgMetrics.$inferSelect;
export type InsertEsgMetric = typeof esgMetrics.$inferInsert;

/**
 * Incident Simulations - Digital twin stress tests
 */
export const incidentSimulations = mysqlTable("incident_simulations", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  scenarioType: mysqlEnum("scenarioType", [
    "data_breach", "regulatory_change", "system_outage",
    "fraud_incident", "third_party_failure", "cyber_attack", "staff_misconduct"
  ]).notNull(),
  description: text("description"),
  triggeredBy: int("triggeredBy").references(() => users.id),
  affectedPolicies: json("affectedPolicies"),
  simulatedImpact: json("simulatedImpact"),
  aiAnalysis: text("aiAnalysis"),
  estimatedFine: varchar("estimatedFine", { length: 128 }),
  notificationRequirements: json("notificationRequirements"),
  remediationSteps: json("remediationSteps"),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type IncidentSimulation = typeof incidentSimulations.$inferSelect;
export type InsertIncidentSimulation = typeof incidentSimulations.$inferInsert;

/**
 * Regulator Portal Access - Read-only regulator view grants
 */
export const regulatorPortalAccess = mysqlTable("regulator_portal_access", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id),
  regulatorName: varchar("regulatorName", { length: 256 }).notNull(),
  regulatorEmail: varchar("regulatorEmail", { length: 320 }),
  accessToken: varchar("accessToken", { length: 256 }).notNull().unique(),
  accessScope: json("accessScope"),
  grantedBy: int("grantedBy").references(() => users.id),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  lastAccessedAt: timestamp("lastAccessedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RegulatorPortalAccess = typeof regulatorPortalAccess.$inferSelect;
export type InsertRegulatorPortalAccess = typeof regulatorPortalAccess.$inferInsert;

/**
 * University Partnerships - Academic program management
 */
export const universityPartnerships = mysqlTable("university_partnerships", {
  id: int("id").autoincrement().primaryKey(),
  institutionName: varchar("institutionName", { length: 256 }).notNull(),
  contactName: varchar("contactName", { length: 256 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  country: varchar("country", { length: 128 }).default("United Kingdom"),
  programType: mysqlEnum("programType", ["student_access", "research", "curriculum", "internship"]).default("student_access").notNull(),
  studentSeats: int("studentSeats").default(0),
  status: mysqlEnum("status", ["pending", "active", "expired", "suspended"]).default("pending").notNull(),
  agreementUrl: text("agreementUrl"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UniversityPartnership = typeof universityPartnerships.$inferSelect;
export type InsertUniversityPartnership = typeof universityPartnerships.$inferInsert;

/**
 * Platform Settings - Dynamic, admin-controlled platform configuration
 */
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 128 }).notNull().unique(),
  settingValue: text("settingValue"),
  settingType: mysqlEnum("settingType", ["string", "boolean", "number", "json"]).default("string").notNull(),
  category: varchar("category", { length: 64 }),
  description: text("description"),
  isPublic: boolean("isPublic").default(false),
  updatedBy: int("updatedBy").references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;

/**
 * Agentic AI Tasks - Autonomous remediation task tracking
 */
export const agenticTasks = mysqlTable("agentic_tasks", {
  id: int("id").autoincrement().primaryKey(),
  taskType: mysqlEnum("taskType", [
    "policy_draft", "policy_update", "gap_remediation",
    "evidence_collection", "report_generation", "notification_send"
  ]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  triggeredBy: mysqlEnum("triggeredBy", ["ai_recommendation", "regulatory_update", "manual", "scheduled"]).notNull(),
  sourceId: int("sourceId"),
  sourceType: varchar("sourceType", { length: 64 }),
  assignedTo: int("assignedTo").references(() => users.id),
  aiGeneratedContent: text("aiGeneratedContent"),
  status: mysqlEnum("status", ["queued", "in_progress", "awaiting_approval", "approved", "rejected", "completed", "failed"]).default("queued").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  approvedBy: int("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgenticTask = typeof agenticTasks.$inferSelect;
export type InsertAgenticTask = typeof agenticTasks.$inferInsert;

/**
 * Feature Flags — Per-organisation feature toggles by subscription tier
 */
export const featureFlags = mysqlTable("feature_flags", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 256 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(),
  defaultEnabled: boolean("defaultEnabled").default(false).notNull(),
  starterEnabled: boolean("starterEnabled").default(false).notNull(),
  professionalEnabled: boolean("professionalEnabled").default(true).notNull(),
  enterpriseEnabled: boolean("enterpriseEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * Org Feature Flag Overrides — Super admin can override per org
 */
export const orgFeatureFlags = mysqlTable("org_feature_flags", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id).notNull(),
  flagKey: varchar("flagKey", { length: 128 }).notNull(),
  enabled: boolean("enabled").notNull(),
  overriddenBy: int("overriddenBy").references(() => users.id),
  overriddenAt: timestamp("overriddenAt").defaultNow().notNull(),
});
export type OrgFeatureFlag = typeof orgFeatureFlags.$inferSelect;
export type InsertOrgFeatureFlag = typeof orgFeatureFlags.$inferInsert;

/**
 * Outbound Webhooks — Per-org webhook endpoints for enterprise integrations
 */
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id).notNull(),
  label: varchar("label", { length: 256 }).notNull(),
  url: text("url").notNull(),
  secret: varchar("secret", { length: 256 }).notNull(),
  events: json("events").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  lastStatusCode: int("lastStatusCode"),
  failureCount: int("failureCount").default(0),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Webhook Delivery Log — Track every outbound webhook attempt
 */
export const webhookDeliveries = mysqlTable("webhook_deliveries", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: int("webhookId").references(() => webhooks.id).notNull(),
  eventType: varchar("eventType", { length: 128 }).notNull(),
  payload: json("payload"),
  statusCode: int("statusCode"),
  responseBody: text("responseBody"),
  durationMs: int("durationMs"),
  success: boolean("success").default(false).notNull(),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = typeof webhookDeliveries.$inferInsert;

/**
 * User Sessions — Track active sessions for session management
 */
export const userSessions = mysqlTable("user_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  sessionToken: varchar("sessionToken", { length: 256 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  deviceType: varchar("deviceType", { length: 64 }),
  location: varchar("location", { length: 256 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

/**
 * 2FA Secrets — TOTP secrets for two-factor authentication
 */
export const twoFactorSecrets = mysqlTable("two_factor_secrets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  secret: varchar("secret", { length: 256 }).notNull(),
  backupCodes: json("backupCodes"),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TwoFactorSecret = typeof twoFactorSecrets.$inferSelect;
export type InsertTwoFactorSecret = typeof twoFactorSecrets.$inferInsert;

/**
 * White Label Config — Per-org branding for white-label reselling
 */
export const whiteLabelConfigs = mysqlTable("white_label_configs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id).notNull().unique(),
  brandName: varchar("brandName", { length: 256 }),
  logoUrl: text("logoUrl"),
  faviconUrl: text("faviconUrl"),
  primaryColor: varchar("primaryColor", { length: 32 }).default("#b87333"),
  secondaryColor: varchar("secondaryColor", { length: 32 }).default("#1e293b"),
  accentColor: varchar("accentColor", { length: 32 }).default("#f59e0b"),
  customDomain: varchar("customDomain", { length: 256 }),
  supportEmail: varchar("supportEmail", { length: 320 }),
  privacyPolicyUrl: text("privacyPolicyUrl"),
  termsUrl: text("termsUrl"),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WhiteLabelConfig = typeof whiteLabelConfigs.$inferSelect;
export type InsertWhiteLabelConfig = typeof whiteLabelConfigs.$inferInsert;

/**
 * Onboarding Progress — Track org setup wizard completion
 */
export const onboardingProgress = mysqlTable("onboarding_progress", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id).notNull().unique(),
  userId: int("userId").references(() => users.id).notNull(),
  step1OrgProfile: boolean("step1OrgProfile").default(false).notNull(),
  step2InviteTeam: boolean("step2InviteTeam").default(false).notNull(),
  step3ConfigureFrameworks: boolean("step3ConfigureFrameworks").default(false).notNull(),
  step4UploadPolicies: boolean("step4UploadPolicies").default(false).notNull(),
  step5ConnectIntegrations: boolean("step5ConnectIntegrations").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

/**
 * Notification Integrations — Slack / Teams / Email config per org
 */
export const notificationIntegrations = mysqlTable("notification_integrations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id).notNull(),
  type: mysqlEnum("type", ["slack", "teams", "email", "pagerduty"]).notNull(),
  label: varchar("label", { length: 256 }).notNull(),
  webhookUrl: text("webhookUrl"),
  config: json("config"),
  events: json("events"),
  isActive: boolean("isActive").default(true).notNull(),
  lastTestedAt: timestamp("lastTestedAt"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NotificationIntegration = typeof notificationIntegrations.$inferSelect;
export type InsertNotificationIntegration = typeof notificationIntegrations.$inferInsert;

/**
 * Org API Keys — Machine-to-machine API keys per organisation
 */
export const orgApiKeys = mysqlTable("org_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id).notNull(),
  label: varchar("label", { length: 256 }).notNull(),
  keyPrefix: varchar("keyPrefix", { length: 16 }).notNull(),
  keyHash: varchar("keyHash", { length: 256 }).notNull(),
  permissions: json("permissions"),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrgApiKey = typeof orgApiKeys.$inferSelect;
export type InsertOrgApiKey = typeof orgApiKeys.$inferInsert;
