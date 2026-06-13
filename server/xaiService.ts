/**
 * Explainable AI (XAI) Service
 *
 * Creates and retrieves explainability logs for every AI recommendation,
 * providing full transparency into AI decision-making for FCA compliance.
 */
import { getDb } from "./db";
import { aiExplainabilityLogs, aiRecommendations, regulatoryUpdates, policies } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getXaiLogs(filters?: { recommendationId?: number; policyId?: number }) {
  const db = await getDb();
  if (!db) return [];
  if (filters?.recommendationId) {
    return db.select().from(aiExplainabilityLogs)
      .where(eq(aiExplainabilityLogs.recommendationId, filters.recommendationId))
      .orderBy(desc(aiExplainabilityLogs.createdAt));
  }
  if (filters?.policyId) {
    return db.select().from(aiExplainabilityLogs)
      .where(eq(aiExplainabilityLogs.policyId, filters.policyId))
      .orderBy(desc(aiExplainabilityLogs.createdAt));
  }
  return db.select().from(aiExplainabilityLogs).orderBy(desc(aiExplainabilityLogs.createdAt)).limit(100);
}

export async function createXaiLog(data: {
  recommendationId?: number;
  policyId?: number;
  regulatoryUpdateId?: number;
  modelUsed?: string;
  inputContext?: string;
  regulatoryReferences?: string[];
  policyClausesAnalyzed?: string[];
  confidenceScore?: number;
  reasoning?: string;
  decisionFactors?: Record<string, unknown>;
  alternativesConsidered?: string[];
  humanReviewRequired?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(aiExplainabilityLogs).values({
    ...data,
    modelUsed: data.modelUsed || "gpt-4o-mini",
  });
  return { id: (result as any).insertId };
}

export async function getXaiSummary() {
  const db = await getDb();
  if (!db) return null;
  const all = await db.select().from(aiExplainabilityLogs);
  const avgConfidence = all.length > 0
    ? Math.round(all.reduce((s, l) => s + (l.confidenceScore || 0), 0) / all.length)
    : 0;
  return {
    total: all.length,
    avgConfidence,
    humanReviewRequired: all.filter(l => l.humanReviewRequired).length,
    reviewed: all.filter(l => l.reviewedAt).length,
    byModel: all.reduce((acc, l) => {
      const model = l.modelUsed || "unknown";
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

export async function markXaiLogReviewed(id: number, reviewedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiExplainabilityLogs)
    .set({ reviewedBy, reviewedAt: new Date() })
    .where(eq(aiExplainabilityLogs.id, id));
  return { success: true };
}
