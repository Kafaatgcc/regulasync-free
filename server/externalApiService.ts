/**
 * External API Service
 * 
 * Provides API key management and external API access for integrations.
 */

import { getDb } from "./db";
import { apiKeys, webhookLogs } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { createAuditEntryWithHash } from "./auditCache";
import crypto from "crypto";

// API Key prefix for identification
const API_KEY_PREFIX = "rs_live_";
const API_KEY_TEST_PREFIX = "rs_test_";

/**
 * Generate a new API key
 */
function generateApiKey(isTest: boolean = false): string {
  const prefix = isTest ? API_KEY_TEST_PREFIX : API_KEY_PREFIX;
  const randomPart = crypto.randomBytes(24).toString('base64url');
  return `${prefix}${randomPart}`;
}

/**
 * Hash an API key for storage
 */
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(params: {
  userId: number;
  name: string;
  scopes: string[];
  expiresAt?: Date;
  isTest?: boolean;
}): Promise<{ success: boolean; apiKey?: string; keyId?: number; error?: string }> {
  const { userId, name, scopes, expiresAt, isTest = false } = params;
  
  const db = await getDb();
  if (!db) return { success: false, error: 'Database not available' };
  
  try {
    // Generate the API key
    const apiKey = generateApiKey(isTest);
    const hashedKey = hashApiKey(apiKey);
    
    // Store the hashed key
    const [result] = await db.insert(apiKeys).values({
      userId,
      name,
      keyHash: hashedKey,
      keyPrefix: apiKey.substring(0, 12), // Store prefix for identification
      permissions: scopes,
      expiresAt: expiresAt || null,
      lastUsedAt: null,
      isActive: true,
    });
    
    // Create audit entry
    await createAuditEntryWithHash(db, {
      userId,
      action: 'create',
      entityType: 'api_key',
      entityId: result.insertId,
    });
    
    // Return the unhashed key (only time it's visible)
    return {
      success: true,
      apiKey,
      keyId: result.insertId,
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    return { success: false, error: 'Failed to create API key' };
  }
}

/**
 * Validate an API key and return the associated user
 */
export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  userId?: number;
  scopes?: string[];
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { valid: false, error: 'Database not available' };
  
  try {
    const hashedKey = hashApiKey(apiKey);
    
    const [key] = await db.select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.keyHash, hashedKey),
          eq(apiKeys.isActive, true)
        )
      )
      .limit(1);
    
    if (!key) {
      return { valid: false, error: 'Invalid API key' };
    }
    
    // Check expiration
    if (key.expiresAt && new Date() > key.expiresAt) {
      return { valid: false, error: 'API key expired' };
    }
    
    // Update last used timestamp
    await db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, key.id));
    
    const scopes = typeof key.permissions === 'string' 
      ? JSON.parse(key.permissions) 
      : key.permissions;
    
    return {
      valid: true,
      userId: key.userId || undefined,
      scopes: Array.isArray(scopes) ? scopes : [],
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(params: {
  keyId: number;
  userId: number;
}): Promise<{ success: boolean; error?: string }> {
  const { keyId, userId } = params;
  
  const db = await getDb();
  if (!db) return { success: false, error: 'Database not available' };
  
  try {
    await db.update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, keyId));
    
    await createAuditEntryWithHash(db, {
      userId,
      action: 'delete',
      entityType: 'api_key',
      entityId: keyId,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error revoking API key:', error);
    return { success: false, error: 'Failed to revoke API key' };
  }
}

/**
 * List API keys for a user
 */
export async function listApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const keys = await db.select({
    id: apiKeys.id,
    name: apiKeys.name,
    keyPrefix: apiKeys.keyPrefix,
    permissions: apiKeys.permissions,
    isActive: apiKeys.isActive,
    lastUsedAt: apiKeys.lastUsedAt,
    expiresAt: apiKeys.expiresAt,
    createdAt: apiKeys.createdAt,
  })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt));
  
  return keys.map(k => ({
    ...k,
    scopes: typeof k.permissions === 'string' ? JSON.parse(k.permissions as string) : k.permissions,
  }));
}

/**
 * Log a webhook delivery
 */
export async function logWebhookDelivery(params: {
  endpoint: string;
  event: string;
  payload: object;
  statusCode: number;
  response?: string;
  success: boolean;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(webhookLogs).values({
      source: params.endpoint,
      eventType: params.event,
      payload: params.payload,
      status: params.success ? 'processed' : 'failed',
      errorMessage: params.success ? null : params.response || null,
      processedAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging webhook:', error);
  }
}

/**
 * Send a webhook to an endpoint
 */
export async function sendWebhook(params: {
  url: string;
  event: string;
  data: object;
  secret?: string;
}): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const { url, event, data, secret } = params;
  
  try {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };
    
    const body = JSON.stringify(payload);
    
    // Create signature if secret is provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-RegulaSync-Event': event,
    };
    
    if (secret) {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      headers['X-RegulaSync-Signature'] = `sha256=${signature}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    // Log the delivery
    await logWebhookDelivery({
      endpoint: url,
      event,
      payload,
      statusCode: response.status,
      success: response.ok,
    });
    
    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('Error sending webhook:', error);
    
    await logWebhookDelivery({
      endpoint: url,
      event,
      payload: data,
      statusCode: 0,
      response: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send webhook',
    };
  }
}

/**
 * Get webhook logs
 */
export async function getWebhookLogs(options?: {
  limit?: number;
  event?: string;
  success?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const { limit = 100 } = options || {};
  
  const logs = await db.select()
    .from(webhookLogs)
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit);
  
  return logs;
}

// Available API scopes
export const API_SCOPES = {
  'policies:read': 'Read policy data',
  'policies:write': 'Create and update policies',
  'compliance:read': 'Read compliance records',
  'compliance:write': 'Update compliance records',
  'regulatory:read': 'Read regulatory updates',
  'audit:read': 'Read audit trail',
  'reports:read': 'Generate and read reports',
  'users:read': 'Read user information',
  'webhooks:manage': 'Manage webhook endpoints',
};
