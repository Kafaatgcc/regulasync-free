/**
 * Evidence Collection Service
 *
 * Manages automated and manual compliance evidence collection,
 * linking evidence to policies and controls.
 */
import { getDb } from "./db";
import { evidenceItems, policies, users } from "../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import crypto from "crypto";

export async function getEvidenceItems(filters?: { policyId?: number; status?: string; source?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.policyId) conditions.push(eq(evidenceItems.relatedPolicyId, filters.policyId));
  if (filters?.status) conditions.push(eq(evidenceItems.status, filters.status as any));
  if (filters?.source) conditions.push(eq(evidenceItems.source, filters.source as any));
  const query = conditions.length > 0
    ? db.select().from(evidenceItems).where(and(...conditions)).orderBy(desc(evidenceItems.createdAt))
    : db.select().from(evidenceItems).orderBy(desc(evidenceItems.createdAt));
  return query;
}

export async function createEvidenceItem(data: {
  title: string;
  description?: string;
  evidenceType: "access_log" | "training_certificate" | "policy_acknowledgment" | "audit_report" | "test_result" | "screenshot" | "document" | "api_response";
  source?: "manual" | "microsoft365" | "google_workspace" | "aws" | "api" | "automated";
  relatedPolicyId?: number;
  relatedControlId?: string;
  fileUrl?: string;
  collectedBy?: number;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const fileHash = data.fileUrl
    ? crypto.createHash("sha256").update(data.fileUrl + Date.now()).digest("hex")
    : undefined;

  const [result] = await db.insert(evidenceItems).values({
    ...data,
    fileHash,
    status: "collected",
  });
  return { id: (result as any).insertId };
}

export async function verifyEvidenceItem(id: number, verifiedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(evidenceItems)
    .set({ status: "verified", verifiedBy, verifiedAt: new Date() })
    .where(eq(evidenceItems.id, id));
  return { success: true };
}

export async function getEvidenceSummary() {
  const db = await getDb();
  if (!db) return null;
  const all = await db.select().from(evidenceItems);
  const byStatus = all.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bySource = all.reduce((acc, e) => {
    acc[e.source] = (acc[e.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const byType = all.reduce((acc, e) => {
    acc[e.evidenceType] = (acc[e.evidenceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return { total: all.length, byStatus, bySource, byType };
}

export async function simulateAutomatedCollection(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const automated = [
    {
      title: "Microsoft 365 Access Log — June 2026",
      description: "Automated access log collected from Microsoft 365 audit trail",
      evidenceType: "access_log" as const,
      source: "microsoft365" as const,
      relatedControlId: "AC-2",
      metadata: { users: 47, events: 1284, anomalies: 0 },
    },
    {
      title: "AWS CloudTrail Security Report",
      description: "Automated security event log from AWS CloudTrail",
      evidenceType: "api_response" as const,
      source: "aws" as const,
      relatedControlId: "SI-4",
      metadata: { events: 892, criticalAlerts: 0, region: "eu-west-2" },
    },
    {
      title: "Staff GDPR Training Completion Certificate",
      description: "Automated training completion records from LMS",
      evidenceType: "training_certificate" as const,
      source: "automated" as const,
      relatedControlId: "AT-2",
      metadata: { completionRate: "94%", totalStaff: 47, completed: 44 },
    },
    {
      title: "Policy Acknowledgment Log — Q2 2026",
      description: "Automated policy acknowledgment records",
      evidenceType: "policy_acknowledgment" as const,
      source: "automated" as const,
      relatedControlId: "PL-4",
      metadata: { acknowledged: 44, pending: 3, overdue: 0 },
    },
  ];

  const created = [];
  for (const item of automated) {
    const [result] = await db.insert(evidenceItems).values({
      ...item,
      collectedBy: userId,
      status: "collected",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });
    created.push((result as any).insertId);
  }
  return { created: created.length, items: automated.map(i => i.title) };
}
