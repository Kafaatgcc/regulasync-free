import { createConnection } from "mysql2/promise";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

// Parse the DATABASE_URL
const url = new URL(DATABASE_URL);
const connection = await createConnection({
  host: url.hostname,
  port: parseInt(url.port || "3306"),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
});

const DEMO_PASSWORD = "Demo@2026!";
const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

const demoUsers = [
  {
    openId: `local_superadmin_${crypto.randomBytes(8).toString("hex")}`,
    email: "superadmin@regulasync.co.uk",
    name: "Sarah Mitchell",
    role: "super_admin",
    department: "Executive",
    jobTitle: "Chief Compliance Officer",
    isActive: true,
  },
  {
    openId: `local_admin_${crypto.randomBytes(8).toString("hex")}`,
    email: "admin@acmecorp.co.uk",
    name: "James Thornton",
    role: "company_admin",
    department: "Compliance",
    jobTitle: "Head of Compliance",
    isActive: true,
  },
  {
    openId: `local_compliance_${crypto.randomBytes(8).toString("hex")}`,
    email: "compliance@acmecorp.co.uk",
    name: "Priya Sharma",
    role: "compliance_manager",
    department: "Compliance",
    jobTitle: "Senior Compliance Manager",
    isActive: true,
  },
  {
    openId: `local_deptuser_${crypto.randomBytes(8).toString("hex")}`,
    email: "finance@acmecorp.co.uk",
    name: "David Chen",
    role: "department_user",
    department: "Finance",
    jobTitle: "Finance Director",
    isActive: true,
  },
  {
    openId: `local_auditor_${crypto.randomBytes(8).toString("hex")}`,
    email: "auditor@acmecorp.co.uk",
    name: "Emma Williams",
    role: "auditor",
    department: "Audit",
    jobTitle: "External Auditor",
    isActive: true,
  },
];

console.log("Seeding demo users...\n");

for (const user of demoUsers) {
  // Check if user already exists
  const [existing] = await connection.execute(
    "SELECT id FROM users WHERE email = ?",
    [user.email]
  );

  if (existing.length > 0) {
    // Update existing user
    await connection.execute(
      `UPDATE users SET name = ?, passwordHash = ?, role = ?, department = ?, jobTitle = ?, isActive = ?, loginMethod = 'password' WHERE email = ?`,
      [user.name, passwordHash, user.role, user.department, user.jobTitle, user.isActive, user.email]
    );
    console.log(`✓ Updated: ${user.email} (${user.role})`);
  } else {
    // Insert new user
    await connection.execute(
      `INSERT INTO users (openId, email, name, passwordHash, role, department, jobTitle, isActive, loginMethod, lastSignedIn, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'password', NOW(), NOW(), NOW())`,
      [user.openId, user.email, user.name, passwordHash, user.role, user.department, user.jobTitle, user.isActive]
    );
    console.log(`✓ Created: ${user.email} (${user.role})`);
  }
}

console.log(`\n✅ All demo users seeded successfully!`);
console.log(`\nDemo Credentials (all use same password):`);
console.log(`Password: ${DEMO_PASSWORD}\n`);
demoUsers.forEach(u => {
  console.log(`  ${u.role.padEnd(20)} ${u.email}`);
});

await connection.end();
