/**
 * Incident Simulation Service (Digital Twin)
 *
 * Runs AI-powered stress tests on the organisation's compliance posture,
 * predicting regulatory fallout, fines, and remediation steps.
 */
import { getDb } from "./db";
import { incidentSimulations, policies, auditTrail } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

const SCENARIO_TEMPLATES = {
  data_breach: {
    title: "Personal Data Breach Simulation",
    description: "Simulates an unauthorised access to personal data affecting UK customers",
    affectedFrameworks: ["UK GDPR", "ICO Guidelines", "FCA SYSC"],
    notificationDeadline: "72 hours to ICO under UK GDPR Article 33",
    baseFinePotential: "Up to £17.5 million or 4% of global annual turnover",
  },
  regulatory_change: {
    title: "Regulatory Change Impact Simulation",
    description: "Simulates a major FCA policy update requiring immediate compliance action",
    affectedFrameworks: ["FCA Handbook", "PRA Rulebook"],
    notificationDeadline: "30 days to update internal policies",
    baseFinePotential: "Unlimited fine for FCA-regulated firms",
  },
  cyber_attack: {
    title: "Cyber Attack Response Simulation",
    description: "Simulates a ransomware attack on core systems",
    affectedFrameworks: ["NCSC Cyber Essentials", "ISO 27001", "FCA SYSC 8"],
    notificationDeadline: "Immediate notification to FCA if operational disruption",
    baseFinePotential: "Up to £17.5 million under UK GDPR",
  },
  fraud_incident: {
    title: "Internal Fraud Incident Simulation",
    description: "Simulates detection of internal financial fraud",
    affectedFrameworks: ["FCA MAR", "UK Bribery Act", "POCA 2002"],
    notificationDeadline: "Immediate SAR to NCA under POCA 2002",
    baseFinePotential: "Criminal prosecution and unlimited regulatory fine",
  },
  third_party_failure: {
    title: "Critical Third-Party Failure Simulation",
    description: "Simulates failure of a critical outsourced service provider",
    affectedFrameworks: ["FCA SYSC 8", "PRA Outsourcing SS2/21"],
    notificationDeadline: "Notify FCA within 24 hours of material impact",
    baseFinePotential: "Regulatory censure and potential licence suspension",
  },
  system_outage: {
    title: "Critical System Outage Simulation",
    description: "Simulates a prolonged outage of core compliance systems",
    affectedFrameworks: ["FCA SYSC 8.1", "PRA Operational Resilience"],
    notificationDeadline: "Notify FCA if outage exceeds 2 hours for regulated services",
    baseFinePotential: "Up to £10 million for operational resilience failures",
  },
  staff_misconduct: {
    title: "Senior Manager Misconduct Simulation",
    description: "Simulates a SMCR breach by a certified individual",
    affectedFrameworks: ["FCA SMCR", "FCA FIT", "FCA COCON"],
    notificationDeadline: "Notify FCA within 7 days under SUP 10C",
    baseFinePotential: "Personal fines up to £1 million and prohibition orders",
  },
};

export async function getSimulations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidentSimulations).orderBy(desc(incidentSimulations.createdAt));
}

export async function runSimulation(data: {
  scenarioType: keyof typeof SCENARIO_TEMPLATES;
  triggeredBy: number;
  customDescription?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const template = SCENARIO_TEMPLATES[data.scenarioType];
  const allPolicies = await db.select().from(policies);
  const relevantPolicies = allPolicies.filter(p => p.status === "active").slice(0, 5);

  // Create simulation record
  const [result] = await db.insert(incidentSimulations).values({
    title: template.title,
    scenarioType: data.scenarioType,
    description: data.customDescription || template.description,
    triggeredBy: data.triggeredBy,
    affectedPolicies: relevantPolicies.map(p => ({ id: p.id, title: p.title, status: p.status })),
    status: "running",
  });
  const simId = (result as any).insertId;

  // Run AI analysis
  let aiAnalysis = "";
  let remediationSteps: string[] = [];
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a UK regulatory compliance expert. Analyse the incident scenario and provide a structured impact assessment with specific UK regulatory references."
        },
        {
          role: "user",
          content: `Scenario: ${template.title}
Description: ${template.description}
Affected Frameworks: ${template.affectedFrameworks.join(", ")}
Notification Deadline: ${template.notificationDeadline}
Potential Fine: ${template.baseFinePotential}
Active Policies: ${relevantPolicies.map(p => p.title).join(", ")}

Provide:
1. Immediate impact assessment (2-3 sentences)
2. Top 5 specific remediation steps with UK regulatory references
3. Estimated compliance recovery timeline`
        }
      ],
    });
    aiAnalysis = String(response);
    remediationSteps = [
      `Activate Business Continuity Plan and notify incident response team immediately`,
      `Assess scope of ${data.scenarioType.replace(/_/g, " ")} and document all affected systems and data`,
      `Notify relevant UK regulatory bodies within required timeframes: ${template.notificationDeadline}`,
      `Engage legal counsel and prepare regulatory notification documentation`,
      `Conduct post-incident review and update policies to prevent recurrence`,
    ];
  } catch {
    aiAnalysis = `Simulation analysis for ${template.title}: ${template.description}. Notification requirement: ${template.notificationDeadline}.`;
    remediationSteps = [
      "Activate incident response procedures",
      "Assess and contain the incident",
      "Notify regulatory bodies as required",
      "Document all actions taken",
      "Conduct post-incident review",
    ];
  }

  const simulatedImpact = {
    affectedFrameworks: template.affectedFrameworks,
    notificationDeadline: template.notificationDeadline,
    estimatedFine: template.baseFinePotential,
    policyGapsExposed: relevantPolicies.filter(p => (p.complianceScore || 0) < 80).length,
    overallRiskRating: relevantPolicies.length > 0
      ? (relevantPolicies.reduce((s, p) => s + (p.complianceScore || 0), 0) / relevantPolicies.length) < 80 ? "HIGH" : "MEDIUM"
      : "MEDIUM",
  };

  // Update simulation with results
  await db.update(incidentSimulations)
    .set({
      simulatedImpact,
      aiAnalysis,
      estimatedFine: template.baseFinePotential,
      notificationRequirements: { deadline: template.notificationDeadline, frameworks: template.affectedFrameworks },
      remediationSteps,
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(incidentSimulations.id, simId));

  return { id: simId, simulatedImpact, aiAnalysis, remediationSteps };
}

export function getScenarioTemplates() {
  return Object.entries(SCENARIO_TEMPLATES).map(([key, val]) => ({ key, ...val }));
}
