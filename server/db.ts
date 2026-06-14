import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  policies, 
  delegationAuthority,
  approvalRequests,
  complianceRecords, 
  auditTrail, 
  regulatoryUpdates,
  aiRecommendations,
  departments,
  demoRequests,
  contactSubmissions,
  InsertPolicy,
  InsertDelegationAuthority,
  InsertApprovalRequest,
  InsertComplianceRecord,
  InsertAuditTrail,
  InsertRegulatoryUpdate,
  InsertAIRecommendation,
  InsertDepartment,
  InsertDemoRequest,
  InsertContactSubmission
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// User functions
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "authMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Policy functions
export async function getPolicies() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(policies).orderBy(desc(policies.updatedAt));
  return result;
}

export async function getPolicyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(policies).where(eq(policies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPolicy(policy: InsertPolicy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(policies).values(policy);
  return result;
}

export async function updatePolicy(id: number, policy: Partial<InsertPolicy>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(policies).set({ ...policy, updatedAt: new Date() }).where(eq(policies.id, id));
}

// Delegation Authority functions
export async function getDelegations() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(delegationAuthority).orderBy(desc(delegationAuthority.createdAt));
  return result;
}

export async function getDelegationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(delegationAuthority).where(eq(delegationAuthority.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDelegation(delegation: InsertDelegationAuthority) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(delegationAuthority).values(delegation);
  return result;
}

export async function updateDelegation(id: number, delegation: Partial<InsertDelegationAuthority>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(delegationAuthority).set({ ...delegation, updatedAt: new Date() }).where(eq(delegationAuthority.id, id));
}

// Approval Request functions
export async function getApprovalRequests() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(approvalRequests).orderBy(desc(approvalRequests.createdAt));
  return result;
}

export async function createApprovalRequest(request: InsertApprovalRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(approvalRequests).values(request);
  return result;
}

export async function updateApprovalRequest(id: number, request: Partial<InsertApprovalRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(approvalRequests).set({ ...request, updatedAt: new Date() }).where(eq(approvalRequests.id, id));
}

// Compliance functions
export async function getComplianceRecords() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(complianceRecords).orderBy(desc(complianceRecords.lastAssessmentDate));
  return result;
}

export async function createComplianceRecord(record: InsertComplianceRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(complianceRecords).values(record);
  return result;
}

export async function updateComplianceRecord(id: number, record: Partial<InsertComplianceRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(complianceRecords).set({ ...record, updatedAt: new Date() }).where(eq(complianceRecords.id, id));
}

// Audit Trail functions - Self-Validating Audit Cache
import { 
  createAuditEntryWithHash, 
  verifyAuditChain, 
  getAuditEntryWithVerification,
  getChainStatistics,
  exportAuditTrailWithVerification,
  ChainVerificationResult 
} from './auditCache';

export async function getAuditTrail(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(auditTrail).orderBy(desc(auditTrail.createdAt)).limit(limit);
  return result;
}

export async function createAuditEntry(entry: InsertAuditTrail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Use the hash-based audit entry creation
  const result = await createAuditEntryWithHash(db, entry);
  return result;
}

// Verify the entire audit chain integrity
export async function verifyAuditChainIntegrity(): Promise<ChainVerificationResult> {
  const db = await getDb();
  if (!db) {
    return {
      valid: false,
      totalEntries: 0,
      verifiedEntries: 0,
      invalidEntries: [],
      verificationTime: 0,
      chainIntegrity: 'empty',
    };
  }
  
  return await verifyAuditChain(db);
}

// Get a single audit entry with its verification status
export async function getAuditEntryVerified(entryId: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await getAuditEntryWithVerification(db, entryId);
}

// Get audit chain statistics
export async function getAuditStatistics() {
  const db = await getDb();
  if (!db) {
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
      actionsBreakdown: {},
      entitiesBreakdown: {},
    };
  }
  
  return await getChainStatistics(db);
}

// Export audit trail with verification for compliance reports
export async function exportAuditTrailVerified() {
  const db = await getDb();
  if (!db) {
    return {
      entries: [],
      chainIntegrity: 'empty' as const,
      exportedAt: new Date().toISOString(),
      verificationHash: '',
    };
  }
  
  return await exportAuditTrailWithVerification(db);
}

// Regulatory updates functions
export async function getRegulatoryUpdates() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(regulatoryUpdates).orderBy(desc(regulatoryUpdates.createdAt));
  return result;
}

export async function createRegulatoryUpdate(update: InsertRegulatoryUpdate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(regulatoryUpdates).values(update);
  return result;
}

export async function updateRegulatoryUpdate(id: number, update: Partial<InsertRegulatoryUpdate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(regulatoryUpdates).set({ ...update, updatedAt: new Date() }).where(eq(regulatoryUpdates.id, id));
}

// AI Recommendations functions
export async function getAIRecommendations() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(aiRecommendations).orderBy(desc(aiRecommendations.createdAt));
  return result;
}

export async function createAIRecommendation(recommendation: InsertAIRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiRecommendations).values(recommendation);
  return result;
}

export async function updateAIRecommendation(id: number, recommendation: Partial<InsertAIRecommendation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(aiRecommendations).set({ ...recommendation, updatedAt: new Date() }).where(eq(aiRecommendations.id, id));
}

// Department functions
export async function getDepartments() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(departments).orderBy(departments.name);
  return result;
}

export async function createDepartment(department: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(departments).values(department);
  return result;
}

// Dashboard statistics
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalPolicies: 0,
      activePolicies: 0,
      pendingReviews: 0,
      complianceScore: 0,
      totalDelegations: 0,
      activeDelegations: 0,
      openRecommendations: 0,
      criticalAlerts: 0,
    };
  }
  
  const [policyStats] = await db.select({
    total: sql<number>`count(*)`,
    active: sql<number>`sum(case when status = 'active' then 1 else 0 end)`,
    pending: sql<number>`sum(case when status = 'pending_review' then 1 else 0 end)`,
  }).from(policies);
  
  const [delegationStats] = await db.select({
    total: sql<number>`count(*)`,
    active: sql<number>`sum(case when status = 'active' then 1 else 0 end)`,
  }).from(delegationAuthority);
  
  const [complianceStats] = await db.select({
    avgScore: sql<number>`avg(score)`,
  }).from(complianceRecords);
  
  const [recommendationStats] = await db.select({
    open: sql<number>`sum(case when status = 'new' then 1 else 0 end)`,
    critical: sql<number>`sum(case when priority = 'critical' and status = 'new' then 1 else 0 end)`,
  }).from(aiRecommendations);
  
  return {
    totalPolicies: policyStats?.total || 0,
    activePolicies: policyStats?.active || 0,
    pendingReviews: policyStats?.pending || 0,
    complianceScore: Math.round(complianceStats?.avgScore || 0),
    totalDelegations: delegationStats?.total || 0,
    activeDelegations: delegationStats?.active || 0,
    openRecommendations: recommendationStats?.open || 0,
    criticalAlerts: recommendationStats?.critical || 0,
  };
}

// Demo Request functions
export async function createDemoRequest(request: InsertDemoRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(demoRequests).values(request);
  return { id: Number(result[0].insertId) };
}

export async function getDemoRequests() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(demoRequests).orderBy(desc(demoRequests.createdAt));
  return result;
}


// Notification functions (demo mode - returns mock data)
export async function getNotifications(userId: number) {
  // Return mock notifications for demo
  return [
    {
      id: 1,
      userId,
      title: "FCA Filing Due in 5 Days",
      message: "Your quarterly FCA regulatory filing is due on January 6, 2026",
      type: "regulatory_deadline",
      priority: "critical",
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    },
    {
      id: 2,
      userId,
      title: "Policy Review Required",
      message: "Data Protection Policy requires annual review",
      type: "policy_update",
      priority: "high",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 3,
      userId,
      title: "Annual Risk Assessment Due",
      message: "Complete your annual risk assessment by January 15, 2026",
      type: "compliance_alert",
      priority: "high",
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
  ];
}

export async function markNotificationAsRead(notificationId: number) {
  // Demo mode - just return success
  return { success: true, id: notificationId };
}

export async function markAllNotificationsAsRead(userId: number) {
  // Demo mode - just return success
  return { success: true, userId };
}

export async function getNotificationPreferences(userId: number) {
  // Return default preferences for demo
  return {
    userId,
    emailAlerts: true,
    inAppAlerts: true,
    regulatoryDeadlines: true,
    policyUpdates: true,
    complianceAlerts: true,
    weeklyDigest: true,
  };
}

export async function updateNotificationPreferences(userId: number, preferences: {
  emailAlerts?: boolean;
  inAppAlerts?: boolean;
  regulatoryDeadlines?: boolean;
  policyUpdates?: boolean;
  complianceAlerts?: boolean;
  weeklyDigest?: boolean;
}) {
  // Demo mode - just return the updated preferences
  return {
    userId,
    ...preferences,
  };
}

// Contact Form functions
export async function createContactSubmission(submission: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  inquiryType: "demo" | "pricing" | "partnership" | "support" | "general" | "media";
  subject: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) {
    // Demo mode - return mock response
    console.log("[Contact] Demo mode - submission logged:", submission.email);
    return { id: Date.now(), success: true };
  }
  
  try {
    const result = await db.insert(contactSubmissions).values({
      name: submission.name,
      email: submission.email,
      company: submission.company || null,
      phone: submission.phone || null,
      inquiryType: submission.inquiryType,
      subject: submission.subject,
      message: submission.message,
      status: "new",
      priority: submission.inquiryType === "demo" ? "high" : "medium",
      source: "contact_page",
      ipAddress: submission.ipAddress || null,
      userAgent: submission.userAgent || null,
    });
    return { id: Number(result[0].insertId), success: true };
  } catch (error) {
    console.error("[Contact] Failed to save submission:", error);
    throw error;
  }
}

export async function getContactSubmissions(options?: {
  status?: "new" | "read" | "replied" | "resolved" | "archived";
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(contactSubmissions);
  
  if (options?.status) {
    query = query.where(eq(contactSubmissions.status, options.status)) as typeof query;
  }
  
  const result = await query
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(options?.limit || 100);
  
  return result;
}

export async function getContactSubmissionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateContactSubmission(id: number, updates: {
  status?: "new" | "read" | "replied" | "resolved" | "archived";
  priority?: "low" | "medium" | "high";
  assignedTo?: number;
  notes?: string;
  repliedAt?: Date;
  resolvedAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(contactSubmissions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(contactSubmissions.id, id));
  
  return { success: true };
}

export async function getContactSubmissionStats() {
  const db = await getDb();
  if (!db) {
    return {
      total: 0,
      new: 0,
      read: 0,
      replied: 0,
      resolved: 0,
      archived: 0,
    };
  }
  
  const [stats] = await db.select({
    total: sql<number>`count(*)`,
    new: sql<number>`sum(case when status = 'new' then 1 else 0 end)`,
    read: sql<number>`sum(case when status = 'read' then 1 else 0 end)`,
    replied: sql<number>`sum(case when status = 'replied' then 1 else 0 end)`,
    resolved: sql<number>`sum(case when status = 'resolved' then 1 else 0 end)`,
    archived: sql<number>`sum(case when status = 'archived' then 1 else 0 end)`,
  }).from(contactSubmissions);
  
  return {
    total: stats?.total || 0,
    new: stats?.new || 0,
    read: stats?.read || 0,
    replied: stats?.replied || 0,
    resolved: stats?.resolved || 0,
    archived: stats?.archived || 0,
  };
}
