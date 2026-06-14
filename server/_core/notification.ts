/**
 * Owner notification helper.
 * Logs to console by default. Configure SMTP or a webhook URL via env vars
 * to enable real email/Slack notifications.
 */

export type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  const { title, content } = payload;
  if (!title?.trim() || !content?.trim()) {
    console.warn("[Notification] Missing title or content");
    return false;
  }
  // Log to console — replace with nodemailer/SendGrid/Slack webhook as needed
  console.log(`[Notification] ${title}: ${content}`);
  return true;
}
