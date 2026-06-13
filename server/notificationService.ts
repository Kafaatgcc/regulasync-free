/**
 * Notification Service
 * 
 * Handles user notifications and scheduled reminders.
 * Integrates with the built-in notification system and database.
 */

import { getDb } from "./db";
import { notifications, reminders, users } from "../drizzle/schema";
import { eq, and, lte, desc, isNull } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendReminderEmail } from "./emailService";

/**
 * Create a notification for a user
 */
export async function createNotification(params: {
  userId: number;
  title: string;
  message: string;
  type?: 'reminder' | 'alert' | 'info' | 'warning' | 'success';
  category?: 'deadline' | 'compliance' | 'policy' | 'regulatory' | 'system';
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  scheduledFor?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [notification] = await db.insert(notifications).values({
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type || 'info',
    category: params.category || 'system',
    relatedEntityType: params.relatedEntityType,
    relatedEntityId: params.relatedEntityId,
    actionUrl: params.actionUrl,
    scheduledFor: params.scheduledFor,
    sentAt: params.scheduledFor ? null : new Date(),
  }).$returningId();

  return notification;
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: number, options?: {
  unreadOnly?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(notifications).where(eq(notifications.userId, userId));
  
  if (options?.unreadOnly) {
    query = db.select().from(notifications).where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    );
  }

  return await query
    .orderBy(desc(notifications.createdAt))
    .limit(options?.limit || 50);
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );

  return { success: true };
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    );

  return { success: true };
}

/**
 * Create a scheduled reminder
 */
export async function createReminder(params: {
  userId: number;
  title: string;
  description?: string;
  triggerAt: Date;
  reminderType?: 'email' | 'notification' | 'both';
  relatedEntityType?: string;
  relatedEntityId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [reminder] = await db.insert(reminders).values({
    userId: params.userId,
    title: params.title,
    description: params.description,
    triggerAt: params.triggerAt,
    reminderType: params.reminderType || 'both',
    relatedEntityType: params.relatedEntityType,
    relatedEntityId: params.relatedEntityId,
    status: 'pending',
  }).$returningId();

  // Also notify the owner about the reminder being set
  await notifyOwner({
    title: `📅 Reminder Scheduled: ${params.title}`,
    content: `A reminder has been scheduled for ${params.triggerAt.toLocaleString()}.

**Event:** ${params.title}
${params.description ? `**Description:** ${params.description}` : ''}
**Reminder Type:** ${params.reminderType || 'both'}`,
  });

  return reminder;
}

/**
 * Get reminders for a user
 */
export async function getUserReminders(userId: number, options?: {
  pendingOnly?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(reminders.userId, userId);
  
  if (options?.pendingOnly) {
    whereClause = and(
      eq(reminders.userId, userId),
      eq(reminders.status, 'pending')
    ) as typeof whereClause;
  }

  return await db.select()
    .from(reminders)
    .where(whereClause)
    .orderBy(desc(reminders.triggerAt))
    .limit(options?.limit || 50);
}

/**
 * Cancel a reminder
 */
export async function cancelReminder(reminderId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reminders)
    .set({ status: 'cancelled' })
    .where(
      and(
        eq(reminders.id, reminderId),
        eq(reminders.userId, userId)
      )
    );

  return { success: true };
}

/**
 * Process due reminders (would be called by a cron job in production)
 */
export async function processDueReminders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  
  // Get all pending reminders that are due
  const dueReminders = await db.select({
    reminder: reminders,
    user: users,
  })
    .from(reminders)
    .leftJoin(users, eq(reminders.userId, users.id))
    .where(
      and(
        eq(reminders.status, 'pending'),
        lte(reminders.triggerAt, now)
      )
    );

  const processed: number[] = [];
  const failed: number[] = [];

  for (const { reminder, user } of dueReminders) {
    try {
      // Create in-app notification
      if (reminder.reminderType === 'notification' || reminder.reminderType === 'both') {
        await createNotification({
          userId: reminder.userId,
          title: `⏰ Reminder: ${reminder.title}`,
          message: reminder.description || `This is your scheduled reminder for: ${reminder.title}`,
          type: 'reminder',
          category: 'deadline',
          relatedEntityType: reminder.relatedEntityType || undefined,
          relatedEntityId: reminder.relatedEntityId || undefined,
        });
      }

      // Send email notification
      if (reminder.reminderType === 'email' || reminder.reminderType === 'both') {
        await sendReminderEmail(reminder.userId, {
          title: reminder.title,
          description: reminder.description || undefined,
          dueDate: reminder.triggerAt,
        });
      }

      // Mark reminder as sent
      await db.update(reminders)
        .set({ status: 'sent', sentAt: now })
        .where(eq(reminders.id, reminder.id));

      processed.push(reminder.id);
    } catch (error) {
      console.error(`Failed to process reminder ${reminder.id}:`, error);
      failed.push(reminder.id);
    }
  }

  return {
    processed: processed.length,
    failed: failed.length,
    processedIds: processed,
    failedIds: failed,
  };
}

/**
 * Get notification statistics for a user
 */
export async function getNotificationStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, unread: 0, byType: {} };

  const allNotifications = await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId));

  const unread = allNotifications.filter(n => !n.isRead).length;
  
  const byType = allNotifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = allNotifications.reduce((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: allNotifications.length,
    unread,
    byType,
    byCategory,
  };
}
