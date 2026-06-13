/**
 * Seed Gap Analysis Data
 * 
 * Creates realistic UK regulatory gap analysis scenarios for demonstration.
 * This populates the policyRegulationMapping table with pre-analyzed gaps
 * and corresponding AI recommendations.
 */

import { getDb } from "./db";
import { policyRegulationMapping, aiRecommendations, policies, regulatoryUpdates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface GapScenario {
  regulatoryTitle: string;
  policyTitle: string;
  gapDescription: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendedAction: string;
  affectedSections: string[];
  confidenceScore: number;
  aiAnalysis: {
    impactSummary: string;
    complianceDeadline: string;
    estimatedEffort: string;
    riskIfNotAddressed: string;
  };
}

// Realistic UK regulatory gap analysis scenarios
const gapScenarios: GapScenario[] = [
  // FCA Consumer Duty Gaps
  {
    regulatoryTitle: "FCA Consumer Duty: Board Reporting Requirements",
    policyTitle: "Anti-Money Laundering (AML) Policy",
    gapDescription: "Current AML policy lacks Consumer Duty board reporting requirements. FCA PS22/9 requires firms to report annually on Consumer Duty outcomes, including fair value assessments and customer outcome monitoring. The existing policy does not address board-level oversight of consumer outcomes.",
    severity: "critical",
    recommendedAction: "Add new section on Consumer Duty board reporting requirements, including annual outcome assessments, fair value documentation, and customer harm prevention measures.",
    affectedSections: ["Section 4: Governance & Oversight", "Section 7: Reporting Requirements", "Section 9: Board Responsibilities"],
    confidenceScore: 94,
    aiAnalysis: {
      impactSummary: "High impact on governance structure. Requires new board reporting framework and quarterly Consumer Duty assessments.",
      complianceDeadline: "31 July 2026",
      estimatedEffort: "40-60 hours of policy revision and implementation",
      riskIfNotAddressed: "FCA enforcement action, potential fine up to £1.2M for mid-sized firms"
    }
  },
  {
    regulatoryTitle: "FCA PS24/16: Anti-Money Laundering Amendments",
    policyTitle: "Anti-Money Laundering (AML) Policy",
    gapDescription: "Policy does not reflect updated transaction monitoring thresholds introduced in PS24/16. New requirements mandate enhanced due diligence for transactions exceeding £8,500 (reduced from £10,000) and real-time screening against updated sanctions lists.",
    severity: "critical",
    recommendedAction: "Update transaction monitoring thresholds from £10,000 to £8,500, implement real-time sanctions screening, and add new enhanced due diligence procedures for high-risk jurisdictions.",
    affectedSections: ["Section 3: Transaction Monitoring", "Section 5: Customer Due Diligence", "Section 8: Sanctions Screening"],
    confidenceScore: 97,
    aiAnalysis: {
      impactSummary: "Immediate system changes required. Transaction monitoring rules need reconfiguration and sanctions list integration needs updating.",
      complianceDeadline: "1 April 2026",
      estimatedEffort: "80-120 hours including system updates",
      riskIfNotAddressed: "Regulatory breach, potential criminal liability for senior managers"
    }
  },
  // GDPR/ICO Gaps
  {
    regulatoryTitle: "ICO: UK GDPR AI Accountability Framework",
    policyTitle: "Data Protection & GDPR Policy",
    gapDescription: "Current policy lacks specific provisions for AI-driven decision making as required by the new ICO AI Accountability Framework. Missing: algorithmic transparency requirements, automated decision-making safeguards, and AI bias monitoring procedures.",
    severity: "high",
    recommendedAction: "Add new chapter on AI governance including: algorithmic impact assessments, transparency notices for AI decisions, human oversight requirements, and bias detection protocols.",
    affectedSections: ["Section 2: Data Processing Principles", "Section 6: Automated Decision Making", "Section 10: Technology Governance"],
    confidenceScore: 91,
    aiAnalysis: {
      impactSummary: "Significant policy expansion needed. Requires cross-functional collaboration between Legal, IT, and Data Science teams.",
      complianceDeadline: "1 September 2026",
      estimatedEffort: "60-80 hours of policy development",
      riskIfNotAddressed: "ICO enforcement notice, reputational damage, potential £17.5M fine"
    }
  },
  {
    regulatoryTitle: "ICO: UK GDPR AI Accountability Framework",
    policyTitle: "Information Security Policy",
    gapDescription: "Information Security Policy does not address AI model security requirements. New framework requires: secure AI model storage, protection against adversarial attacks, and AI-specific incident response procedures.",
    severity: "high",
    recommendedAction: "Integrate AI security controls including model versioning, adversarial attack detection, secure training data handling, and AI-specific incident response playbooks.",
    affectedSections: ["Section 4: Access Controls", "Section 7: Incident Response", "Section 11: Emerging Technologies"],
    confidenceScore: 88,
    aiAnalysis: {
      impactSummary: "Technical security controls need enhancement. May require additional security tooling for AI model protection.",
      complianceDeadline: "1 September 2026",
      estimatedEffort: "50-70 hours including technical implementation",
      riskIfNotAddressed: "Data breach via AI systems, regulatory penalties"
    }
  },
  // PRA Operational Resilience Gaps
  {
    regulatoryTitle: "PRA SS1/21: Operational Resilience Requirements",
    policyTitle: "Business Continuity Plan",
    gapDescription: "Business Continuity Plan does not meet PRA SS1/21 impact tolerance requirements. Missing: defined impact tolerances for important business services, scenario testing documentation, and third-party dependency mapping.",
    severity: "critical",
    recommendedAction: "Define impact tolerances for all important business services, document severe but plausible scenarios, map critical third-party dependencies, and establish regular testing schedule.",
    affectedSections: ["Section 2: Business Impact Analysis", "Section 5: Recovery Objectives", "Section 8: Third-Party Management"],
    confidenceScore: 93,
    aiAnalysis: {
      impactSummary: "Fundamental restructuring of BCP required. Must identify and document all important business services with quantified impact tolerances.",
      complianceDeadline: "31 March 2026",
      estimatedEffort: "100-150 hours across multiple departments",
      riskIfNotAddressed: "PRA s166 skilled person review, potential restriction on business activities"
    }
  },
  {
    regulatoryTitle: "PRA SS1/21: Operational Resilience Requirements",
    policyTitle: "Procurement & Vendor Management Policy",
    gapDescription: "Vendor management policy lacks PRA-required operational resilience provisions for critical third parties. Missing: concentration risk assessment, exit strategies for critical vendors, and resilience testing requirements for outsourced services.",
    severity: "high",
    recommendedAction: "Add critical third-party resilience requirements including: concentration risk limits, mandatory exit planning, annual resilience testing, and real-time monitoring of critical vendor performance.",
    affectedSections: ["Section 3: Vendor Risk Assessment", "Section 6: Contract Requirements", "Section 9: Exit Planning"],
    confidenceScore: 89,
    aiAnalysis: {
      impactSummary: "Vendor contracts may need renegotiation. Requires identification of critical vs non-critical third parties.",
      complianceDeadline: "31 March 2026",
      estimatedEffort: "70-90 hours including vendor engagement",
      riskIfNotAddressed: "Operational disruption, regulatory scrutiny of outsourcing arrangements"
    }
  },
  // Financial Reporting Gaps
  {
    regulatoryTitle: "FCA: Sustainability Disclosure Requirements (SDR)",
    policyTitle: "Financial Reporting Standards Policy",
    gapDescription: "Financial reporting policy does not include sustainability disclosure requirements under SDR. Missing: ESG data collection procedures, sustainability labelling rules, and anti-greenwashing compliance measures.",
    severity: "medium",
    recommendedAction: "Integrate SDR requirements including: ESG metrics collection framework, sustainability product labelling procedures, and anti-greenwashing review process for all marketing materials.",
    affectedSections: ["Section 4: Disclosure Requirements", "Section 7: Product Documentation", "Section 10: Marketing Compliance"],
    confidenceScore: 86,
    aiAnalysis: {
      impactSummary: "New reporting workflows needed. May require ESG data management system implementation.",
      complianceDeadline: "31 December 2026",
      estimatedEffort: "50-70 hours of policy and process development",
      riskIfNotAddressed: "Greenwashing allegations, FCA enforcement, reputational damage"
    }
  },
  // Environmental Policy Gaps
  {
    regulatoryTitle: "FCA: Sustainability Disclosure Requirements (SDR)",
    policyTitle: "Environmental Sustainability Policy",
    gapDescription: "Environmental policy does not align with FCA SDR labelling requirements. Current policy lacks: investment product sustainability classifications, transition plan disclosures, and climate risk integration procedures.",
    severity: "medium",
    recommendedAction: "Update environmental policy to include SDR-compliant sustainability labels, climate transition planning requirements, and integration with financial product governance.",
    affectedSections: ["Section 2: Sustainability Framework", "Section 5: Product Classification", "Section 8: Climate Risk"],
    confidenceScore: 84,
    aiAnalysis: {
      impactSummary: "Cross-functional alignment needed between sustainability and product teams.",
      complianceDeadline: "31 December 2026",
      estimatedEffort: "40-60 hours",
      riskIfNotAddressed: "Product distribution restrictions, investor complaints"
    }
  },
  // Cyber Security Gaps
  {
    regulatoryTitle: "NCSC CAF 3.2: Cyber Assessment Framework Update",
    policyTitle: "Information Security Policy",
    gapDescription: "Information Security Policy does not reflect NCSC CAF 3.2 updates. Missing: supply chain cyber risk assessment, enhanced logging requirements, and updated incident reporting timelines (reduced to 24 hours).",
    severity: "high",
    recommendedAction: "Update security policy to include: supply chain security assessments, enhanced security logging (minimum 12 months retention), and 24-hour incident reporting procedures to NCSC.",
    affectedSections: ["Section 3: Supply Chain Security", "Section 6: Logging & Monitoring", "Section 9: Incident Reporting"],
    confidenceScore: 92,
    aiAnalysis: {
      impactSummary: "Technical and procedural updates required. Log retention infrastructure may need expansion.",
      complianceDeadline: "1 June 2026",
      estimatedEffort: "60-80 hours including technical implementation",
      riskIfNotAddressed: "Cyber incident response failures, regulatory penalties under NIS Regulations"
    }
  },
  // HR Policy Gaps
  {
    regulatoryTitle: "FCA SM&CR: Senior Managers Certification Regime Updates",
    policyTitle: "Employee Code of Conduct",
    gapDescription: "Employee Code of Conduct does not reflect latest SM&CR certification requirements. Missing: annual fitness and propriety assessments, conduct rule training documentation, and regulatory reference procedures.",
    severity: "medium",
    recommendedAction: "Update Code of Conduct to include: annual certification process, conduct rules training requirements, and standardised regulatory reference procedures for all certified staff.",
    affectedSections: ["Section 4: Certification Requirements", "Section 7: Training & Competence", "Section 10: Regulatory References"],
    confidenceScore: 87,
    aiAnalysis: {
      impactSummary: "HR processes need updating. Annual certification workflow required for all certified persons.",
      complianceDeadline: "Ongoing (annual cycle)",
      estimatedEffort: "30-40 hours of policy update, plus ongoing administration",
      riskIfNotAddressed: "SM&CR breach, personal liability for senior managers"
    }
  },
  // Additional Critical Gap
  {
    regulatoryTitle: "Bank of England: Stress Testing Requirements 2026",
    policyTitle: "Financial Reporting Standards Policy",
    gapDescription: "Financial reporting policy does not incorporate Bank of England's updated stress testing requirements for 2026. Missing: climate stress test scenarios, liquidity stress parameters, and enhanced capital adequacy reporting.",
    severity: "critical",
    recommendedAction: "Integrate BoE stress testing requirements including: climate scenario analysis, updated liquidity coverage ratio calculations, and quarterly capital adequacy submissions.",
    affectedSections: ["Section 3: Capital Reporting", "Section 6: Stress Testing", "Section 9: Regulatory Submissions"],
    confidenceScore: 90,
    aiAnalysis: {
      impactSummary: "Significant finance team involvement required. May need stress testing model updates.",
      complianceDeadline: "1 January 2026",
      estimatedEffort: "80-100 hours",
      riskIfNotAddressed: "Capital adequacy concerns, potential restrictions on dividend payments"
    }
  },
  // Market Conduct Gap
  {
    regulatoryTitle: "FCA: Market Abuse Regulation (MAR) Updates",
    policyTitle: "Employee Code of Conduct",
    gapDescription: "Code of Conduct lacks updated Market Abuse Regulation requirements. Missing: personal account dealing restrictions, insider list management procedures, and suspicious transaction reporting protocols.",
    severity: "high",
    recommendedAction: "Add MAR compliance section covering: personal account dealing pre-clearance, insider list maintenance, and STR/STOR reporting procedures.",
    affectedSections: ["Section 5: Personal Account Dealing", "Section 8: Insider Information", "Section 11: Suspicious Activity Reporting"],
    confidenceScore: 91,
    aiAnalysis: {
      impactSummary: "Compliance monitoring systems may need enhancement for personal account dealing oversight.",
      complianceDeadline: "Ongoing requirement",
      estimatedEffort: "35-50 hours",
      riskIfNotAddressed: "Market abuse, criminal prosecution, unlimited fines"
    }
  }
];

/**
 * Seed gap analysis data into the database
 */
export async function seedGapAnalysisData(): Promise<{
  gapsCreated: number;
  recommendationsCreated: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let gapsCreated = 0;
  let recommendationsCreated = 0;
  const errors: string[] = [];

  // Get all policies and regulatory updates
  const allPolicies = await db.select().from(policies);
  const allUpdates = await db.select().from(regulatoryUpdates);

  console.log(`Found ${allPolicies.length} policies and ${allUpdates.length} regulatory updates`);

  for (const scenario of gapScenarios) {
    try {
      // Find matching policy
      const policy = allPolicies.find(p => 
        p.title.toLowerCase().includes(scenario.policyTitle.toLowerCase().split(' ')[0]) ||
        scenario.policyTitle.toLowerCase().includes(p.title.toLowerCase().split(' ')[0])
      );

      // Find matching regulatory update
      const regUpdate = allUpdates.find(u => 
        u.title.toLowerCase().includes(scenario.regulatoryTitle.toLowerCase().split(':')[0]) ||
        scenario.regulatoryTitle.toLowerCase().includes(u.title.toLowerCase().split(':')[0])
      );

      if (!policy) {
        errors.push(`Policy not found for scenario: ${scenario.policyTitle}`);
        continue;
      }

      if (!regUpdate) {
        errors.push(`Regulatory update not found for scenario: ${scenario.regulatoryTitle}`);
        continue;
      }

      // Create policy-regulation mapping (gap)
      await db.insert(policyRegulationMapping).values({
        policyId: policy.id,
        regUpdateId: regUpdate.id,
        mappingType: 'gap_identified',
        gapDescription: scenario.gapDescription,
        severity: scenario.severity,
        status: 'pending_review',
        confidenceScore: scenario.confidenceScore,
        aiAnalysis: JSON.stringify({
          recommendedAction: scenario.recommendedAction,
          affectedSections: scenario.affectedSections,
          ...scenario.aiAnalysis,
          analysisDate: new Date().toISOString(),
        }),
      });
      gapsCreated++;

      // Create corresponding AI recommendation
      await db.insert(aiRecommendations).values({
        title: `Gap Identified: ${policy.title} vs ${regUpdate.regulatoryBody || 'Regulatory'} Requirements`,
        description: `**Gap Description:**\n${scenario.gapDescription}\n\n**Recommended Action:**\n${scenario.recommendedAction}\n\n**Affected Sections:**\n${scenario.affectedSections.map(s => `• ${s}`).join('\n')}\n\n**Impact Summary:**\n${scenario.aiAnalysis.impactSummary}\n\n**Compliance Deadline:** ${scenario.aiAnalysis.complianceDeadline}\n**Estimated Effort:** ${scenario.aiAnalysis.estimatedEffort}\n**Risk if Not Addressed:** ${scenario.aiAnalysis.riskIfNotAddressed}`,
        category: 'regulatory_change',
        priority: scenario.severity,
        relatedPolicyId: policy.id,
        status: 'new',
        confidenceScore: scenario.confidenceScore,
        actionItems: JSON.stringify([
          scenario.recommendedAction,
          `Review and update: ${scenario.affectedSections.join(', ')}`,
          `Complete by: ${scenario.aiAnalysis.complianceDeadline}`,
          `Estimated effort: ${scenario.aiAnalysis.estimatedEffort}`,
        ]),
      });
      recommendationsCreated++;

      console.log(`Created gap: ${policy.title} <-> ${regUpdate.title}`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Error processing scenario "${scenario.policyTitle}": ${errorMsg}`);
    }
  }

  return {
    gapsCreated,
    recommendationsCreated,
    errors,
  };
}

export default seedGapAnalysisData;
