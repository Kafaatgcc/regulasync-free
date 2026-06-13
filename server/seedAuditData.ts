/**
 * Seed Audit Trail Data
 * 
 * This script seeds the database with realistic audit trail entries
 * using the Self-Validating Audit Cache with proper hash chain.
 */

import { getDb } from "./db";
import { createAuditEntryWithHash } from "./auditCache";
import { policies, delegationAuthority, complianceRecords, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Sample audit entries to seed
const sampleAuditEntries = [
  {
    entityType: "policy",
    entityId: 1,
    action: "create" as const,
    userName: "Sarah Chen",
    previousValue: null,
    newValue: { title: "Anti-Money Laundering Policy", status: "draft" },
  },
  {
    entityType: "policy",
    entityId: 1,
    action: "update" as const,
    userName: "Sarah Chen",
    previousValue: { title: "Anti-Money Laundering Policy", status: "draft" },
    newValue: { title: "Anti-Money Laundering Policy v2.0", status: "pending_review" },
  },
  {
    entityType: "policy",
    entityId: 1,
    action: "approve" as const,
    userName: "Michael Brown",
    previousValue: { status: "pending_review" },
    newValue: { status: "approved" },
  },
  {
    entityType: "delegation",
    entityId: 1,
    action: "create" as const,
    userName: "James Wilson",
    previousValue: null,
    newValue: { title: "IT Procurement Authority", threshold: 50000 },
  },
  {
    entityType: "compliance",
    entityId: 1,
    action: "create" as const,
    userName: "Emma Davis",
    previousValue: null,
    newValue: { title: "Q4 GDPR Assessment", status: "in_progress" },
  },
  {
    entityType: "policy",
    entityId: 2,
    action: "create" as const,
    userName: "Lisa Johnson",
    previousValue: null,
    newValue: { title: "Data Protection Policy", status: "draft" },
  },
  {
    entityType: "policy",
    entityId: 2,
    action: "update" as const,
    userName: "Lisa Johnson",
    previousValue: { title: "Data Protection Policy", status: "draft" },
    newValue: { title: "Data Protection Policy", status: "pending_review", description: "Updated for GDPR compliance" },
  },
  {
    entityType: "compliance",
    entityId: 1,
    action: "update" as const,
    userName: "Emma Davis",
    previousValue: { status: "in_progress" },
    newValue: { status: "completed", score: 92 },
  },
  {
    entityType: "delegation",
    entityId: 2,
    action: "create" as const,
    userName: "CFO - Sarah Chen",
    previousValue: null,
    newValue: { title: "Marketing Budget Authority", threshold: 125000 },
  },
  {
    entityType: "policy",
    entityId: 3,
    action: "create" as const,
    userName: "Michael Brown",
    previousValue: null,
    newValue: { title: "Risk Management Framework", status: "draft" },
  },
  {
    entityType: "system",
    entityId: 0,
    action: "export" as const,
    userName: "Sarah Chen",
    previousValue: null,
    newValue: { exportType: "compliance_report", format: "PDF" },
  },
  {
    entityType: "policy",
    entityId: 3,
    action: "approve" as const,
    userName: "CEO - John Smith",
    previousValue: { status: "pending_review" },
    newValue: { status: "approved" },
  },
];

export async function seedAuditData() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return { success: false, error: "Database not available" };
  }

  console.log("Seeding audit trail data with hash chain...");
  
  let seededCount = 0;
  
  for (const entry of sampleAuditEntries) {
    try {
      const result = await createAuditEntryWithHash(db, {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        userId: null, // Demo data
        userName: entry.userName,
        previousValue: entry.previousValue,
        newValue: entry.newValue,
        ipAddress: "192.168.1." + Math.floor(Math.random() * 255),
      });
      
      console.log(`Created audit entry #${result.id} with hash: ${result.hash.substring(0, 16)}...`);
      seededCount++;
      
      // Small delay to ensure timestamps are different
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to create audit entry:`, error);
    }
  }
  
  console.log(`\nSeeded ${seededCount} audit entries with cryptographic hash chain.`);
  return { success: true, count: seededCount };
}

// Export for use in routers
export default seedAuditData;
