/**
 * Approval Workflow Automation Service
 * 
 * Handles automated approval workflows, delegation chains, and escalation.
 */

import { getDb } from "./db";
import { 
  approvalRequests, 
  delegationAuthority, 
  policies, 
  users,
  notifications
} from "../drizzle/schema";
import { eq, and, desc, gte, lte, or, isNull } from "drizzle-orm";
import { createAuditEntryWithHash } from "./auditCache";
import { createNotification } from "./notificationService";
import { notifyOwner } from "./_core/notification";

/**
 * Approval request with related data
 */
export interface ApprovalRequestWithDetails {
  id: number;
  title: string;
  description: string | null;
  requestType: string;
  status: string;
  priority: string;
  requesterId: number | null;
  requesterName?: string;
  approverId: number | null;
  approverName?: string;
  relatedPolicyId: number | null;
  relatedDelegationId: number | null;
  amount: string | null;
  currency: string | null;
  dueDate: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new approval request with automatic routing
 */
export async function createApprovalRequest(params: {
  title: string;
  description?: string;
  requestType: 'policy_approval' | 'delegation_approval' | 'expense_approval' | 'contract_approval' | 'compliance_exception';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requesterId: number;
  relatedPolicyId?: number;
  relatedDelegationId?: number;
  amount?: string;
  currency?: string;
  dueDate?: Date;
}): Promise<{ id: number; assignedTo: number | null }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find appropriate approver based on delegation rules
  const approver = await findApprover({
    requestType: params.requestType,
    amount: params.amount ? parseFloat(params.amount) : undefined,
    requesterId: params.requesterId,
  });

  // Create the request
  const [request] = await db.insert(approvalRequests).values({
    title: params.title,
    description: params.description,
    requestType: params.requestType,
    priority: params.priority || 'medium',
    status: 'pending',
    requesterId: params.requesterId,
    approverId: approver?.id || null,
    relatedPolicyId: params.relatedPolicyId,
    relatedDelegationId: params.relatedDelegationId,
    amount: params.amount,
    currency: params.currency || 'GBP',
    dueDate: params.dueDate,
  }).$returningId();

  // Get requester info
  const [requester] = await db.select().from(users).where(eq(users.id, params.requesterId));

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'approval_request',
    entityId: request.id,
    action: 'create',
    userId: params.requesterId,
    userName: requester?.name || 'Unknown',
    newValue: { title: params.title, requestType: params.requestType, assignedTo: approver?.id },
  });

  // Notify the approver
  if (approver) {
    await createNotification({
      userId: approver.id,
      title: `🔔 New Approval Request: ${params.title}`,
      message: `You have a new ${params.requestType} approval request from ${requester?.name || 'Unknown'}. Priority: ${params.priority || 'medium'}`,
      type: 'alert',
      category: 'compliance',
      relatedEntityType: 'approval_request',
      relatedEntityId: request.id,
      actionUrl: `/approvals/${request.id}`,
    });
  }

  // Also notify owner
  await notifyOwner({
    title: `📋 New Approval Request: ${params.title}`,
    content: `A new approval request has been created.

**Title:** ${params.title}
**Type:** ${params.requestType}
**Priority:** ${params.priority || 'medium'}
**Requester:** ${requester?.name || 'Unknown'}
**Assigned To:** ${approver?.name || 'Unassigned'}
${params.amount ? `**Amount:** ${params.currency || 'GBP'} ${params.amount}` : ''}`,
  });

  return { id: request.id, assignedTo: approver?.id || null };
}

/**
 * Find appropriate approver based on delegation rules
 */
async function findApprover(params: {
  requestType: string;
  amount?: number;
  requesterId: number;
}): Promise<{ id: number; name: string } | null> {
  const db = await getDb();
  if (!db) return null;

  // Map request types to authority types
  const authorityTypeMap: Record<string, string> = {
    'policy_change': 'compliance',
    'delegation': 'operational',
    'compliance': 'compliance',
    'exception': 'operational',
    'budget': 'financial',
    'other': 'operational',
  };

  const authorityType = authorityTypeMap[params.requestType] || 'operational';

  // Find active delegation that matches
  const delegations = await db.select({
    delegation: delegationAuthority,
    delegatee: users,
  })
    .from(delegationAuthority)
    .leftJoin(users, eq(delegationAuthority.delegateeId, users.id))
    .where(
      and(
        eq(delegationAuthority.authorityType, authorityType as any),
        eq(delegationAuthority.status, 'active'),
        or(
          isNull(delegationAuthority.effectiveTo),
          gte(delegationAuthority.effectiveTo, new Date())
        )
      )
    )
    .orderBy(desc(delegationAuthority.thresholdAmount));

  // Find delegation with appropriate threshold
  for (const { delegation, delegatee } of delegations) {
    if (delegatee && delegatee.id !== params.requesterId) {
      const threshold = delegation.thresholdAmount ? parseFloat(delegation.thresholdAmount) : Infinity;
      if (!params.amount || params.amount <= threshold) {
        return { id: delegatee.id, name: delegatee.name || 'Approver' };
      }
    }
  }

  // Fallback: find any admin user
  const [admin] = await db.select()
    .from(users)
    .where(eq(users.role, 'admin'))
    .limit(1);

  if (admin && admin.id !== params.requesterId) {
    return { id: admin.id, name: admin.name || 'Admin' };
  }

  return null;
}

/**
 * Build approval chain based on request type and amount
 */
async function buildApprovalChain(params: {
  requestType: string;
  amount?: number;
  requesterId: number;
}): Promise<Array<{ step: number; approverId: number; approverName: string; status: string }>> {
  const db = await getDb();
  if (!db) return [];

  const chain: Array<{ step: number; approverId: number; approverName: string; status: string }> = [];

  // For high-value requests, build multi-step chain
  if (params.amount && params.amount > 10000) {
    // Get all admins for multi-step approval
    const admins = await db.select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(3);

    admins.forEach((admin, index) => {
      if (admin.id !== params.requesterId) {
        chain.push({
          step: index + 1,
          approverId: admin.id,
          approverName: admin.name || 'Admin',
          status: index === 0 ? 'pending' : 'waiting',
        });
      }
    });
  } else {
    // Single approver for normal requests
    const approver = await findApprover(params);
    if (approver) {
      chain.push({
        step: 1,
        approverId: approver.id,
        approverName: approver.name,
        status: 'pending',
      });
    }
  }

  return chain;
}

/**
 * Approve a request
 */
export async function approveRequest(params: {
  requestId: number;
  approverId: number;
  comments?: string;
}): Promise<{ success: boolean; nextStep?: number; completed: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the request
  const [request] = await db.select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, params.requestId));

  if (!request) throw new Error("Request not found");
  if (request.status !== 'pending') throw new Error("Request is not pending");
  if (request.approverId !== params.approverId) {
    throw new Error("You are not the current approver for this request");
  }

  // Get approver info
  const [approver] = await db.select().from(users).where(eq(users.id, params.approverId));

  // Update the request
  await db.update(approvalRequests)
    .set({
      status: 'approved',
      approverId: params.approverId,
      approvedAt: new Date(),
      comments: params.comments,
      updatedAt: new Date(),
    })
    .where(eq(approvalRequests.id, params.requestId));

  const isCompleted = true;

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'approval_request',
    entityId: params.requestId,
    action: 'approve',
    userId: params.approverId,
    userName: approver?.name || 'Unknown',
    previousValue: { status: 'pending' },
    newValue: { status: 'approved' },
  });

  // Notify requester
  if (request.requesterId) {
    await createNotification({
      userId: request.requesterId,
      title: `✅ Request Approved: ${request.title}`,
      message: `Your ${request.requestType} request has been approved by ${approver?.name || 'Unknown'}.`,
      type: 'success',
      category: 'compliance',
      relatedEntityType: 'approval_request',
      relatedEntityId: params.requestId,
    });
  }

  await notifyOwner({
    title: `✅ Approval Completed: ${request.title}`,
    content: `An approval request has been fully approved.

**Title:** ${request.title}
**Type:** ${request.requestType}
**Approver:** ${approver?.name || 'Unknown'}
${params.comments ? `**Comments:** ${params.comments}` : ''}`,
  });

  return {
    success: true,
    completed: isCompleted,
  };
}

/**
 * Reject a request
 */
export async function rejectRequest(params: {
  requestId: number;
  approverId: number;
  reason: string;
}): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the request
  const [request] = await db.select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, params.requestId));

  if (!request) throw new Error("Request not found");
  if (request.status !== 'pending') throw new Error("Request is not pending");

  // Get approver info
  const [approver] = await db.select().from(users).where(eq(users.id, params.approverId));

  // Update the request
  await db.update(approvalRequests)
    .set({
      status: 'rejected',
      rejectedAt: new Date(),
      comments: params.reason,
      updatedAt: new Date(),
    })
    .where(eq(approvalRequests.id, params.requestId));

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'approval_request',
    entityId: params.requestId,
    action: 'reject',
    userId: params.approverId,
    userName: approver?.name || 'Unknown',
    previousValue: { status: 'pending' },
    newValue: { status: 'rejected', reason: params.reason },
  });

  // Notify requester
  if (request.requesterId) {
    await createNotification({
      userId: request.requesterId,
      title: `❌ Request Rejected: ${request.title}`,
      message: `Your ${request.requestType} request has been rejected. Reason: ${params.reason}`,
      type: 'warning',
      category: 'compliance',
      relatedEntityType: 'approval_request',
      relatedEntityId: params.requestId,
    });
  }

  await notifyOwner({
    title: `❌ Request Rejected: ${request.title}`,
    content: `An approval request has been rejected.

**Title:** ${request.title}
**Type:** ${request.requestType}
**Rejected By:** ${approver?.name || 'Unknown'}
**Reason:** ${params.reason}`,
  });

  return { success: true };
}

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovals(userId: number): Promise<ApprovalRequestWithDetails[]> {
  const db = await getDb();
  if (!db) return [];

  const requests = await db.select({
    request: approvalRequests,
    requester: users,
  })
    .from(approvalRequests)
    .leftJoin(users, eq(approvalRequests.requesterId, users.id))
    .where(
      and(
        eq(approvalRequests.approverId, userId),
        eq(approvalRequests.status, 'pending')
      )
    )
    .orderBy(desc(approvalRequests.createdAt));

  return requests.map(({ request, requester }) => ({
    ...request,
    requesterName: requester?.name || 'Unknown',
  } as ApprovalRequestWithDetails));
}

/**
 * Get approval history for a user (requests they've made)
 */
export async function getApprovalHistory(userId: number): Promise<ApprovalRequestWithDetails[]> {
  const db = await getDb();
  if (!db) return [];

  const requests = await db.select()
    .from(approvalRequests)
    .where(eq(approvalRequests.requesterId, userId))
    .orderBy(desc(approvalRequests.createdAt));

  return requests as ApprovalRequestWithDetails[];
}

/**
 * Escalate a request to the next level
 */
export async function escalateRequest(params: {
  requestId: number;
  userId: number;
  reason: string;
}): Promise<{ success: boolean; escalatedTo: number | null }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the request
  const [request] = await db.select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, params.requestId));

  if (!request) throw new Error("Request not found");

  // Find next level approver (admin)
  const [admin] = await db.select()
    .from(users)
    .where(eq(users.role, 'admin'))
    .limit(1);

  // Get user info
  const [user] = await db.select().from(users).where(eq(users.id, params.userId));

  // Update the request
  await db.update(approvalRequests)
    .set({
      priority: 'urgent',
      status: 'escalated',
      approverId: admin?.id || null,
      updatedAt: new Date(),
    })
    .where(eq(approvalRequests.id, params.requestId));

  // Create audit entry
  await createAuditEntryWithHash(db, {
    entityType: 'approval_request',
    entityId: params.requestId,
    action: 'update',
    userId: params.userId,
    userName: user?.name || 'Unknown',
    previousValue: { priority: request.priority },
    newValue: { priority: 'critical', escalatedTo: admin?.id, reason: params.reason },
  });

  // Notify admin
  if (admin) {
    await createNotification({
      userId: admin.id,
      title: `⚠️ Escalated Request: ${request.title}`,
      message: `A request has been escalated and requires your immediate attention. Reason: ${params.reason}`,
      type: 'alert',
      category: 'compliance',
      relatedEntityType: 'approval_request',
      relatedEntityId: params.requestId,
    });
  }

  await notifyOwner({
    title: `⚠️ Request Escalated: ${request.title}`,
    content: `An approval request has been escalated.

**Title:** ${request.title}
**Escalated By:** ${user?.name || 'Unknown'}
**Reason:** ${params.reason}`,
  });

  return { success: true, escalatedTo: admin?.id || null };
}

/**
 * Get approval statistics
 */
export async function getApprovalStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgApprovalTime: number;
  byType: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, approved: 0, rejected: 0, avgApprovalTime: 0, byType: {} };

  const allRequests = await db.select().from(approvalRequests);

  const pending = allRequests.filter(r => r.status === 'pending').length;
  const approved = allRequests.filter(r => r.status === 'approved').length;
  const rejected = allRequests.filter(r => r.status === 'rejected').length;

  // Calculate average approval time for approved requests
  const approvedRequests = allRequests.filter(r => r.status === 'approved' && r.approvedAt);
  const avgApprovalTime = approvedRequests.length > 0
    ? approvedRequests.reduce((sum, r) => {
        const created = new Date(r.createdAt).getTime();
        const approved = r.approvedAt ? new Date(r.approvedAt).getTime() : created;
        return sum + (approved - created);
      }, 0) / approvedRequests.length / (1000 * 60 * 60) // Convert to hours
    : 0;

  const byType = allRequests.reduce((acc, r) => {
    acc[r.requestType] = (acc[r.requestType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: allRequests.length,
    pending,
    approved,
    rejected,
    avgApprovalTime: Math.round(avgApprovalTime * 10) / 10,
    byType,
  };
}
