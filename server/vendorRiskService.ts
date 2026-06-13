/**
 * Vendor Risk Management (TPRM) Service
 *
 * Manages third-party vendor compliance assessments, risk scoring,
 * and AI-powered questionnaire evaluation.
 */
import { getDb } from "./db";
import { vendors, vendorAssessments, auditTrail } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { createAuditEntryWithHash } from "./auditCache";

const UK_VENDOR_QUESTIONNAIRE = [
  { id: "q1", category: "Data Protection", question: "Does your organisation have a documented Data Protection Policy compliant with UK GDPR?", weight: 15 },
  { id: "q2", category: "Data Protection", question: "Have you appointed a Data Protection Officer (DPO)?", weight: 10 },
  { id: "q3", category: "Information Security", question: "Do you hold ISO 27001 certification or equivalent?", weight: 15 },
  { id: "q4", category: "Information Security", question: "Do you conduct annual penetration testing by a CREST-accredited firm?", weight: 10 },
  { id: "q5", category: "Business Continuity", question: "Do you have a documented Business Continuity Plan (BCP) tested in the last 12 months?", weight: 10 },
  { id: "q6", category: "Financial Stability", question: "Has your organisation been subject to any regulatory sanctions in the last 3 years?", weight: 15, invertScore: true },
  { id: "q7", category: "Regulatory Compliance", question: "Are you registered with or regulated by the FCA, ICO, or other UK regulatory body?", weight: 15 },
  { id: "q8", category: "Sub-contractors", question: "Do you have a formal process for managing and vetting your own sub-contractors?", weight: 10 },
];

export async function getVendors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vendors).orderBy(desc(vendors.createdAt));
}

export async function getVendorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
  return vendor || null;
}

export async function createVendor(data: {
  name: string;
  website?: string;
  contactEmail?: string;
  contactName?: string;
  industry?: string;
  country?: string;
  riskTier?: "critical" | "high" | "medium" | "low";
  notes?: string;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(vendors).values({
    ...data,
    status: "active",
    overallRiskScore: 0,
  });
  return { id: (result as any).insertId };
}

export async function getVendorAssessments(vendorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vendorAssessments)
    .where(eq(vendorAssessments.vendorId, vendorId))
    .orderBy(desc(vendorAssessments.createdAt));
}

export async function createVendorAssessment(data: {
  vendorId: number;
  assessedBy?: number;
  responses: Record<string, string>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate score based on responses
  let totalScore = 0;
  let totalWeight = 0;
  const findings: string[] = [];

  for (const q of UK_VENDOR_QUESTIONNAIRE) {
    const answer = data.responses[q.id];
    const isYes = answer?.toLowerCase() === "yes";
    const score = q.invertScore ? (isYes ? 0 : 100) : (isYes ? 100 : 0);
    totalScore += score * q.weight;
    totalWeight += q.weight;
    if (!isYes && !q.invertScore) findings.push(`Gap identified: ${q.question}`);
    if (isYes && q.invertScore) findings.push(`Risk flag: ${q.question}`);
  }

  const aiScore = Math.round(totalScore / totalWeight);

  // Get AI summary
  const vendor = await getVendorById(data.vendorId);
  let aiSummary = "";
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a UK regulatory compliance expert specialising in third-party vendor risk management. Provide a concise, professional risk assessment summary."
        },
        {
          role: "user",
          content: `Vendor: ${vendor?.name || "Unknown"}
Industry: ${vendor?.industry || "Unknown"}
Risk Score: ${aiScore}/100
Key Findings: ${findings.join("; ")}

Provide a 2-3 sentence professional risk assessment summary and key recommendations.`
        }
      ],
      });
    aiSummary = String(response);
  } catch {
    aiSummary = `Vendor risk score: ${aiScore}/100. ${findings.length} compliance gaps identified requiring attention.`;
  }

  const [result] = await db.insert(vendorAssessments).values({
    vendorId: data.vendorId,
    assessedBy: data.assessedBy,
    questionnaire: UK_VENDOR_QUESTIONNAIRE,
    responses: data.responses,
    aiScore,
    aiSummary,
    riskFindings: findings,
    status: "completed",
    completedAt: new Date(),
  });

  // Update vendor's overall risk score
  await db.update(vendors)
    .set({ overallRiskScore: aiScore, lastAssessedAt: new Date() })
    .where(eq(vendors.id, data.vendorId));

  return { id: (result as any).insertId, aiScore, aiSummary, findings };
}

export function getVendorQuestionnaire() {
  return UK_VENDOR_QUESTIONNAIRE;
}
