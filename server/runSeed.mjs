/**
 * Standalone seed runner — executes all seed functions directly
 * Run with: node --loader ts-node/esm server/runSeed.mjs
 * Or via tsx: npx tsx server/runSeed.mjs
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from .env file if present (for local dev)
try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length && !process.env[key]) {
      process.env[key] = vals.join('=').trim();
    }
  });
} catch {}

const { seedAllData } = await import('./seedDatabase.ts');
const { seedAuditData } = await import('./seedAuditData.ts');
const { seedGapAnalysisData } = await import('./seedGapAnalysis.ts');
const { seedEsgData } = await import('./esgService.ts');

// Use owner ID 1 (will be created if needed)
const SEED_USER_ID = 1;
const SEED_USER_NAME = 'Baidaa Housen';

console.log('🌱 Starting full database seed...\n');

try {
  console.log('📋 Seeding core data (policies, regulations, departments, AI recommendations)...');
  const coreResults = await seedAllData(SEED_USER_ID, SEED_USER_NAME);
  console.log('✅ Core data seeded:', coreResults);
} catch (e) {
  console.error('❌ Core seed error:', e.message);
}

try {
  console.log('\n🔐 Seeding audit trail with cryptographic hash chain...');
  const auditResults = await seedAuditData();
  console.log('✅ Audit trail seeded:', auditResults);
} catch (e) {
  console.error('❌ Audit seed error:', e.message);
}

try {
  console.log('\n📊 Seeding gap analysis with UK regulatory scenarios...');
  const gapResults = await seedGapAnalysisData();
  console.log('✅ Gap analysis seeded:', gapResults);
} catch (e) {
  console.error('❌ Gap analysis seed error:', e.message);
}

try {
  console.log('\n🌿 Seeding ESG metrics data...');
  const esgResults = await seedEsgData(SEED_USER_ID);
  console.log('✅ ESG data seeded:', esgResults);
} catch (e) {
  console.error('❌ ESG seed error:', e.message);
}

console.log('\n🎉 Database seeding complete!');
process.exit(0);
