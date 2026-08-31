const fs = require('fs');
const sql = fs.readFileSync('full_schema.sql', 'utf8');

const tables = [
  'FeeHead', 'FeePlan', 'SchoolFeePlanContext', 'TuitionFeePlanContext',
  'FeePlanItem', 'EnrollmentFeePlanAssignment', 'FeeCharge', 'Payment',
  'PaymentAllocation', 'PaymentReceiptSequence'
];

const enums = [
  'FeePlanType', 'FeePlanStatus', 'FeeFrequency', 'PaymentMethod', 'PaymentStatus'
];

let finalSql = '-- Create Enums\n';
for (const e of enums) {
  const r = new RegExp(`CREATE TYPE "public"\\."${e}" AS ENUM [^;]+;`);
  const m = sql.match(r);
  if (m) finalSql += m[0] + '\n';
}

finalSql += '\n-- Create Tables\n';
for (const t of tables) {
  const r = new RegExp(`CREATE TABLE "public"\\."${t}" \\([\\s\\S]*?\\);`);
  const m = sql.match(r);
  if (m) finalSql += m[0] + '\n\n';
}

finalSql += '-- Create Indexes and Constraints\n';
// get CREATE UNIQUE INDEX for these tables
const idxRegex = /CREATE UNIQUE INDEX "[^"]+" ON "public"\."[A-Za-z0-9_]+" [^;]+;/g;
let m;
while ((m = idxRegex.exec(sql)) !== null) {
  const stmt = m[0];
  if (tables.some(t => stmt.includes(`ON "public"."${t}"`))) {
    finalSql += stmt + '\n';
  }
}
const idxRegex2 = /CREATE INDEX "[^"]+" ON "public"\."[A-Za-z0-9_]+" [^;]+;/g;
while ((m = idxRegex2.exec(sql)) !== null) {
  const stmt = m[0];
  if (tables.some(t => stmt.includes(`ON "public"."${t}"`))) {
    finalSql += stmt + '\n';
  }
}

finalSql += '\n-- Add Foreign Keys\n';
const fkRegex = /ALTER TABLE "public"\."[A-Za-z0-9_]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY [^;]+;/g;
while ((m = fkRegex.exec(sql)) !== null) {
  const stmt = m[0];
  if (tables.some(t => stmt.includes(`ALTER TABLE "public"."${t}"`))) {
    finalSql += stmt + '\n';
  }
}

fs.mkdirSync('packages/database/prisma/migrations/20260830230000_education_fees_payments', { recursive: true });
fs.writeFileSync('packages/database/prisma/migrations/20260830230000_education_fees_payments/migration.sql', finalSql);
