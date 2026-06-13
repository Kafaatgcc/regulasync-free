/**
 * Analytics Service
 * 
 * Provides comprehensive analytics and reporting for the platform.
 */

import { getDb } from "./db";
import { 
  policies, 
  complianceRecords, 
  regulatoryUpdates, 
  auditTrail, 
  aiRecommendations,
  delegationAuthority,
  users,
  approvalRequests
} from "../drizzle/schema";
import { eq, desc, gte, lte, and, count, sql } from "drizzle-orm";

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Get compliance overview statistics
 */
export async function getComplianceOverview(dateRange?: DateRange) {
  const db = await getDb();
  if (!db) return null;
  
  const allPolicies = await db.select().from(policies);
  const allCompliance = await db.select().from(complianceRecords);
  const allUpdates = await db.select().from(regulatoryUpdates);
  
  // Calculate compliance score
  const totalScore = allPolicies.reduce((sum, p) => sum + (p.complianceScore || 0), 0);
  const avgScore = allPolicies.length > 0 ? Math.round(totalScore / allPolicies.length) : 0;
  
  // Policy status breakdown
  const policyByStatus = allPolicies.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Compliance status breakdown
  const complianceByStatus = allCompliance.reduce((acc, c) => {
    acc[c.complianceStatus] = (acc[c.complianceStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Regulatory updates by impact
  const updatesByImpact = allUpdates.reduce((acc, u) => {
    acc[u.impactLevel] = (acc[u.impactLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Action required count
  const actionRequired = allUpdates.filter(u => u.status === 'action_required').length;
  
  return {
    overallComplianceScore: avgScore,
    totalPolicies: allPolicies.length,
    activePolicies: allPolicies.filter(p => p.status === 'active').length,
    pendingReview: allPolicies.filter(p => p.status === 'pending_review').length,
    policyByStatus,
    complianceByStatus,
    totalRegulatoryUpdates: allUpdates.length,
    updatesByImpact,
    actionRequired,
    automatedPolicies: allPolicies.filter(p => p.automationEnabled).length,
  };
}

/**
 * Get trend data for compliance scores over time
 */
export async function getComplianceTrend(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  // Generate mock trend data based on current compliance records
  // In production, you'd have historical snapshots
  const allCompliance = await db.select().from(complianceRecords);
  
  const trend = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate slight variations in score
    const baseScore = allCompliance.length > 0 
      ? allCompliance.reduce((sum, c) => sum + (c.score || 0), 0) / allCompliance.length
      : 75;
    
    const variation = Math.sin(i * 0.2) * 5 + Math.random() * 3;
    
    trend.push({
      date: date.toISOString().split('T')[0],
      score: Math.min(100, Math.max(0, Math.round(baseScore + variation))),
    });
  }
  
  return trend;
}

/**
 * Get activity metrics
 */
export async function getActivityMetrics(dateRange?: DateRange) {
  const db = await getDb();
  if (!db) return null;
  
  const cutoffDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const recentAudit = await db.select()
    .from(auditTrail)
    .where(gte(auditTrail.createdAt, cutoffDate));
  
  // Activity by type
  const activityByType = recentAudit.reduce((acc, a) => {
    acc[a.action] = (acc[a.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Activity by day
  const activityByDay = recentAudit.reduce((acc, a) => {
    const day = a.createdAt.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Most active users
  const userActivity = recentAudit.reduce((acc, a) => {
    if (a.userId) {
      acc[a.userId] = (acc[a.userId] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);
  
  return {
    totalActivities: recentAudit.length,
    activityByType,
    activityByDay,
    mostActiveUsers: Object.entries(userActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId: parseInt(userId), count })),
  };
}

/**
 * Get AI recommendation analytics
 */
export async function getAIRecommendationAnalytics() {
  const db = await getDb();
  if (!db) return null;
  
  const allRecs = await db.select().from(aiRecommendations);
  
  const byStatus = allRecs.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byCategory = allRecs.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgConfidence = allRecs.length > 0
    ? Math.round(allRecs.reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / allRecs.length)
    : 0;
  
  const implementedRate = allRecs.length > 0
    ? Math.round((allRecs.filter(r => r.status === 'implemented').length / allRecs.length) * 100)
    : 0;
  
  return {
    total: allRecs.length,
    byStatus,
    byCategory,
    avgConfidenceScore: avgConfidence,
    implementationRate: implementedRate,
  };
}

/**
 * Get delegation analytics
 */
export async function getDelegationAnalytics() {
  const db = await getDb();
  if (!db) return null;
  
  const allDelegations = await db.select().from(delegationAuthority);
  
  const byType = allDelegations.reduce((acc, d) => {
    acc[d.authorityType] = (acc[d.authorityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byStatus = allDelegations.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate total delegated amount
  const totalDelegated = allDelegations.reduce((sum, d) => {
    return sum + parseFloat(d.thresholdAmount || '0');
  }, 0);
  
  return {
    total: allDelegations.length,
    active: allDelegations.filter(d => d.status === 'active').length,
    byType,
    byStatus,
    totalDelegatedAmount: totalDelegated,
  };
}

/**
 * Get approval workflow analytics
 */
export async function getApprovalAnalytics() {
  const db = await getDb();
  if (!db) return null;
  
  const allApprovals = await db.select().from(approvalRequests);
  
  const byStatus = allApprovals.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byType = allApprovals.reduce((acc, a) => {
    acc[a.requestType] = (acc[a.requestType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate average approval time (in hours)
  const completedApprovals = allApprovals.filter(a => 
    a.status === 'approved' && a.updatedAt && a.createdAt
  );
  
  const avgApprovalTime = completedApprovals.length > 0
    ? Math.round(completedApprovals.reduce((sum, a) => {
        const diff = (a.updatedAt.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60);
        return sum + diff;
      }, 0) / completedApprovals.length)
    : 0;
  
  return {
    total: allApprovals.length,
    pending: allApprovals.filter(a => a.status === 'pending').length,
    byStatus,
    byType,
    avgApprovalTimeHours: avgApprovalTime,
    approvalRate: allApprovals.length > 0
      ? Math.round((allApprovals.filter(a => a.status === 'approved').length / allApprovals.length) * 100)
      : 0,
  };
}

/**
 * Get executive dashboard data
 */
export async function getExecutiveDashboard() {
  const [
    compliance,
    activity,
    aiRecs,
    delegations,
    approvals,
    trend
  ] = await Promise.all([
    getComplianceOverview(),
    getActivityMetrics(),
    getAIRecommendationAnalytics(),
    getDelegationAnalytics(),
    getApprovalAnalytics(),
    getComplianceTrend(30),
  ]);
  
  return {
    compliance,
    activity,
    aiRecommendations: aiRecs,
    delegations,
    approvals,
    complianceTrend: trend,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get risk heatmap data
 */
export async function getRiskHeatmap() {
  const db = await getDb();
  if (!db) return [];
  
  const allPolicies = await db.select().from(policies);
  
  // Group by category and priority
  const heatmap: Array<{
    category: string;
    priority: string;
    count: number;
    avgScore: number;
  }> = [];
  
  const grouped = allPolicies.reduce((acc, p) => {
    const key = `${p.category}-${p.priority}`;
    if (!acc[key]) {
      acc[key] = { category: p.category, priority: p.priority, policies: [] };
    }
    acc[key].policies.push(p);
    return acc;
  }, {} as Record<string, { category: string; priority: string; policies: typeof allPolicies }>);
  
  for (const [_, group] of Object.entries(grouped)) {
    const avgScore = group.policies.reduce((sum, p) => sum + (p.complianceScore || 0), 0) / group.policies.length;
    heatmap.push({
      category: group.category,
      priority: group.priority,
      count: group.policies.length,
      avgScore: Math.round(avgScore),
    });
  }
  
  return heatmap;
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics() {
  const db = await getDb();
  if (!db) return null;
  
  const allUsers = await db.select().from(users);
  const recentAudit = await db.select()
    .from(auditTrail)
    .where(gte(auditTrail.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  
  // Active users in last 7 days
  const activeUserIds = new Set(recentAudit.map(a => a.userId).filter(Boolean));
  
  // Daily active users
  const dauByDay = recentAudit.reduce((acc, a) => {
    const day = a.createdAt.toISOString().split('T')[0];
    if (!acc[day]) acc[day] = new Set();
    if (a.userId) acc[day].add(a.userId);
    return acc;
  }, {} as Record<string, Set<number>>);
  
  return {
    totalUsers: allUsers.length,
    activeUsersLast7Days: activeUserIds.size,
    engagementRate: allUsers.length > 0 
      ? Math.round((activeUserIds.size / allUsers.length) * 100)
      : 0,
    dailyActiveUsers: Object.entries(dauByDay).map(([day, users]) => ({
      date: day,
      count: users.size,
    })),
  };
}
