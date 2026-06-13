/**
 * Database Seeding Script
 * 
 * Populates the database with initial data for testing and demo purposes.
 */

import { getDb } from "./db";
import { 
  policies, 
  delegationAuthority, 
  complianceRecords, 
  regulatoryUpdates,
  departments,
  aiRecommendations,
  users
} from "../drizzle/schema";
import { createAuditEntryWithHash } from "./auditCache";
import { eq } from "drizzle-orm";

/**
 * Seed initial policies
 */
export async function seedPolicies(userId: number, userName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if policies already exist
  const existingPolicies = await db.select().from(policies);
  if (existingPolicies.length > 0) {
    console.log("Policies already seeded, skipping...");
    return existingPolicies.length;
  }

  const policiesData = [
    {
      title: "Anti-Money Laundering (AML) Policy",
      description: "Comprehensive policy for detecting and preventing money laundering activities in accordance with UK regulations.",
      category: "compliance" as const,
      status: "active" as const,
      priority: "critical" as const,
      effectiveDate: new Date("2024-01-01"),
      reviewDate: new Date("2025-01-01"),
      ownerId: userId,
      departmentScope: "All Departments",
      complianceScore: 92,
      version: 3,
    },
    {
      title: "Data Protection & GDPR Compliance",
      description: "Policy ensuring compliance with UK GDPR and Data Protection Act 2018 requirements.",
      category: "data_protection" as const,
      status: "active" as const,
      priority: "critical" as const,
      effectiveDate: new Date("2024-03-15"),
      reviewDate: new Date("2025-03-15"),
      ownerId: userId,
      departmentScope: "IT, Legal, Operations",
      complianceScore: 88,
      version: 2,
    },
    {
      title: "Financial Crime Prevention Policy",
      description: "Policy for preventing, detecting, and reporting financial crimes including fraud and bribery.",
      category: "financial" as const,
      status: "active" as const,
      priority: "high" as const,
      effectiveDate: new Date("2024-02-01"),
      reviewDate: new Date("2025-02-01"),
      ownerId: userId,
      departmentScope: "Finance, Compliance, Operations",
      complianceScore: 85,
      version: 2,
    },
    {
      title: "Operational Risk Management Policy",
      description: "Framework for identifying, assessing, and mitigating operational risks across the organization.",
      category: "risk_management" as const,
      status: "active" as const,
      priority: "high" as const,
      effectiveDate: new Date("2024-01-15"),
      reviewDate: new Date("2025-01-15"),
      ownerId: userId,
      departmentScope: "All Departments",
      complianceScore: 78,
      version: 1,
    },
    {
      title: "IT Security & Cyber Resilience Policy",
      description: "Policy for maintaining IT security standards and cyber resilience in line with FCA requirements.",
      category: "it_security" as const,
      status: "pending_review" as const,
      priority: "critical" as const,
      effectiveDate: new Date("2024-06-01"),
      reviewDate: new Date("2025-06-01"),
      ownerId: userId,
      departmentScope: "IT, Security",
      complianceScore: 72,
      version: 1,
    },
    {
      title: "Consumer Duty Compliance Policy",
      description: "Policy ensuring compliance with FCA Consumer Duty requirements for fair customer outcomes.",
      category: "compliance" as const,
      status: "draft" as const,
      priority: "critical" as const,
      effectiveDate: new Date("2025-01-01"),
      reviewDate: new Date("2026-01-01"),
      ownerId: userId,
      departmentScope: "Customer Service, Sales, Compliance",
      complianceScore: 0,
      version: 1,
    },
  ];

  for (const policy of policiesData) {
    const [inserted] = await db.insert(policies).values(policy).$returningId();
    
    // Create audit entry for each policy
    await createAuditEntryWithHash(db, {
      entityType: "policy",
      entityId: inserted.id,
      action: "create",
      userId,
      userName,
      newValue: { title: policy.title, status: policy.status },
    });
  }

  return policiesData.length;
}

/**
 * Seed regulatory updates from real UK regulators
 */
export async function seedRegulatoryUpdates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if regulatory updates already exist
  const existingUpdates = await db.select().from(regulatoryUpdates);
  if (existingUpdates.length > 0) {
    console.log("Regulatory updates already seeded, skipping...");
    return existingUpdates.length;
  }

  const updates = [
    {
      title: "PS24/1: Strengthening protections for borrowers in financial difficulty",
      summary: "The FCA has published final rules to strengthen protections for borrowers in financial difficulty, including requirements for firms to provide tailored support.",
      source: "Financial Conduct Authority",
      sourceUrl: "https://www.fca.org.uk/publications/policy-statements/ps24-1",
      regulatoryBody: "FCA",
      jurisdiction: "UK",
      effectiveDate: new Date("2024-11-01"),
      impactLevel: "high" as const,
      status: "action_required" as const,
    },
    {
      title: "CP24/2: Operational resilience - Critical third parties",
      summary: "Consultation on new requirements for critical third-party service providers to the UK financial sector.",
      source: "Bank of England / PRA",
      sourceUrl: "https://www.bankofengland.co.uk/prudential-regulation/publication/2024/february/operational-resilience-critical-third-parties",
      regulatoryBody: "PRA",
      jurisdiction: "UK",
      effectiveDate: new Date("2025-03-31"),
      impactLevel: "critical" as const,
      status: "under_review" as const,
    },
    {
      title: "Consumer Duty - One Year On: FCA Review",
      summary: "FCA review of Consumer Duty implementation one year after the rules came into force, highlighting areas requiring improvement.",
      source: "Financial Conduct Authority",
      sourceUrl: "https://www.fca.org.uk/publications/multi-firm-reviews/consumer-duty-one-year-on",
      regulatoryBody: "FCA",
      jurisdiction: "UK",
      effectiveDate: new Date("2024-07-31"),
      impactLevel: "high" as const,
      status: "action_required" as const,
    },
    {
      title: "SS1/24: Model risk management principles for banks",
      summary: "PRA supervisory statement on model risk management, setting out expectations for banks using AI and machine learning models.",
      source: "Prudential Regulation Authority",
      sourceUrl: "https://www.bankofengland.co.uk/prudential-regulation/publication/2024/ss124-model-risk-management",
      regulatoryBody: "PRA",
      jurisdiction: "UK",
      effectiveDate: new Date("2024-05-17"),
      impactLevel: "medium" as const,
      status: "implemented" as const,
    },
    {
      title: "ICO Guidance: AI and Data Protection",
      summary: "Updated guidance from the Information Commissioner's Office on using AI systems in compliance with UK GDPR.",
      source: "Information Commissioner's Office",
      sourceUrl: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/",
      regulatoryBody: "ICO",
      jurisdiction: "UK",
      effectiveDate: new Date("2024-03-15"),
      impactLevel: "high" as const,
      status: "action_required" as const,
    },
    {
      title: "FCA Market Watch 78: Transaction Reporting",
      summary: "FCA newsletter highlighting common transaction reporting errors and expectations for improvement.",
      source: "Financial Conduct Authority",
      sourceUrl: "https://www.fca.org.uk/publications/newsletters/market-watch-78",
      regulatoryBody: "FCA",
      jurisdiction: "UK",
      effectiveDate: new Date("2024-06-01"),
      impactLevel: "medium" as const,
      status: "new" as const,
    },
    {
      title: "Basel 3.1 Implementation - UK Approach",
      summary: "PRA policy statement on UK implementation of Basel 3.1 standards, with transitional arrangements.",
      source: "Prudential Regulation Authority",
      sourceUrl: "https://www.bankofengland.co.uk/prudential-regulation/publication/2024/implementation-of-the-basel-31-standards",
      regulatoryBody: "PRA",
      jurisdiction: "UK",
      effectiveDate: new Date("2025-07-01"),
      impactLevel: "critical" as const,
      status: "under_review" as const,
    },
    {
      title: "Economic Crime and Corporate Transparency Act 2023 - Guidance",
      summary: "Government guidance on new corporate criminal liability provisions and failure to prevent fraud offence.",
      source: "UK Government",
      sourceUrl: "https://www.gov.uk/government/publications/economic-crime-and-corporate-transparency-act-2023-guidance",
      regulatoryBody: "HM Treasury",
      jurisdiction: "UK",
      effectiveDate: new Date("2024-09-01"),
      impactLevel: "high" as const,
      status: "action_required" as const,
    },
  ];

  for (const update of updates) {
    await db.insert(regulatoryUpdates).values(update);
  }

  return updates.length;
}

/**
 * Seed departments
 */
export async function seedDepartments(headId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const departmentsData = [
    { name: "Compliance", code: "COMP", description: "Regulatory compliance and governance", headId, complianceScore: 92, riskLevel: "low" as const },
    { name: "Finance", code: "FIN", description: "Financial operations and reporting", headId, complianceScore: 88, riskLevel: "medium" as const },
    { name: "Operations", code: "OPS", description: "Business operations and processes", headId, complianceScore: 85, riskLevel: "medium" as const },
    { name: "IT & Security", code: "ITS", description: "Information technology and cybersecurity", headId, complianceScore: 78, riskLevel: "high" as const },
    { name: "Legal", code: "LEG", description: "Legal affairs and contracts", headId, complianceScore: 95, riskLevel: "low" as const },
    { name: "Risk Management", code: "RISK", description: "Enterprise risk management", headId, complianceScore: 82, riskLevel: "medium" as const },
  ];

  let inserted = 0;
  for (const dept of departmentsData) {
    // Check if department already exists
    const existing = await db.select().from(departments).where(eq(departments.code, dept.code));
    if (existing.length === 0) {
      await db.insert(departments).values(dept);
      inserted++;
    }
  }

  return inserted || departmentsData.length;
}

/**
 * Seed compliance records
 */
export async function seedComplianceRecords() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if compliance records already exist
  const existingRecords = await db.select().from(complianceRecords);
  if (existingRecords.length > 0) {
    console.log("Compliance records already seeded, skipping...");
    return existingRecords.length;
  }

  // Get policies first
  const allPolicies = await db.select().from(policies);
  
  const records = [
    { department: "Compliance", complianceStatus: "compliant" as const, score: 92, findings: "All controls operating effectively", remediation: null },
    { department: "Finance", complianceStatus: "compliant" as const, score: 88, findings: "Minor documentation gaps identified", remediation: "Update procedure documentation by Q1 2025" },
    { department: "Operations", complianceStatus: "partial" as const, score: 75, findings: "Training completion below target", remediation: "Implement mandatory training program" },
    { department: "IT & Security", complianceStatus: "partial" as const, score: 72, findings: "Patch management delays noted", remediation: "Automate patch deployment process" },
    { department: "Legal", complianceStatus: "compliant" as const, score: 95, findings: "Excellent compliance posture", remediation: null },
    { department: "Risk Management", complianceStatus: "compliant" as const, score: 82, findings: "Risk register requires update", remediation: "Complete annual risk review" },
  ];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const policy = allPolicies[i % allPolicies.length];
    await db.insert(complianceRecords).values({
      ...record,
      policyId: policy?.id,
      lastAssessmentDate: new Date(),
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });
  }

  return records.length;
}

/**
 * Seed AI recommendations
 */
export async function seedAIRecommendations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if AI recommendations already exist
  const existingRecs = await db.select().from(aiRecommendations);
  if (existingRecs.length > 0) {
    console.log("AI recommendations already seeded, skipping...");
    return existingRecs.length;
  }

  // Get policies first
  const allPolicies = await db.select().from(policies);

  const recommendations = [
    {
      title: "Update AML Policy for New Sanctions Requirements",
      description: "Recent OFSI updates require enhanced sanctions screening procedures. Recommend updating AML policy section 4.2.",
      category: "policy_update" as const,
      priority: "high" as const,
      relatedPolicyId: allPolicies.find(p => p.title.includes("AML"))?.id,
      relatedDepartment: "Compliance",
      status: "new" as const,
      confidenceScore: 92,
      actionItems: JSON.stringify(["Review OFSI guidance", "Update screening procedures", "Train staff on changes"]),
    },
    {
      title: "Consumer Duty Evidence Gap Identified",
      description: "Analysis indicates insufficient evidence of customer outcome monitoring. Recommend implementing systematic tracking.",
      category: "compliance_suggestion" as const,
      priority: "critical" as const,
      relatedPolicyId: allPolicies.find(p => p.title.includes("Consumer"))?.id,
      relatedDepartment: "Customer Service",
      status: "acknowledged" as const,
      confidenceScore: 88,
      actionItems: JSON.stringify(["Define outcome metrics", "Implement tracking system", "Create reporting dashboard"]),
    },
    {
      title: "Operational Resilience Testing Due",
      description: "Quarterly operational resilience testing is due. Schedule impact tolerance testing for critical business services.",
      category: "regulatory_change" as const,
      priority: "medium" as const,
      relatedPolicyId: allPolicies.find(p => p.title.includes("Operational"))?.id,
      relatedDepartment: "Operations",
      status: "new" as const,
      confidenceScore: 95,
      actionItems: JSON.stringify(["Schedule testing window", "Prepare test scenarios", "Coordinate with IT"]),
    },
    {
      title: "GDPR Consent Records Review Required",
      description: "Consent records for marketing communications should be reviewed to ensure compliance with ICO guidance.",
      category: "compliance_suggestion" as const,
      priority: "medium" as const,
      relatedPolicyId: allPolicies.find(p => p.title.includes("GDPR"))?.id,
      relatedDepartment: "Legal",
      status: "new" as const,
      confidenceScore: 85,
      actionItems: JSON.stringify(["Audit consent records", "Update consent mechanisms", "Document lawful basis"]),
    },
  ];

  for (const rec of recommendations) {
    await db.insert(aiRecommendations).values(rec);
  }

  return recommendations.length;
}

/**
 * Seed delegation of authority
 */
export async function seedDelegations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if delegations already exist
  const existingDelegations = await db.select().from(delegationAuthority);
  if (existingDelegations.length > 0) {
    console.log("Delegations already seeded, skipping...");
    return existingDelegations.length;
  }

  const delegations = [
    {
      title: "Financial Approval Authority - Level 1",
      description: "Authority to approve financial transactions up to £10,000",
      authorityType: "financial" as const,
      delegatorId: userId,
      delegateeId: userId,
      thresholdAmount: "10000.00",
      thresholdCurrency: "GBP",
      conditions: "Standard approval process applies",
      status: "active" as const,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2025-12-31"),
    },
    {
      title: "Compliance Exception Authority",
      description: "Authority to approve compliance exceptions with documented justification",
      authorityType: "compliance" as const,
      delegatorId: userId,
      delegateeId: userId,
      thresholdAmount: null,
      thresholdCurrency: "GBP",
      conditions: "Requires documented risk assessment and time-limited approval",
      status: "active" as const,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2025-12-31"),
    },
    {
      title: "Contract Signing Authority",
      description: "Authority to sign contracts up to £50,000",
      authorityType: "contractual" as const,
      delegatorId: userId,
      delegateeId: userId,
      thresholdAmount: "50000.00",
      thresholdCurrency: "GBP",
      conditions: "Legal review required for contracts over £25,000",
      status: "active" as const,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2025-12-31"),
    },
  ];

  for (const del of delegations) {
    await db.insert(delegationAuthority).values(del);
  }

  return delegations.length;
}

/**
 * Main seeding function
 */
export async function seedAllData(userId: number, userName: string) {
  console.log("Starting database seeding...");
  
  const results = {
    policies: await seedPolicies(userId, userName),
    regulatoryUpdates: await seedRegulatoryUpdates(),
    departments: await seedDepartments(userId),
    complianceRecords: await seedComplianceRecords(),
    aiRecommendations: await seedAIRecommendations(),
    delegations: await seedDelegations(userId),
  };

  console.log("Database seeding complete:", results);
  return results;
}
