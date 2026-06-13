/**
 * Regulatory Sync - AI-Powered Policy Gap Analysis
 * 
 * This module implements the core innovation of automatically analyzing
 * regulatory updates against company policies to identify compliance gaps.
 * 
 * Key Features:
 * - Policy requirement extraction using LLM
 * - Regulatory update impact analysis
 * - Automated gap detection
 * - AI-generated recommendations
 * - Confidence scoring
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { policies, regulatoryUpdates, aiRecommendations, policyRegulationMapping } from "../drizzle/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

/**
 * Gap Analysis Result
 */
export interface GapAnalysisResult {
  policyId: number;
  policyTitle: string;
  gapDescription: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendedAction: string;
  affectedSections: string[];
  confidenceScore: number;
}

/**
 * Full Impact Analysis Result
 */
export interface ImpactAnalysisResult {
  regulatoryUpdateId: number;
  regulatoryUpdateTitle: string;
  analysisDate: string;
  overallImpact: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  affectedPolicies: GapAnalysisResult[];
  newPoliciesNeeded: string[];
  recommendedTimeline: string;
  confidenceScore: number;
}

/**
 * Extract key requirements from a policy using LLM
 */
export async function extractPolicyRequirements(policyId: number): Promise<{
  requirements: Array<{
    requirement: string;
    category: string;
    regulatoryReference: string;
  }>;
  summary: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [policy] = await db.select().from(policies).where(eq(policies.id, policyId)).limit(1);
  if (!policy) throw new Error(`Policy ${policyId} not found`);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a regulatory compliance expert specializing in UK financial services regulations (FCA, PRA, BOE, ICO).
Extract key compliance requirements from the given policy document.
Return a structured JSON response with the requirements and their regulatory references.`
      },
      {
        role: "user",
        content: `Analyze this policy and extract key compliance requirements:

**Policy Title:** ${policy.title}
**Category:** ${policy.category}
**Description:** ${policy.description || 'No description provided'}
**Department Scope:** ${policy.departmentScope || 'Organization-wide'}

Extract:
1. Key compliance requirements
2. Category of each requirement
3. Relevant regulatory references (FCA, PRA, GDPR, etc.)`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "policy_requirements",
        strict: true,
        schema: {
          type: "object",
          properties: {
            requirements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement: { type: "string", description: "The specific compliance requirement" },
                  category: { type: "string", description: "Category like 'data_protection', 'financial_reporting', 'risk_management'" },
                  regulatoryReference: { type: "string", description: "Relevant regulation like 'FCA PRIN 2.1', 'GDPR Article 5'" }
                },
                required: ["requirement", "category", "regulatoryReference"],
                additionalProperties: false
              }
            },
            summary: { type: "string", description: "Brief summary of the policy's compliance focus" }
          },
          required: ["requirements", "summary"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === 'string') {
    return JSON.parse(content);
  }
  
  throw new Error("Failed to extract policy requirements");
}

/**
 * Analyze a regulatory update's impact on company policies
 */
export async function analyzeRegulatoryImpact(updateId: number): Promise<ImpactAnalysisResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the regulatory update
  const [update] = await db.select().from(regulatoryUpdates).where(eq(regulatoryUpdates.id, updateId)).limit(1);
  if (!update) throw new Error(`Regulatory update ${updateId} not found`);

  // Get all active policies
  const allPolicies = await db.select().from(policies).where(
    and(
      eq(policies.status, 'active'),
    )
  );

  // If no active policies, get all non-archived policies
  const policiesToAnalyze = allPolicies.length > 0 ? allPolicies : 
    await db.select().from(policies);

  // Build policy summary for LLM
  const policySummary = policiesToAnalyze.map(p => 
    `- ID ${p.id}: "${p.title}" (${p.category}) - ${p.description?.substring(0, 150) || 'No description'}...`
  ).join('\n');

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a senior regulatory compliance analyst specializing in UK financial services.
Your task is to analyze how a regulatory update impacts existing company policies.
Identify gaps, required updates, and provide actionable recommendations.
Be thorough but realistic - not every update affects every policy.`
      },
      {
        role: "user",
        content: `Analyze this regulatory update and identify which company policies may need updates:

**REGULATORY UPDATE:**
Title: ${update.title}
Source: ${update.regulatoryBody || update.source || 'Unknown'}
Summary: ${update.summary || 'No summary available'}
Impact Level: ${update.impactLevel || 'Not specified'}
${update.sourceUrl ? `URL: ${update.sourceUrl}` : ''}

**COMPANY POLICIES:**
${policySummary}

Analyze:
1. Which policies are affected by this regulatory update?
2. What specific gaps exist between current policies and new requirements?
3. What actions are needed to achieve compliance?
4. Are any new policies needed?
5. What is the recommended timeline for compliance?`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "impact_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            overallImpact: { 
              type: "string", 
              enum: ["critical", "high", "medium", "low", "none"],
              description: "Overall impact level of this regulatory update"
            },
            summary: { 
              type: "string", 
              description: "Executive summary of the impact analysis (2-3 sentences)"
            },
            affectedPolicies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  policyId: { type: "number", description: "ID of the affected policy" },
                  policyTitle: { type: "string", description: "Title of the affected policy" },
                  gapDescription: { type: "string", description: "Description of the compliance gap" },
                  severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  recommendedAction: { type: "string", description: "Specific action to address the gap" },
                  affectedSections: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Sections of the policy that need updating"
                  },
                  confidenceScore: { 
                    type: "number", 
                    description: "Confidence in this assessment (0-100)"
                  }
                },
                required: ["policyId", "policyTitle", "gapDescription", "severity", "recommendedAction", "affectedSections", "confidenceScore"],
                additionalProperties: false
              }
            },
            newPoliciesNeeded: {
              type: "array",
              items: { type: "string" },
              description: "New policies that should be created"
            },
            recommendedTimeline: {
              type: "string",
              description: "Recommended timeline for achieving compliance"
            },
            confidenceScore: {
              type: "number",
              description: "Overall confidence in this analysis (0-100)"
            }
          },
          required: ["overallImpact", "summary", "affectedPolicies", "newPoliciesNeeded", "recommendedTimeline", "confidenceScore"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error("Failed to analyze regulatory impact");
  }

  const analysis = JSON.parse(content);
  
  return {
    regulatoryUpdateId: updateId,
    regulatoryUpdateTitle: update.title,
    analysisDate: new Date().toISOString(),
    ...analysis
  };
}

/**
 * Run gap analysis and create AI recommendations
 */
export async function runGapAnalysisAndCreateRecommendations(updateId: number): Promise<{
  analysis: ImpactAnalysisResult;
  recommendationsCreated: number;
  mappingsCreated: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Run the impact analysis
  const analysis = await analyzeRegulatoryImpact(updateId);
  
  let recommendationsCreated = 0;
  let mappingsCreated = 0;

  // Create AI recommendations for each identified gap
  for (const gap of analysis.affectedPolicies) {
    // Create recommendation
    await db.insert(aiRecommendations).values({
      title: `Policy Update Required: ${gap.policyTitle}`,
      description: `${gap.gapDescription}\n\n**Recommended Action:** ${gap.recommendedAction}\n\n**Affected Sections:** ${gap.affectedSections.join(', ')}`,
      category: 'regulatory_change',
      priority: gap.severity,
      relatedPolicyId: gap.policyId,
      status: 'new',
      confidenceScore: gap.confidenceScore,
      actionItems: JSON.stringify([
        gap.recommendedAction,
        `Review affected sections: ${gap.affectedSections.join(', ')}`,
        `Target completion: ${analysis.recommendedTimeline}`
      ]),
    });
    recommendationsCreated++;

    // Create policy-regulation mapping
    await db.insert(policyRegulationMapping).values({
      policyId: gap.policyId,
      regUpdateId: updateId,
      mappingType: 'gap_identified',
      gapDescription: gap.gapDescription,
      severity: gap.severity,
      status: 'pending_review',
      confidenceScore: gap.confidenceScore,
      aiAnalysis: JSON.stringify({
        recommendedAction: gap.recommendedAction,
        affectedSections: gap.affectedSections,
        analysisDate: analysis.analysisDate,
      }),
    });
    mappingsCreated++;
  }

  // Create recommendations for new policies needed
  for (const newPolicy of analysis.newPoliciesNeeded) {
    await db.insert(aiRecommendations).values({
      title: `New Policy Required: ${newPolicy}`,
      description: `Based on regulatory update "${analysis.regulatoryUpdateTitle}", a new policy is recommended.\n\n**Suggested Policy:** ${newPolicy}\n\n**Timeline:** ${analysis.recommendedTimeline}`,
      category: 'policy_update',
      priority: analysis.overallImpact === 'critical' ? 'critical' : 'high',
      status: 'new',
      confidenceScore: analysis.confidenceScore,
      actionItems: JSON.stringify([
        `Draft new policy: ${newPolicy}`,
        'Assign policy owner',
        'Schedule review meeting',
        `Target completion: ${analysis.recommendedTimeline}`
      ]),
    });
    recommendationsCreated++;
  }

  // Update the regulatory update status
  await db.update(regulatoryUpdates)
    .set({ 
      status: 'under_review',
      impactLevel: analysis.overallImpact,
    })
    .where(eq(regulatoryUpdates.id, updateId));

  return {
    analysis,
    recommendationsCreated,
    mappingsCreated,
  };
}

/**
 * Get all policy-regulation mappings for a policy
 */
export async function getPolicyMappings(policyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(policyRegulationMapping)
    .where(eq(policyRegulationMapping.policyId, policyId))
    .orderBy(desc(policyRegulationMapping.createdAt));
}

/**
 * Get all unanalyzed regulatory updates
 */
export async function getUnanalyzedUpdates() {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(regulatoryUpdates)
    .where(eq(regulatoryUpdates.status, 'new'))
    .orderBy(desc(regulatoryUpdates.createdAt));
}

/**
 * Batch analyze all unanalyzed regulatory updates
 */
export async function batchAnalyzeUpdates(): Promise<{
  analyzed: number;
  failed: number;
  results: Array<{ updateId: number; success: boolean; error?: string }>;
}> {
  const updates = await getUnanalyzedUpdates();
  const results: Array<{ updateId: number; success: boolean; error?: string }> = [];
  
  let analyzed = 0;
  let failed = 0;

  for (const update of updates) {
    try {
      await runGapAnalysisAndCreateRecommendations(update.id);
      results.push({ updateId: update.id, success: true });
      analyzed++;
    } catch (error) {
      results.push({ 
        updateId: update.id, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      failed++;
    }
  }

  return { analyzed, failed, results };
}


/**
 * Get all gap analysis results from the database
 * Returns formatted results for display in the Gap Analysis page
 */
export async function getGapAnalysisResults(): Promise<{
  totalGaps: number;
  criticalGaps: number;
  highPriorityGaps: number;
  policiesAnalyzed: number;
  results: ImpactAnalysisResult[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalGaps: 0,
      criticalGaps: 0,
      highPriorityGaps: 0,
      policiesAnalyzed: 0,
      results: []
    };
  }

  // Get all gap mappings with policy and regulatory update info
  const mappings = await db.select({
    id: policyRegulationMapping.id,
    policyId: policyRegulationMapping.policyId,
    regUpdateId: policyRegulationMapping.regUpdateId,
    mappingType: policyRegulationMapping.mappingType,
    gapDescription: policyRegulationMapping.gapDescription,
    severity: policyRegulationMapping.severity,
    status: policyRegulationMapping.status,
    confidenceScore: policyRegulationMapping.confidenceScore,
    aiAnalysis: policyRegulationMapping.aiAnalysis,
    createdAt: policyRegulationMapping.createdAt,
    policyTitle: policies.title,
    policyCategory: policies.category,
    regUpdateTitle: regulatoryUpdates.title,
    regUpdateSource: regulatoryUpdates.source,
  })
  .from(policyRegulationMapping)
  .leftJoin(policies, eq(policyRegulationMapping.policyId, policies.id))
  .leftJoin(regulatoryUpdates, eq(policyRegulationMapping.regUpdateId, regulatoryUpdates.id))
  .where(eq(policyRegulationMapping.mappingType, 'gap_identified'))
  .orderBy(desc(policyRegulationMapping.createdAt));

  // Group by regulatory update
  const groupedByUpdate: Record<number, {
    updateId: number;
    updateTitle: string;
    updateSource: string;
    gaps: typeof mappings;
  }> = {};

  for (const mapping of mappings) {
    const updateId = mapping.regUpdateId;
    if (!groupedByUpdate[updateId]) {
      groupedByUpdate[updateId] = {
        updateId,
        updateTitle: mapping.regUpdateTitle || 'Unknown Update',
        updateSource: mapping.regUpdateSource || 'Unknown',
        gaps: []
      };
    }
    groupedByUpdate[updateId].gaps.push(mapping);
  }

  // Convert to ImpactAnalysisResult format
  const results: ImpactAnalysisResult[] = Object.values(groupedByUpdate).map(group => {
    const affectedPolicies: GapAnalysisResult[] = group.gaps.map(gap => ({
      policyId: gap.policyId,
      policyTitle: gap.policyTitle || 'Unknown Policy',
      gapDescription: gap.gapDescription || 'Gap identified - review required',
      severity: (gap.severity as 'critical' | 'high' | 'medium' | 'low') || 'medium',
      recommendedAction: (gap.aiAnalysis as any)?.recommendedAction || 'Review and update policy to address regulatory requirements',
      affectedSections: (gap.aiAnalysis as any)?.affectedSections || [],
      confidenceScore: gap.confidenceScore || 85
    }));

    // Determine overall impact based on highest severity
    const severities = affectedPolicies.map(p => p.severity);
    let overallImpact: 'critical' | 'high' | 'medium' | 'low' = 'low';
    if (severities.includes('critical')) overallImpact = 'critical';
    else if (severities.includes('high')) overallImpact = 'high';
    else if (severities.includes('medium')) overallImpact = 'medium';

    return {
      regulatoryUpdateId: group.updateId,
      regulatoryUpdateTitle: group.updateTitle,
      analysisDate: group.gaps[0]?.createdAt?.toISOString() || new Date().toISOString(),
      overallImpact,
      summary: `Analysis identified ${affectedPolicies.length} policy gap(s) requiring attention for compliance with ${group.updateTitle}.`,
      affectedPolicies,
      newPoliciesNeeded: [],
      recommendedTimeline: overallImpact === 'critical' ? 'Immediate action required' : 
                          overallImpact === 'high' ? 'Within 30 days' : 
                          overallImpact === 'medium' ? 'Within 60 days' : 'Within 90 days',
      confidenceScore: Math.round(affectedPolicies.reduce((sum, p) => sum + p.confidenceScore, 0) / affectedPolicies.length) || 85
    };
  });

  // Calculate totals
  const totalGaps = mappings.length;
  const criticalGaps = mappings.filter(m => m.severity === 'critical').length;
  const highPriorityGaps = mappings.filter(m => m.severity === 'high').length;
  
  // Get unique policies analyzed
  const uniquePolicies = new Set(mappings.map(m => m.policyId));
  const policiesAnalyzed = uniquePolicies.size;

  return {
    totalGaps,
    criticalGaps,
    highPriorityGaps,
    policiesAnalyzed,
    results
  };
}
