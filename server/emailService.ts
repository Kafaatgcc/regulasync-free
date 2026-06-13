/**
 * Email Service - Send email notifications using the built-in notification API
 * This service handles all email communications for the platform
 */

import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users, notifications } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Email templates
const EMAIL_TEMPLATES = {
  reminder: {
    subject: (title: string) => `Reminder: ${title}`,
    body: (data: { title: string; description?: string; dueDate: string; userName: string }) => `
Dear ${data.userName},

This is a reminder for: ${data.title}

${data.description ? `Details: ${data.description}` : ''}

Due Date: ${data.dueDate}

Please take the necessary action before the deadline.

Best regards,
RegulaSync Team
    `.trim(),
  },
  
  complianceAlert: {
    subject: (title: string) => `Compliance Alert: ${title}`,
    body: (data: { title: string; severity: string; description: string; actionRequired: string }) => `
COMPLIANCE ALERT

Severity: ${data.severity.toUpperCase()}
Issue: ${data.title}

${data.description}

Action Required: ${data.actionRequired}

Please address this issue promptly to maintain compliance.

Best regards,
RegulaSync Compliance Team
    `.trim(),
  },
  
  regulatoryUpdate: {
    subject: (source: string) => `New Regulatory Update from ${source}`,
    body: (data: { source: string; title: string; summary: string; effectiveDate: string; impactLevel: string }) => `
NEW REGULATORY UPDATE

Source: ${data.source}
Title: ${data.title}
Impact Level: ${data.impactLevel}
Effective Date: ${data.effectiveDate}

Summary:
${data.summary}

Please review this update and assess its impact on your policies.

Best regards,
RegulaSync Regulatory Intelligence
    `.trim(),
  },
  
  gapAnalysisComplete: {
    subject: () => `Gap Analysis Complete - Action Required`,
    body: (data: { totalGaps: number; criticalGaps: number; highGaps: number; recommendations: string[] }) => `
GAP ANALYSIS COMPLETE

Summary:
- Total Gaps Identified: ${data.totalGaps}
- Critical Gaps: ${data.criticalGaps}
- High Priority Gaps: ${data.highGaps}

Top Recommendations:
${data.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Please review the full analysis in your RegulaSync dashboard.

Best regards,
RegulaSync AI Analysis Team
    `.trim(),
  },
  
  approvalRequest: {
    subject: (title: string) => `Approval Required: ${title}`,
    body: (data: { title: string; requestedBy: string; type: string; description: string; deadline?: string }) => `
APPROVAL REQUEST

Type: ${data.type}
Title: ${data.title}
Requested By: ${data.requestedBy}
${data.deadline ? `Deadline: ${data.deadline}` : ''}

Description:
${data.description}

Please review and approve or reject this request in your RegulaSync dashboard.

Best regards,
RegulaSync Workflow System
    `.trim(),
  },
  
  welcomeEmail: {
    subject: () => `Welcome to RegulaSync - AI-Powered Governance Automation`,
    body: (data: { userName: string; plan: string }) => `
Welcome to RegulaSync, ${data.userName}!

Thank you for choosing RegulaSync for your governance automation needs.

Your Plan: ${data.plan}

Getting Started:
1. Complete your organization profile
2. Upload your existing policies
3. Configure your regulatory feeds
4. Set up your compliance workflows

Need help? Our support team is available at support@regulasync.co.uk

Best regards,
The RegulaSync Team
    `.trim(),
  },
  
  subscriptionConfirmation: {
    subject: (plan: string) => `Subscription Confirmed - ${plan} Plan`,
    body: (data: { userName: string; plan: string; amount: string; nextBillingDate: string }) => `
SUBSCRIPTION CONFIRMED

Dear ${data.userName},

Your subscription to RegulaSync has been confirmed.

Plan: ${data.plan}
Amount: ${data.amount}
Next Billing Date: ${data.nextBillingDate}

You now have full access to all features included in your plan.

Best regards,
RegulaSync Billing Team
    `.trim(),
  },
};

export type EmailTemplate = keyof typeof EMAIL_TEMPLATES;

interface SendEmailOptions {
  userId?: number;
  email?: string;
  template: EmailTemplate;
  data: Record<string, any>;
  createNotification?: boolean;
}

/**
 * Send an email using the notification system
 * In production, this would integrate with a real email service like SendGrid or Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { userId, email, template, data, createNotification = true } = options;
  
  try {
    const templateConfig = EMAIL_TEMPLATES[template];
    if (!templateConfig) {
      throw new Error(`Unknown email template: ${template}`);
    }
    
    // Get user email if not provided
    let recipientEmail = email;
    let userName = data.userName || 'User';
    
    if (userId && !recipientEmail) {
      const db = await getDb();
      if (db) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0) {
          recipientEmail = user[0].email || undefined;
          userName = user[0].name || 'User';
        }
      }
    }
    
    // Generate email content
    const subject = templateConfig.subject(data.title || data.source || data.plan || '');
    const body = (templateConfig.body as (data: Record<string, any>) => string)({ ...data, userName });
    
    // Log the email (in production, this would send via email service)
    console.log(`[Email] Sending ${template} email to ${recipientEmail || 'owner'}`);
    console.log(`[Email] Subject: ${subject}`);
    
    // Use the built-in notification system to notify the owner
    // In production, replace this with actual email sending
    const notificationResult = await notifyOwner({
      title: subject,
      content: body,
    });
    
    // Create in-app notification if requested
    if (createNotification && userId) {
      const db = await getDb();
      if (db) {
        await db.insert(notifications).values({
          userId,
          title: subject,
          message: body.substring(0, 500) + (body.length > 500 ? '...' : ''),
          type: getNotificationType(template),
          category: getNotificationCategory(template),
          isRead: false,
        });
      }
    }
    
    return {
      success: notificationResult,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function getNotificationType(template: EmailTemplate): "reminder" | "alert" | "info" | "warning" | "success" {
  switch (template) {
    case 'reminder':
      return 'reminder';
    case 'complianceAlert':
      return 'alert';
    case 'gapAnalysisComplete':
      return 'warning';
    case 'welcomeEmail':
    case 'subscriptionConfirmation':
      return 'success';
    default:
      return 'info';
  }
}

function getNotificationCategory(template: EmailTemplate): "deadline" | "compliance" | "policy" | "regulatory" | "system" {
  switch (template) {
    case 'reminder':
      return 'deadline';
    case 'complianceAlert':
    case 'gapAnalysisComplete':
      return 'compliance';
    case 'regulatoryUpdate':
      return 'regulatory';
    case 'approvalRequest':
      return 'policy';
    default:
      return 'system';
  }
}

/**
 * Send reminder email
 */
export async function sendReminderEmail(userId: number, reminder: {
  title: string;
  description?: string;
  dueDate: Date;
}): Promise<boolean> {
  const result = await sendEmail({
    userId,
    template: 'reminder',
    data: {
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
  });
  return result.success;
}

/**
 * Send compliance alert email
 */
export async function sendComplianceAlert(userId: number, alert: {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actionRequired: string;
}): Promise<boolean> {
  const result = await sendEmail({
    userId,
    template: 'complianceAlert',
    data: alert,
  });
  return result.success;
}

/**
 * Send regulatory update notification
 */
export async function sendRegulatoryUpdateEmail(userId: number, update: {
  source: string;
  title: string;
  summary: string;
  effectiveDate: Date;
  impactLevel: string;
}): Promise<boolean> {
  const result = await sendEmail({
    userId,
    template: 'regulatoryUpdate',
    data: {
      ...update,
      effectiveDate: update.effectiveDate.toLocaleDateString('en-GB'),
    },
  });
  return result.success;
}

/**
 * Send gap analysis complete notification
 */
export async function sendGapAnalysisEmail(userId: number, analysis: {
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
  recommendations: string[];
}): Promise<boolean> {
  const result = await sendEmail({
    userId,
    template: 'gapAnalysisComplete',
    data: analysis,
  });
  return result.success;
}

/**
 * Send approval request email
 */
export async function sendApprovalRequestEmail(approverId: number, request: {
  title: string;
  requestedBy: string;
  type: string;
  description: string;
  deadline?: Date;
}): Promise<boolean> {
  const result = await sendEmail({
    userId: approverId,
    template: 'approvalRequest',
    data: {
      ...request,
      deadline: request.deadline?.toLocaleDateString('en-GB'),
    },
  });
  return result.success;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userId: number, plan: string, userName?: string): Promise<boolean> {
  const result = await sendEmail({
    userId,
    template: 'welcomeEmail',
    data: { plan, userName: userName || 'User' },
  });
  return result.success;
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmation(userId: number, subscription: {
  plan: string;
  amount: string;
  nextBillingDate: Date;
}): Promise<boolean> {
  const result = await sendEmail({
    userId,
    template: 'subscriptionConfirmation',
    data: {
      ...subscription,
      nextBillingDate: subscription.nextBillingDate.toLocaleDateString('en-GB'),
    },
  });
  return result.success;
}

/**
 * Batch send emails to multiple users
 */
export async function sendBulkEmail(userIds: number[], template: EmailTemplate, data: Record<string, any>): Promise<{
  sent: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };
  
  for (const userId of userIds) {
    const result = await sendEmail({ userId, template, data });
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      if (result.error) {
        results.errors.push(`User ${userId}: ${result.error}`);
      }
    }
  }
  
  return results;
}
