import Stripe from "stripe";
import { getDb } from "../db";
import { subscriptions, paymentHistory } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SUBSCRIPTION_PLANS, getPlanById } from "./products";

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: number,
  email: string,
  name?: string
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existingSub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existingSub.length > 0 && existingSub[0].stripeCustomerId) {
    return existingSub[0].stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId: userId.toString() },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(params: {
  userId: number;
  email: string;
  name?: string;
  planId: string;
  billingPeriod: "monthly" | "yearly";
  origin: string;
  trialDays?: number;
}): Promise<{ url: string; sessionId: string }> {
  const { userId, email, name, planId, billingPeriod, origin, trialDays } = params;

  const plan = getPlanById(planId);
  if (!plan) throw new Error(`Invalid plan: ${planId}`);

  const customerId = await getOrCreateStripeCustomer(userId, email, name);
  const priceInPence = billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const interval = billingPeriod === "yearly" ? "year" : "month";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId.toString(),
    mode: "subscription",
    allow_promotion_codes: true,
    billing_address_collection: "required",
    line_items: [{
      price_data: {
        currency: "gbp",
        product_data: {
          name: `RegulaSync ${plan.name}`,
          description: plan.description,
          metadata: { planId: plan.id },
        },
        unit_amount: priceInPence,
        recurring: { interval },
      },
      quantity: 1,
    }],
    subscription_data: {
      trial_period_days: trialDays,
      metadata: { userId: userId.toString(), planId: plan.id, billingPeriod },
    },
    metadata: {
      user_id: userId.toString(),
      customer_email: email,
      customer_name: name || "",
      plan_id: planId,
      billing_period: billingPeriod,
    },
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=true`,
  });

  return { url: session.url!, sessionId: session.id };
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

/**
 * Handle successful checkout
 */
export async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const userId = parseInt(session.metadata?.user_id || session.client_reference_id || "0");
  const planId = session.metadata?.plan_id || "core";

  if (!userId) {
    console.error("[Stripe] No user ID in checkout session");
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subData = stripeSubscription as any;

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingSub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const subscriptionData = {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: stripeSubscription.items.data[0]?.price.id,
    plan: planId as "core" | "professional" | "enterprise",
    status: subData.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
    currentPeriodStart: subData.current_period_start ? new Date(subData.current_period_start * 1000) : null,
    currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null,
    cancelAtPeriodEnd: subData.cancel_at_period_end || false,
    trialEnd: subData.trial_end ? new Date(subData.trial_end * 1000) : null,
  };

  if (existingSub.length > 0) {
    await db.update(subscriptions).set(subscriptionData).where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values(subscriptionData);
  }

  console.log(`[Stripe] Subscription created/updated for user ${userId}: ${planId}`);
}

/**
 * Handle subscription updated
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const subData = subscription as any;

  await db
    .update(subscriptions)
    .set({
      status: subData.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
      currentPeriodStart: subData.current_period_start ? new Date(subData.current_period_start * 1000) : null,
      currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subData.cancel_at_period_end || false,
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe] Subscription updated: ${subscription.id}`);
}

/**
 * Handle subscription deleted
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(subscriptions)
    .set({ status: "canceled" })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe] Subscription canceled: ${subscription.id}`);
}

/**
 * Handle successful payment
 */
export async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const customer = paymentIntent.customer as string;
  const existingSub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, customer))
    .limit(1);

  if (existingSub.length > 0) {
    await db.insert(paymentHistory).values({
      userId: existingSub[0].userId,
      stripePaymentIntentId: paymentIntent.id,
      stripeInvoiceId: ((paymentIntent as any).invoice as string) || null,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      status: "succeeded",
      description: paymentIntent.description || "Subscription payment",
    });
  }

  console.log(`[Stripe] Payment succeeded: ${paymentIntent.id}`);
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return { subscription: null, stripeSubscription: null };

  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (sub.length === 0) return { subscription: null, stripeSubscription: null };

  let stripeSubscription: Stripe.Subscription | null = null;
  if (sub[0].stripeSubscriptionId) {
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(sub[0].stripeSubscriptionId);
    } catch (error) {
      console.error("[Stripe] Error fetching subscription:", error);
    }
  }

  return { subscription: sub[0], stripeSubscription };
}

/**
 * Get user's payment history
 */
export async function getUserPaymentHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.userId, userId))
    .orderBy(paymentHistory.createdAt);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  }
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
}
