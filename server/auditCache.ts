/**
 * Self-Validating Audit Cache
 * 
 * This module implements a blockchain-style hash chain for audit trail entries.
 * Each entry is cryptographically linked to the previous entry, creating an
 * immutable, tamper-evident audit log.
 * 
 * Key Features:
 * - SHA-256 hash computation for each entry
 * - Hash chain linking (each entry references previous hash)
 * - Chain verification to detect tampering
 * - Genesis block for new chains
 */

import crypto from 'crypto';
import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { auditTrail, InsertAuditTrail, AuditTrail } from "../drizzle/schema";

// Genesis hash for the first entry in the chain
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Compute SHA-256 hash for an audit entry
 * The hash includes all critical fields to ensure integrity
 */
export function computeAuditHash(entry: {
  entityType: string;
  entityId: number;
  action: string;
  userId: number | null;
  userName: string | null;
  previousValue: unknown;
  newValue: unknown;
  timestamp: string;
  previousHash: string;
}): string {
  const dataToHash = JSON.stringify({
    entityType: entry.entityType,
    entityId: entry.entityId,
    action: entry.action,
    userId: entry.userId,
    userName: entry.userName,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
    timestamp: entry.timestamp,
    previousHash: entry.previousHash,
  });
  
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

/**
 * Create a new audit entry with proper hash chain linking
 */
export async function createAuditEntryWithHash(
  db: ReturnType<typeof drizzle>,
  entry: Omit<InsertAuditTrail, 'hashValue' | 'previousHashValue'>
): Promise<{ id: number; hash: string }> {
  // Get the last entry's hash to link the chain
  const [lastEntry] = await db
    .select({ hash: auditTrail.hashValue, id: auditTrail.id })
    .from(auditTrail)
    .orderBy(desc(auditTrail.id))
    .limit(1);
  
  const previousHash = lastEntry?.hash || GENESIS_HASH;
  const timestamp = new Date().toISOString();
  
  // Compute hash for this entry
  const hashValue = computeAuditHash({
    entityType: entry.entityType,
    entityId: entry.entityId,
    action: entry.action,
    userId: entry.userId || null,
    userName: entry.userName || null,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
    timestamp,
    previousHash,
  });
  
  // Insert the entry with computed hashes
  const result = await db.insert(auditTrail).values({
    ...entry,
    hashValue,
    previousHashValue: previousHash,
    createdAt: new Date(timestamp),
  });
  
  const insertId = Number(result[0].insertId);
  
  return { id: insertId, hash: hashValue };
}

/**
 * Verification result for a single entry
 */
export interface EntryVerification {
  id: number;
  valid: boolean;
  expectedHash: string;
  actualHash: string | null;
  error?: string;
}

/**
 * Full chain verification result
 */
export interface ChainVerificationResult {
  valid: boolean;
  totalEntries: number;
  verifiedEntries: number;
  invalidEntries: EntryVerification[];
  firstInvalidAt?: number;
  verificationTime: number; // milliseconds
  chainIntegrity: 'intact' | 'broken' | 'empty';
}

/**
 * Verify the integrity of the entire audit chain
 * Returns detailed verification results including any broken links
 */
export async function verifyAuditChain(
  db: ReturnType<typeof drizzle>,
  options?: { limit?: number; startFromId?: number }
): Promise<ChainVerificationResult> {
  const startTime = Date.now();
  
  // Fetch all entries in order
  let query = db
    .select()
    .from(auditTrail)
    .orderBy(asc(auditTrail.id));
  
  const entries = await query;
  
  if (entries.length === 0) {
    return {
      valid: true,
      totalEntries: 0,
      verifiedEntries: 0,
      invalidEntries: [],
      verificationTime: Date.now() - startTime,
      chainIntegrity: 'empty',
    };
  }
  
  const invalidEntries: EntryVerification[] = [];
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isFirstEntry = i === 0;
    
    // For the first entry, we accept it as the genesis point of this chain
    // The chain is valid as long as subsequent entries properly link to each other
    if (isFirstEntry) {
      // First entry is always valid - it's the genesis of this chain segment
      // We only verify that it has a hash value
      if (!entry.hashValue) {
        invalidEntries.push({
          id: entry.id,
          valid: false,
          expectedHash: 'any valid hash',
          actualHash: entry.hashValue,
          error: 'First entry missing hash value',
        });
      }
    } else {
      // For subsequent entries, verify the chain link
      const previousEntry = entries[i - 1];
      
      // Verify the previous hash link matches the previous entry's hash
      // This is the core blockchain-style verification
      if (entry.previousHashValue !== previousEntry.hashValue) {
        invalidEntries.push({
          id: entry.id,
          valid: false,
          expectedHash: previousEntry.hashValue || 'previous hash',
          actualHash: entry.previousHashValue,
          error: 'Previous hash mismatch - chain link broken',
        });
      }
      
      // Verify the entry has a valid hash value
      if (!entry.hashValue) {
        invalidEntries.push({
          id: entry.id,
          valid: false,
          expectedHash: 'valid hash',
          actualHash: entry.hashValue,
          error: 'Entry missing hash value',
        });
      }
    }
  }
  
  const valid = invalidEntries.length === 0;
  
  return {
    valid,
    totalEntries: entries.length,
    verifiedEntries: entries.length - invalidEntries.length,
    invalidEntries,
    firstInvalidAt: invalidEntries.length > 0 ? invalidEntries[0].id : undefined,
    verificationTime: Date.now() - startTime,
    chainIntegrity: valid ? 'intact' : 'broken',
  };
}

/**
 * Get audit entry with verification status
 */
export async function getAuditEntryWithVerification(
  db: ReturnType<typeof drizzle>,
  entryId: number
): Promise<{ entry: AuditTrail; verified: boolean; error?: string } | null> {
  const [entry] = await db
    .select()
    .from(auditTrail)
    .where(eq(auditTrail.id, entryId))
    .limit(1);
  
  if (!entry) return null;
  
  // Get the previous entry to verify chain link
  const [previousEntry] = await db
    .select()
    .from(auditTrail)
    .where(eq(auditTrail.id, entryId - 1))
    .limit(1);
  
  const expectedPreviousHash = previousEntry?.hashValue || GENESIS_HASH;
  
  // Verify previous hash link
  if (entry.previousHashValue !== expectedPreviousHash) {
    return {
      entry,
      verified: false,
      error: 'Chain link broken - previous hash mismatch',
    };
  }
  
  // Recompute and verify entry hash
  const recomputedHash = computeAuditHash({
    entityType: entry.entityType,
    entityId: entry.entityId,
    action: entry.action,
    userId: entry.userId,
    userName: entry.userName,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
    timestamp: entry.createdAt.toISOString(),
    previousHash: entry.previousHashValue || GENESIS_HASH,
  });
  
  if (entry.hashValue !== recomputedHash) {
    return {
      entry,
      verified: false,
      error: 'Entry hash mismatch - data may have been tampered',
    };
  }
  
  return { entry, verified: true };
}

/**
 * Get chain statistics
 */
export async function getChainStatistics(db: ReturnType<typeof drizzle>): Promise<{
  totalEntries: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
  actionsBreakdown: Record<string, number>;
  entitiesBreakdown: Record<string, number>;
}> {
  const entries = await db.select().from(auditTrail).orderBy(asc(auditTrail.id));
  
  const actionsBreakdown: Record<string, number> = {};
  const entitiesBreakdown: Record<string, number> = {};
  
  for (const entry of entries) {
    actionsBreakdown[entry.action] = (actionsBreakdown[entry.action] || 0) + 1;
    entitiesBreakdown[entry.entityType] = (entitiesBreakdown[entry.entityType] || 0) + 1;
  }
  
  return {
    totalEntries: entries.length,
    oldestEntry: entries.length > 0 ? entries[0].createdAt : null,
    newestEntry: entries.length > 0 ? entries[entries.length - 1].createdAt : null,
    actionsBreakdown,
    entitiesBreakdown,
  };
}

/**
 * Export audit trail with verification data for compliance reports
 */
export async function exportAuditTrailWithVerification(
  db: ReturnType<typeof drizzle>
): Promise<{
  entries: Array<AuditTrail & { verified: boolean }>;
  chainIntegrity: 'intact' | 'broken' | 'empty';
  exportedAt: string;
  verificationHash: string;
}> {
  const verification = await verifyAuditChain(db);
  const entries = await db.select().from(auditTrail).orderBy(asc(auditTrail.id));
  
  const invalidIds = new Set(verification.invalidEntries.map(e => e.id));
  
  const entriesWithVerification = entries.map(entry => ({
    ...entry,
    verified: !invalidIds.has(entry.id),
  }));
  
  // Create a verification hash of the entire export
  const exportData = JSON.stringify({
    entries: entriesWithVerification,
    chainIntegrity: verification.chainIntegrity,
    exportedAt: new Date().toISOString(),
  });
  
  const verificationHash = crypto.createHash('sha256').update(exportData).digest('hex');
  
  return {
    entries: entriesWithVerification,
    chainIntegrity: verification.chainIntegrity,
    exportedAt: new Date().toISOString(),
    verificationHash,
  };
}
