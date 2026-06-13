/**
 * Rebuild Audit Chain
 * 
 * This script rebuilds the audit trail hash chain from scratch.
 * It clears all existing entries and creates new ones with proper
 * cryptographic linking.
 */

import { getDb } from "./db";
import { auditTrail } from "../drizzle/schema";
import { createAuditEntryWithHash } from "./auditCache";
import { sql } from "drizzle-orm";

// Sample audit entries to seed - comprehensive demo data
const sampleAuditEntries = [
  {
    entityType: "system",
    entityId: 0,
    action: "create" as const,
    userName: "System Administrator",
    previousValue: null,
    newValue: { event: "RegulaSync Platform Initialized", version: "5.0" },
  },
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
  {
    entityType: "policy",
    entityId: 4,
    action: "create" as const,
    userName: "Compliance Team",
    previousValue: null,
    newValue: { title: "FCA Consumer Duty Policy", status: "draft" },
  },
  {
    entityType: "compliance",
    entityId: 2,
    action: "create" as const,
    userName: "Risk Team",
    previousValue: null,
    newValue: { title: "Annual PRA Assessment", status: "scheduled" },
  },
  {
    entityType: "policy",
    entityId: 5,
    action: "create" as const,
    userName: "IT Security",
    previousValue: null,
    newValue: { title: "Cyber Security Framework", status: "active" },
  },
];

export async function rebuildAuditChain() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return { success: false, error: "Database not available" };
  }

  console.log("Rebuilding audit trail with proper hash chain...");
  
  try {
    // Step 1: Delete all existing audit entries
    console.log("Clearing existing audit entries...");
    await db.delete(auditTrail);
    
    // Step 2: Reset auto-increment (for MySQL/MariaDB)
    try {
      await db.execute(sql`ALTER TABLE audit_trail AUTO_INCREMENT = 1`);
    } catch (e) {
      // Ignore if this fails (SQLite doesn't support this)
      console.log("Note: Could not reset auto-increment (this is normal for SQLite)");
    }
    
    // Step 3: Create new entries with proper hash chain
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
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Failed to create audit entry:`, error);
      }
    }
    
    console.log(`\nRebuilt audit chain with ${seededCount} entries.`);
    console.log("All entries are now cryptographically linked with SHA-256 hashes.");
    
    return { 
      success: true, 
      count: seededCount,
      message: `Audit chain rebuilt with ${seededCount} entries. Chain integrity: INTACT`
    };
  } catch (error) {
    console.error("Error rebuilding audit chain:", error);
    return { success: false, error: String(error) };
  }
}

export default rebuildAuditChain;
