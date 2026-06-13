/**
 * Policy Versioning and Document Management Service
 * 
 * Handles policy version control, document uploads, and change tracking.
 */

import { getDb } from "./db";
import { policies, policyVersions, users, auditTrail } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { storagePut, storageGet } from "./storage";
import { createAuditEntryWithHash } from "./auditCache";

/**
 * Create a new version of a policy
 */
export async function createPolicyVersion(params: {
  policyId: number;
  userId: number;
  changeDescription: string;
  content?: string;
  documentUrl?: string;
}): Promise<{ versionId: number; version: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current policy
  const [policy] = await db.select().from(policies).where(eq(policies.id, params.policyId));
  if (!policy) throw new Error("Policy not found");

  // Get current version number
  const currentVersion = policy.version || 1;
  const newVersion = currentVersion + 1;

  // Create version record
  const [versionRecord] = await db.insert(policyVersions).values({
    policyId: params.policyId,
    versionNumber: newVersion,
    title: policy.title,
    description: policy.description,
    content: params.content || null,
    changesSummary: params.changeDescription,
    changedBy: params.userId,
    status: 'draft',
  }).$returningId();

  // Update policy version number
  await db.update(policies)
    .set({ 
      version: newVersion,
      updatedAt: new Date(),
    })
    .where(eq(policies.id, params.policyId));

  // Get user name for audit
  const [user] = await db.select().from(users).where(eq(users.id, params.userId));

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'policy',
    entityId: params.policyId,
    action: 'create',
    userId: params.userId,
    userName: user?.name || 'Unknown',
    previousValue: { version: currentVersion },
    newValue: { version: newVersion, changeDescription: params.changeDescription },
  });

  return { versionId: versionRecord.id, version: newVersion };
}

/**
 * Get version history for a policy
 */
export async function getPolicyVersionHistory(policyId: number) {
  const db = await getDb();
  if (!db) return [];

  const versions = await db.select({
    version: policyVersions,
    createdByUser: users,
  })
    .from(policyVersions)
    .leftJoin(users, eq(policyVersions.changedBy, users.id))
    .where(eq(policyVersions.policyId, policyId))
    .orderBy(desc(policyVersions.versionNumber));

  return versions.map(v => ({
    ...v.version,
    createdByName: v.createdByUser?.name || 'Unknown',
  }));
}

/**
 * Get a specific version of a policy
 */
export async function getPolicyVersion(policyId: number, version: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [versionRecord] = await db.select()
    .from(policyVersions)
    .where(
      and(
        eq(policyVersions.policyId, policyId),
        eq(policyVersions.versionNumber, version)
      )
    );

  if (!versionRecord) throw new Error("Version not found");

  return versionRecord;
}

/**
 * Restore a previous version of a policy
 */
export async function restorePolicyVersion(params: {
  policyId: number;
  version: number;
  userId: number;
}): Promise<{ newVersion: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the version to restore
  const versionToRestore = await getPolicyVersion(params.policyId, params.version);

  // Create a new version with the restored content
  const result = await createPolicyVersion({
    policyId: params.policyId,
    userId: params.userId,
    changeDescription: `Restored from version ${params.version}`,
    content: versionToRestore.content || undefined,
  });

  // Update the policy
  await db.update(policies)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(policies.id, params.policyId));

  return { newVersion: result.version };
}

/**
 * Compare two versions of a policy
 */
export async function comparePolicyVersions(policyId: number, version1: number, version2: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [v1, v2] = await Promise.all([
    getPolicyVersion(policyId, version1),
    getPolicyVersion(policyId, version2),
  ]);

  // Simple diff - in production, use a proper diff library
  const content1 = v1.content || '';
  const content2 = v2.content || '';

  const lines1 = content1.split('\n');
  const lines2 = content2.split('\n');

  const changes: Array<{
    type: 'added' | 'removed' | 'unchanged';
    line: string;
    lineNumber: number;
  }> = [];

  const maxLines = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';

    if (line1 === line2) {
      changes.push({ type: 'unchanged', line: line1, lineNumber: i + 1 });
    } else if (!line1 && line2) {
      changes.push({ type: 'added', line: line2, lineNumber: i + 1 });
    } else if (line1 && !line2) {
      changes.push({ type: 'removed', line: line1, lineNumber: i + 1 });
    } else {
      changes.push({ type: 'removed', line: line1, lineNumber: i + 1 });
      changes.push({ type: 'added', line: line2, lineNumber: i + 1 });
    }
  }

  return {
    version1: { version: v1.versionNumber, createdAt: v1.createdAt, changeDescription: v1.changesSummary },
    version2: { version: v2.versionNumber, createdAt: v2.createdAt, changeDescription: v2.changesSummary },
    changes,
    summary: {
      added: changes.filter(c => c.type === 'added').length,
      removed: changes.filter(c => c.type === 'removed').length,
      unchanged: changes.filter(c => c.type === 'unchanged').length,
    },
  };
}

/**
 * Upload a document for a policy
 */
export async function uploadPolicyDocument(params: {
  policyId: number;
  userId: number;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}): Promise<{ url: string; key: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate unique file key
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileKey = `policies/${params.policyId}/${timestamp}-${randomSuffix}-${params.fileName}`;

  // Upload to S3
  const { url, key } = await storagePut(fileKey, params.fileBuffer, params.mimeType);

  // Get user name for audit
  const [user] = await db.select().from(users).where(eq(users.id, params.userId));

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'policy',
    entityId: params.policyId,
    action: 'create',
    userId: params.userId,
    userName: user?.name || 'Unknown',
    newValue: { fileName: params.fileName, url, mimeType: params.mimeType },
  });

  return { url, key };
}

/**
 * Approve a policy version
 */
export async function approvePolicyVersion(params: {
  policyId: number;
  version: number;
  userId: number;
  comments?: string;
}): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update version status
  await db.update(policyVersions)
    .set({ 
      status: 'approved',
      approvedBy: params.userId,
      approvedAt: new Date(),
    })
    .where(
      and(
        eq(policyVersions.policyId, params.policyId),
        eq(policyVersions.versionNumber, params.version)
      )
    );

  // Get user name for audit
  const [user] = await db.select().from(users).where(eq(users.id, params.userId));

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'policy_version',
    entityId: params.policyId,
    action: 'approve',
    userId: params.userId,
    userName: user?.name || 'Unknown',
    newValue: { version: params.version, comments: params.comments },
  });

  return { success: true };
}

/**
 * Reject a policy version
 */
export async function rejectPolicyVersion(params: {
  policyId: number;
  version: number;
  userId: number;
  reason: string;
}): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update version status
  await db.update(policyVersions)
    .set({ status: 'archived' }) // Using 'archived' instead of 'rejected' since it's not in the enum
    .where(
      and(
        eq(policyVersions.policyId, params.policyId),
        eq(policyVersions.versionNumber, params.version)
      )
    );

  // Get user name for audit
  const [user] = await db.select().from(users).where(eq(users.id, params.userId));

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'policy_version',
    entityId: params.policyId,
    action: 'reject',
    userId: params.userId,
    userName: user?.name || 'Unknown',
    newValue: { version: params.version, reason: params.reason },
  });

  return { success: true };
}

/**
 * Publish a policy version (make it active)
 */
export async function publishPolicyVersion(params: {
  policyId: number;
  version: number;
  userId: number;
}): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the version
  const versionRecord = await getPolicyVersion(params.policyId, params.version);
  
  if (versionRecord.status !== 'approved') {
    throw new Error("Only approved versions can be published");
  }

  // Update version status to active
  await db.update(policyVersions)
    .set({ status: 'active' })
    .where(
      and(
        eq(policyVersions.policyId, params.policyId),
        eq(policyVersions.versionNumber, params.version)
      )
    );

  // Update policy to active with the published content
  await db.update(policies)
    .set({
      status: 'active',
      effectiveDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(policies.id, params.policyId));

  // Get user name for audit
  const [user] = await db.select().from(users).where(eq(users.id, params.userId));

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'policy',
    entityId: params.policyId,
    action: 'update',
    userId: params.userId,
    userName: user?.name || 'Unknown',
    newValue: { version: params.version, status: 'active' },
  });

  return { success: true };
}

/**
 * Get policy with full version details
 */
export async function getPolicyWithVersions(policyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [policy] = await db.select().from(policies).where(eq(policies.id, policyId));
  if (!policy) throw new Error("Policy not found");

  const versions = await getPolicyVersionHistory(policyId);

  return {
    ...policy,
    versions,
    currentVersion: policy.version || 1,
    totalVersions: versions.length,
  };
}
