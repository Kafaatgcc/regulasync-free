/**
 * Platform Settings Service
 *
 * Manages dynamic, admin-controlled platform configuration stored in the database.
 * Replaces all hardcoded values with database-driven settings.
 */
import { getDb } from "./db";
import { platformSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const DEFAULT_SETTINGS = [
  // Company Identity
  { key: "company_name", value: "RegulaSync", type: "string", category: "identity", isPublic: true, description: "Platform name" },
  { key: "company_tagline", value: "AI-Powered Regulatory Compliance for UK Businesses", type: "string", category: "identity", isPublic: true, description: "Platform tagline" },
  { key: "company_email", value: "hello@regulasync.co.uk", type: "string", category: "identity", isPublic: true, description: "Primary contact email" },
  { key: "company_phone", value: "+44 20 7946 0958", type: "string", category: "identity", isPublic: true, description: "Contact phone" },
  { key: "company_address", value: "71-75 Shelton Street, Covent Garden, London, WC2H 9JQ", type: "string", category: "identity", isPublic: true, description: "Registered address" },
  { key: "company_registration", value: "15847293", type: "string", category: "identity", isPublic: true, description: "Companies House registration number" },
  { key: "company_ico_number", value: "ZB847291", type: "string", category: "identity", isPublic: true, description: "ICO registration number" },
  // Founder
  { key: "founder_name", value: "Baidaa Housen", type: "string", category: "identity", isPublic: true, description: "Founder name" },
  { key: "founder_title", value: "Founder & CEO", type: "string", category: "identity", isPublic: true, description: "Founder title" },
  { key: "founder_linkedin", value: "https://www.linkedin.com/in/baidaa-housen", type: "string", category: "identity", isPublic: true, description: "Founder LinkedIn URL" },
  { key: "founder_bio", value: "Baidaa Housen is a regulatory technology innovator with deep expertise in UK financial services compliance, FCA regulation, and AI-driven governance solutions. RegulaSync was founded to democratise enterprise-grade compliance for UK SMEs.", type: "string", category: "identity", isPublic: true, description: "Founder biography" },
  // Social Media
  { key: "social_linkedin", value: "https://www.linkedin.com/company/regulasync", type: "string", category: "social", isPublic: true, description: "LinkedIn company page" },
  { key: "social_twitter", value: "https://twitter.com/regulasync", type: "string", category: "social", isPublic: true, description: "Twitter/X profile" },
  { key: "social_github", value: "https://github.com/regulasync", type: "string", category: "social", isPublic: true, description: "GitHub profile" },
  // Feature Flags
  { key: "feature_agentic_ai", value: "true", type: "boolean", category: "features", isPublic: false, description: "Enable Agentic AI autonomous tasks" },
  { key: "feature_tprm", value: "true", type: "boolean", category: "features", isPublic: false, description: "Enable Third-Party Risk Management" },
  { key: "feature_esg", value: "true", type: "boolean", category: "features", isPublic: false, description: "Enable ESG Tracking" },
  { key: "feature_compliance_passport", value: "true", type: "boolean", category: "features", isPublic: false, description: "Enable Compliance Passports" },
  { key: "feature_incident_simulation", value: "true", type: "boolean", category: "features", isPublic: false, description: "Enable Incident Simulation" },
  { key: "feature_regulator_portal", value: "true", type: "boolean", category: "features", isPublic: false, description: "Enable Regulator Portal" },
  { key: "feature_benchmarking", value: "true", type: "boolean", category: "features", isPublic: false, description: "Enable Peer Benchmarking" },
  { key: "feature_university_program", value: "true", type: "boolean", category: "features", isPublic: false, description: "Enable University Partnership Program" },
  // UK Regulatory Bodies
  { key: "uk_regulatory_bodies", value: JSON.stringify(["FCA", "PRA", "ICO", "Bank of England", "FRC", "CMA", "PCA"]), type: "json", category: "regulatory", isPublic: true, description: "Supported UK regulatory bodies" },
  // Job Creation (Visa requirement)
  { key: "planned_uk_jobs_year1", value: "5", type: "number", category: "corporate", isPublic: true, description: "Planned UK job creation in Year 1" },
  { key: "planned_uk_jobs_year3", value: "25", type: "number", category: "corporate", isPublic: true, description: "Planned UK job creation by Year 3" },
  { key: "uk_headquarters", value: "London, United Kingdom", type: "string", category: "corporate", isPublic: true, description: "UK headquarters location" },
];

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const [setting] = await db.select().from(platformSettings).where(eq(platformSettings.settingKey, key)).limit(1);
  return setting?.settingValue ?? null;
}

export async function getAllSettings(category?: string) {
  const db = await getDb();
  if (!db) return [];
  const all = await db.select().from(platformSettings);
  if (category) return all.filter(s => s.category === category);
  return all;
}

export async function getPublicSettings() {
  const db = await getDb();
  if (!db) return {};
  const all = await db.select().from(platformSettings).where(eq(platformSettings.isPublic, true));
  return all.reduce((acc, s) => {
    let val: unknown = s.settingValue;
    if (s.settingType === "boolean") val = s.settingValue === "true";
    if (s.settingType === "number") val = Number(s.settingValue);
    if (s.settingType === "json") { try { val = JSON.parse(s.settingValue || "null"); } catch {} }
    acc[s.settingKey] = val;
    return acc;
  }, {} as Record<string, unknown>);
}

export async function updateSetting(key: string, value: string, updatedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(platformSettings)
    .set({ settingValue: value, updatedBy })
    .where(eq(platformSettings.settingKey, key));
  return { success: true };
}

export async function seedDefaultSettings() {
  const db = await getDb();
  if (!db) return;
  for (const s of DEFAULT_SETTINGS) {
    try {
      await db.insert(platformSettings).values({
        settingKey: s.key,
        settingValue: s.value,
        settingType: s.type as any,
        category: s.category,
        description: s.description,
        isPublic: s.isPublic,
      }).onDuplicateKeyUpdate({ set: { settingValue: s.value } });
    } catch {}
  }
}
