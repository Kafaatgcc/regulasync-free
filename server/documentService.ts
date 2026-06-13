/**
 * Document Management Service
 * 
 * Handles policy document uploads, storage, and retrieval using S3.
 * Supports versioning, metadata tracking, and access control.
 */

import { storagePut, storageGet } from "./storage";
import { getDb } from "./db";
import { policies, policyVersions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { createAuditEntryWithHash } from "./auditCache";
import crypto from "crypto";

// Supported document types
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'application/json',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadResult {
  success: boolean;
  documentId?: string;
  url?: string;
  error?: string;
}

interface DocumentMetadata {
  filename: string;
  mimeType: string;
  size: number;
  uploadedBy: number;
  uploadedAt: Date;
  checksum: string;
  version: number;
}

/**
 * Generate a unique document ID
 */
function generateDocumentId(): string {
  return `doc_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Calculate file checksum for integrity verification
 */
function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate file before upload
 */
function validateFile(buffer: Buffer, mimeType: string, filename: string): { valid: boolean; error?: string } {
  // Check file size
  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  
  // Check mime type
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: `Unsupported file type: ${mimeType}. Supported types: PDF, Word, Excel, Text, Markdown, JSON` };
  }
  
  // Check filename
  if (!filename || filename.length > 255) {
    return { valid: false, error: 'Invalid filename' };
  }
  
  return { valid: true };
}

/**
 * Upload a policy document to S3
 */
export async function uploadPolicyDocument(params: {
  policyId: number;
  userId: number;
  buffer: Buffer;
  filename: string;
  mimeType: string;
  createVersion?: boolean;
}): Promise<UploadResult> {
  const { policyId, userId, buffer, filename, mimeType, createVersion = true } = params;
  
  // Validate file
  const validation = validateFile(buffer, mimeType, filename);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const db = await getDb();
  if (!db) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Get the policy
    const [policy] = await db.select().from(policies).where(eq(policies.id, policyId)).limit(1);
    if (!policy) {
      return { success: false, error: 'Policy not found' };
    }
    
    // Generate document ID and calculate checksum
    const documentId = generateDocumentId();
    const checksum = calculateChecksum(buffer);
    
    // Get current version number
    const existingVersions = await db.select()
      .from(policyVersions)
      .where(eq(policyVersions.policyId, policyId))
      .orderBy(desc(policyVersions.versionNumber))
      .limit(1);
    
    const newVersionNumber = existingVersions.length > 0 
      ? (existingVersions[0].versionNumber || 0) + 1 
      : 1;
    
    // Upload to S3
    const fileKey = `policies/${policyId}/${documentId}/${filename}`;
    const { url } = await storagePut(fileKey, buffer, mimeType);
    
    // Create version record if requested
    if (createVersion) {
      // Get policy title for the version
      await db.insert(policyVersions).values({
        policyId,
        versionNumber: newVersionNumber,
        title: policy.title,
        description: `Document uploaded: ${filename}`,
        documentUrl: url,
        changedBy: userId,
        status: 'draft',
      });
    }
    
    // Update policy - note: documentUrl is stored in policyVersions, not policies table
    await db.update(policies)
      .set({ 
        updatedAt: new Date(),
      })
      .where(eq(policies.id, policyId));
    
    // Create audit entry
    await createAuditEntryWithHash(db, {
      userId,
      action: 'update',
      entityType: 'policy',
      entityId: policyId,
    });
    
    return {
      success: true,
      documentId,
      url,
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload document',
    };
  }
}

/**
 * Get a signed URL for document download
 */
export async function getDocumentDownloadUrl(params: {
  policyId: number;
  versionNumber?: number;
}): Promise<{ success: boolean; url?: string; error?: string }> {
  const { policyId, versionNumber } = params;
  
  const db = await getDb();
  if (!db) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    let documentUrl: string | null = null;
    
    // Get the latest version with a document
    const versions = await db.select()
      .from(policyVersions)
      .where(eq(policyVersions.policyId, policyId))
      .orderBy(desc(policyVersions.versionNumber))
      .limit(1);
    
    if (versions.length > 0 && versions[0].documentUrl) {
      documentUrl = versions[0].documentUrl;
    }
    
    if (!documentUrl) {
      return { success: false, error: 'No document found for this policy' };
    }
    
    // If it's already a full URL, return it
    if (documentUrl.startsWith('http')) {
      return { success: true, url: documentUrl };
    }
    
    // Otherwise, get a signed URL
    const { url } = await storageGet(documentUrl);
    return { success: true, url };
  } catch (error) {
    console.error('Error getting document URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get document URL',
    };
  }
}

/**
 * Delete a policy document
 */
export async function deletePolicyDocument(params: {
  policyId: number;
  userId: number;
  versionNumber?: number;
}): Promise<{ success: boolean; error?: string }> {
  const { policyId, userId, versionNumber } = params;
  
  const db = await getDb();
  if (!db) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Note: We don't actually delete from S3 for audit purposes
    // Just remove the reference from the database
    
    if (versionNumber) {
      // Mark version as deleted
      await db.update(policyVersions)
        .set({ status: 'archived' })
        .where(eq(policyVersions.policyId, policyId));
    } else {
      // Update policy timestamp
      await db.update(policies)
        .set({ 
          updatedAt: new Date(),
        })
        .where(eq(policies.id, policyId));
    }
    
    // Create audit entry
    await createAuditEntryWithHash(db, {
      userId,
      action: 'delete',
      entityType: 'policy',
      entityId: policyId,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete document',
    };
  }
}

/**
 * Get all documents for a policy
 */
export async function getPolicyDocuments(policyId: number): Promise<{
  current: { url: string | null };
  versions: Array<{
    versionNumber: number | null;
    documentUrl: string | null;
    createdAt: Date;
    status: string | null;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return { current: { url: null }, versions: [] };
  }
  
  try {
    const allVersions = await db.select({
      versionNumber: policyVersions.versionNumber,
      documentUrl: policyVersions.documentUrl,
      createdAt: policyVersions.createdAt,
      status: policyVersions.status,
    })
      .from(policyVersions)
      .where(eq(policyVersions.policyId, policyId))
      .orderBy(desc(policyVersions.versionNumber));
    
    const latestWithDoc = allVersions.find(v => v.documentUrl);
    
    return {
      current: { url: latestWithDoc?.documentUrl || null },
      versions: allVersions.map(v => ({
        versionNumber: v.versionNumber,
        documentUrl: v.documentUrl,
        createdAt: v.createdAt,
        status: v.status,
      })),
    };
  } catch (error) {
    console.error('Error getting policy documents:', error);
    return { current: { url: null }, versions: [] };
  }
}

/**
 * Bulk upload documents for multiple policies
 */
export async function bulkUploadDocuments(params: {
  userId: number;
  documents: Array<{
    policyId: number;
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }>;
}): Promise<{
  successful: number;
  failed: number;
  results: Array<{ policyId: number; success: boolean; error?: string }>;
}> {
  const { userId, documents } = params;
  
  const results: Array<{ policyId: number; success: boolean; error?: string }> = [];
  let successful = 0;
  let failed = 0;
  
  for (const doc of documents) {
    const result = await uploadPolicyDocument({
      policyId: doc.policyId,
      userId,
      buffer: doc.buffer,
      filename: doc.filename,
      mimeType: doc.mimeType,
    });
    
    if (result.success) {
      successful++;
      results.push({ policyId: doc.policyId, success: true });
    } else {
      failed++;
      results.push({ policyId: doc.policyId, success: false, error: result.error });
    }
  }
  
  return { successful, failed, results };
}
