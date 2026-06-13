/**
 * User Roles and Multi-tenant Service
 * 
 * Handles role-based access control and organization management.
 */

import { getDb } from "./db";
import { users, organizations } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { createAuditEntryWithHash } from "./auditCache";

// Role hierarchy and permissions
export const ROLES = {
  admin: {
    level: 100,
    permissions: [
      'manage_users',
      'manage_roles',
      'manage_organization',
      'manage_policies',
      'approve_policies',
      'manage_delegations',
      'view_audit_trail',
      'export_reports',
      'manage_integrations',
      'manage_billing',
      'view_all_data',
    ],
  },
  compliance_officer: {
    level: 80,
    permissions: [
      'manage_policies',
      'approve_policies',
      'manage_delegations',
      'view_audit_trail',
      'export_reports',
      'view_all_data',
    ],
  },
  manager: {
    level: 60,
    permissions: [
      'manage_policies',
      'approve_policies',
      'view_audit_trail',
      'export_reports',
      'view_department_data',
    ],
  },
  analyst: {
    level: 40,
    permissions: [
      'view_policies',
      'create_policies',
      'view_audit_trail',
      'export_reports',
      'view_department_data',
    ],
  },
  user: {
    level: 20,
    permissions: [
      'view_policies',
      'view_own_data',
    ],
  },
  viewer: {
    level: 10,
    permissions: [
      'view_policies',
      'view_own_data',
    ],
  },
};

export type RoleName = keyof typeof ROLES;

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: string, permission: string): boolean {
  const role = ROLES[userRole as RoleName];
  if (!role) return false;
  return role.permissions.includes(permission);
}

/**
 * Check if a user has a minimum role level
 */
export function hasMinimumRole(userRole: string, requiredRole: RoleName): boolean {
  const userRoleConfig = ROLES[userRole as RoleName];
  const requiredRoleConfig = ROLES[requiredRole];
  if (!userRoleConfig || !requiredRoleConfig) return false;
  return userRoleConfig.level >= requiredRoleConfig.level;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): string[] {
  return ROLES[role as RoleName]?.permissions || [];
}

/**
 * Update user role
 */
export async function updateUserRole(params: {
  userId: number;
  newRole: RoleName;
  updatedBy: number;
}): Promise<{ success: boolean; error?: string }> {
  const { userId, newRole, updatedBy } = params;
  
  const db = await getDb();
  if (!db) return { success: false, error: 'Database not available' };
  
  try {
    // Verify the new role is valid
    if (!ROLES[newRole]) {
      return { success: false, error: 'Invalid role' };
    }
    
    // Update the user's role
    await db.update(users)
      .set({ role: newRole === 'admin' ? 'admin' : 'user' })
      .where(eq(users.id, userId));
    
    // Create audit entry
    await createAuditEntryWithHash(db, {
      userId: updatedBy,
      action: 'update',
      entityType: 'user',
      entityId: userId,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update role' };
  }
}

/**
 * Create a new organization
 */
export async function createOrganization(params: {
  name: string;
  slug: string;
  ownerId: number;
  industry?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
}): Promise<{ success: boolean; organizationId?: number; error?: string }> {
  const { name, slug, ownerId, industry, size } = params;
  
  const db = await getDb();
  if (!db) return { success: false, error: 'Database not available' };
  
  try {
    // Check if slug is unique
    const existing = await db.select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    
    if (existing.length > 0) {
      return { success: false, error: 'Organization slug already exists' };
    }
    
    // Create organization
    const [result] = await db.insert(organizations).values({
      name,
      slug,
      ownerId,
      industry: industry || null,
      size: size || null,
      plan: 'core',
    });
    
    // Create audit entry
    await createAuditEntryWithHash(db, {
      userId: ownerId,
      action: 'create',
      entityType: 'organization',
      entityId: result.insertId,
    });
    
    return { success: true, organizationId: result.insertId };
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false, error: 'Failed to create organization' };
  }
}

/**
 * Get organization by ID
 */
export async function getOrganization(orgId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [org] = await db.select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  
  return org || null;
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [org] = await db.select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);
  
  return org || null;
}

/**
 * Update organization details
 */
export async function updateOrganization(params: {
  orgId: number;
  updates: {
    name?: string;
    industry?: string;
    size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  };
  updatedBy: number;
}): Promise<{ success: boolean; error?: string }> {
  const { orgId, updates, updatedBy } = params;
  
  const db = await getDb();
  if (!db) return { success: false, error: 'Database not available' };
  
  try {
    await db.update(organizations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, orgId));
    
    await createAuditEntryWithHash(db, {
      userId: updatedBy,
      action: 'update',
      entityType: 'organization',
      entityId: orgId,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating organization:', error);
    return { success: false, error: 'Failed to update organization' };
  }
}

/**
 * Get all users in an organization
 */
export async function getOrganizationUsers(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // For now, return all users since we don't have org membership table
  // In production, you'd have a user_organizations junction table
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    department: users.department,
    jobTitle: users.jobTitle,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users);
  
  return allUsers;
}

/**
 * Invite user to organization
 */
export async function inviteUserToOrganization(params: {
  orgId: number;
  email: string;
  role: RoleName;
  invitedBy: number;
}): Promise<{ success: boolean; inviteId?: string; error?: string }> {
  const { orgId, email, role, invitedBy } = params;
  
  // In production, this would:
  // 1. Create an invite record
  // 2. Send an email with invite link
  // 3. Handle invite acceptance
  
  // For now, return a mock invite ID
  const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return { success: true, inviteId };
}

/**
 * Get user's effective permissions based on role and organization
 */
export async function getUserPermissions(userId: number): Promise<{
  role: string;
  permissions: string[];
  organization?: {
    id: number;
    name: string;
    plan: string;
  };
}> {
  const db = await getDb();
  if (!db) return { role: 'user', permissions: [] };
  
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user) return { role: 'user', permissions: [] };
  
  const role = user.role || 'user';
  const permissions = getRolePermissions(role);
  
  return {
    role,
    permissions,
  };
}
