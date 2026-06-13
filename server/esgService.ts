/**
 * ESG Tracking Service
 *
 * Manages Environmental, Social, and Governance metrics,
 * aligned with UK regulatory reporting requirements.
 */
import { getDb } from "./db";
import { esgMetrics, organizations } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

const ESG_FRAMEWORK_METRICS = {
  environmental: [
    { name: "Carbon Emissions (Scope 1 & 2)", unit: "tCO2e", framework: "TCFD / UK SECR", target: "Net Zero by 2050" },
    { name: "Energy Consumption", unit: "kWh", framework: "UK SECR", target: "Reduce 20% by 2027" },
    { name: "Renewable Energy Usage", unit: "%", framework: "TCFD", target: "100% by 2030" },
    { name: "Paper & Waste Reduction", unit: "kg", framework: "ISO 14001", target: "50% reduction" },
  ],
  social: [
    { name: "Gender Pay Gap", unit: "%", framework: "UK Equality Act", target: "< 5%" },
    { name: "Employee Training Hours", unit: "hours/employee", framework: "ISO 45001", target: "> 40 hrs/year" },
    { name: "Diversity & Inclusion Index", unit: "score/100", framework: "UK Corporate Governance Code", target: "> 75" },
    { name: "Employee Wellbeing Score", unit: "score/100", framework: "ISO 45003", target: "> 80" },
  ],
  governance: [
    { name: "Board Independence Ratio", unit: "%", framework: "UK Corporate Governance Code", target: "> 50%" },
    { name: "Anti-Bribery Training Completion", unit: "%", framework: "UK Bribery Act 2010", target: "100%" },
    { name: "Whistleblowing Cases Resolved", unit: "%", framework: "FCA SYSC", target: "100% within 30 days" },
    { name: "Policy Review Compliance Rate", unit: "%", framework: "FCA Handbook", target: "> 95%" },
  ],
};

export async function getEsgMetrics(category?: "environmental" | "social" | "governance") {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(esgMetrics)
      .where(eq(esgMetrics.category, category))
      .orderBy(desc(esgMetrics.createdAt));
  }
  return db.select().from(esgMetrics).orderBy(desc(esgMetrics.createdAt));
}

export async function createEsgMetric(data: {
  organizationId?: number;
  reportingPeriod: string;
  category: "environmental" | "social" | "governance";
  metricName: string;
  metricValue: string;
  unit?: string;
  target?: string;
  status?: "on_track" | "at_risk" | "off_track" | "achieved";
  regulatoryFramework?: string;
  notes?: string;
  recordedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(esgMetrics).values(data);
  return { id: (result as any).insertId };
}

export async function getEsgSummary() {
  const db = await getDb();
  if (!db) return null;
  const all = await db.select().from(esgMetrics);
  const byCategory = all.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = { total: 0, on_track: 0, at_risk: 0, off_track: 0, achieved: 0 };
    acc[m.category].total++;
    acc[m.category][m.status]++;
    return acc;
  }, {} as Record<string, Record<string, number>>);
  const overallScore = all.length > 0
    ? Math.round((all.filter(m => m.status === "on_track" || m.status === "achieved").length / all.length) * 100)
    : 0;
  return { total: all.length, byCategory, overallScore };
}

export function getEsgFrameworkMetrics() {
  return ESG_FRAMEWORK_METRICS;
}

export async function seedEsgData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const period = "Q2 2026";
  const seedData = [
    // Environmental
    { category: "environmental" as const, metricName: "Carbon Emissions (Scope 1 & 2)", metricValue: "12.4", unit: "tCO2e", target: "Net Zero by 2050", status: "on_track" as const, regulatoryFramework: "TCFD / UK SECR" },
    { category: "environmental" as const, metricName: "Energy Consumption", metricValue: "48,200", unit: "kWh", target: "Reduce 20% by 2027", status: "on_track" as const, regulatoryFramework: "UK SECR" },
    { category: "environmental" as const, metricName: "Renewable Energy Usage", metricValue: "67", unit: "%", target: "100% by 2030", status: "on_track" as const, regulatoryFramework: "TCFD" },
    // Social
    { category: "social" as const, metricName: "Gender Pay Gap", metricValue: "8.2", unit: "%", target: "< 5%", status: "at_risk" as const, regulatoryFramework: "UK Equality Act" },
    { category: "social" as const, metricName: "Employee Training Hours", metricValue: "38", unit: "hours/employee", target: "> 40 hrs/year", status: "at_risk" as const, regulatoryFramework: "ISO 45001" },
    { category: "social" as const, metricName: "Diversity & Inclusion Index", metricValue: "78", unit: "score/100", target: "> 75", status: "achieved" as const, regulatoryFramework: "UK Corporate Governance Code" },
    // Governance
    { category: "governance" as const, metricName: "Board Independence Ratio", metricValue: "55", unit: "%", target: "> 50%", status: "achieved" as const, regulatoryFramework: "UK Corporate Governance Code" },
    { category: "governance" as const, metricName: "Anti-Bribery Training Completion", metricValue: "94", unit: "%", target: "100%", status: "at_risk" as const, regulatoryFramework: "UK Bribery Act 2010" },
    { category: "governance" as const, metricName: "Policy Review Compliance Rate", metricValue: "97", unit: "%", target: "> 95%", status: "achieved" as const, regulatoryFramework: "FCA Handbook" },
  ];

  for (const item of seedData) {
    await db.insert(esgMetrics).values({
      ...item,
      reportingPeriod: period,
      recordedBy: userId,
    }).onDuplicateKeyUpdate({ set: { metricValue: item.metricValue } }).catch(() => {});
  }
  return { seeded: seedData.length };
}
