/**
 * University Partnership Service
 *
 * Manages academic institution partnerships, student access programs,
 * and curriculum integration for the RegulaSync platform.
 */
import { getDb } from "./db";
import { universityPartnerships } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getPartnerships() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(universityPartnerships).orderBy(desc(universityPartnerships.createdAt));
}

export async function createPartnership(data: {
  institutionName: string;
  contactName?: string;
  contactEmail?: string;
  country?: string;
  programType?: "student_access" | "research" | "curriculum" | "internship";
  studentSeats?: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(universityPartnerships).values({
    ...data,
    status: "pending",
  });
  return { id: (result as any).insertId };
}

export async function updatePartnershipStatus(
  id: number,
  status: "pending" | "active" | "expired" | "suspended"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(universityPartnerships).set({ status }).where(eq(universityPartnerships.id, id));
  return { success: true };
}

export async function getPartnershipStats() {
  const db = await getDb();
  if (!db) return null;
  const all = await db.select().from(universityPartnerships);
  return {
    total: all.length,
    active: all.filter(p => p.status === "active").length,
    pending: all.filter(p => p.status === "pending").length,
    totalStudentSeats: all.reduce((s, p) => s + (p.studentSeats || 0), 0),
    byType: all.reduce((acc, p) => {
      acc[p.programType] = (acc[p.programType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}
