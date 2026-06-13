/**
 * Regulator Portal Service
 *
 * Manages read-only access grants for UK regulators (FCA, ICO, PRA)
 * enabling continuous compliance visibility without traditional audits.
 */
import { getDb } from "./db";
import { regulatorPortalAccess, organizations, policies, complianceRecords, auditTrail } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function getPortalAccessGrants(organizationId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (organizationId) {
    return db.select().from(regulatorPortalAccess)
      .where(eq(regulatorPortalAccess.organizationId, organizationId))
      .orderBy(desc(regulatorPortalAccess.createdAt));
  }
  return db.select().from(regulatorPortalAccess).orderBy(desc(regulatorPortalAccess.createdAt));
}

export async function grantRegulatorAccess(data: {
  organizationId?: number;
  regulatorName: string;
  regulatorEmail?: string;
  grantedBy: number;
  accessScope?: string[];
  validDays?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const accessToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + (data.validDays || 365) * 24 * 60 * 60 * 1000);

  const defaultScope = data.accessScope || [
    "compliance_scores",
    "policy_status",
    "audit_trail",
    "regulatory_updates",
    "gap_analysis",
  ];

  const [result] = await db.insert(regulatorPortalAccess).values({
    organizationId: data.organizationId,
    regulatorName: data.regulatorName,
    regulatorEmail: data.regulatorEmail,
    accessToken,
    accessScope: defaultScope,
    grantedBy: data.grantedBy,
    expiresAt,
    isActive: true,
  });

  return {
    id: (result as any).insertId,
    accessToken,
    portalUrl: `/regulator-portal/${accessToken}`,
    expiresAt,
  };
}

export async function revokeRegulatorAccess(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(regulatorPortalAccess)
    .set({ isActive: false })
    .where(eq(regulatorPortalAccess.id, id));
  return { success: true };
}

export async function getRegulatorPortalData(accessToken: string) {
  const db = await getDb();
  if (!db) return null;

  const [grant] = await db.select().from(regulatorPortalAccess)
    .where(eq(regulatorPortalAccess.accessToken, accessToken))
    .limit(1);

  if (!grant || !grant.isActive) return null;
  if (grant.expiresAt && new Date() > grant.expiresAt) return null;

  // Update last accessed
  await db.update(regulatorPortalAccess)
    .set({ lastAccessedAt: new Date() })
    .where(eq(regulatorPortalAccess.id, grant.id));

  // Fetch live data based on scope
  const scope = (grant.accessScope as string[]) || [];
  const data: Record<string, unknown> = {
    regulatorName: grant.regulatorName,
    accessScope: scope,
    generatedAt: new Date().toISOString(),
  };

  if (scope.includes("compliance_scores")) {
    const allPolicies = await db.select().from(policies);
    const active = allPolicies.filter(p => p.status === "active");
    data.complianceScore = active.length > 0
      ? Math.round(active.reduce((s, p) => s + (p.complianceScore || 0), 0) / active.length)
      : 0;
    data.totalPolicies = allPolicies.length;
    data.activePolicies = active.length;
  }

  if (scope.includes("policy_status")) {
    const allPolicies = await db.select().from(policies);
    data.policyBreakdown = allPolicies.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  if (scope.includes("audit_trail")) {
    const recentAudit = await db.select().from(auditTrail)
      .orderBy(desc(auditTrail.createdAt))
      .limit(20);
    data.recentAuditEntries = recentAudit.map(e => ({
      action: e.action,
      entityType: e.entityType,
      timestamp: e.createdAt,
      hashValue: e.hashValue,
    }));
  }

  return data;
}
