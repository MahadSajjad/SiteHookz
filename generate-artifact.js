const fs = require('fs');
const path = require('path');

const filesToInclude = [
  'packages/database/prisma/schema.prisma',
  'packages/database/prisma/migrations/00000000000000_init/migration.sql',
  'packages/database/src/seed.ts',
  'apps/api/src/platform/auth/auth.controller.ts',
  'apps/api/src/platform/auth/auth.service.ts',
  'apps/api/src/platform/auth/strategies/jwt.strategy.ts',
  'apps/api/src/platform/tenancy/tenant-resolver.service.ts',
  'apps/api/src/platform/tenancy/tenant.guard.ts',
  'apps/api/src/platform/authorization/authorization.service.ts',
  'apps/api/src/platform/authorization/permission.guard.ts',
  'apps/api/src/platform/roles/roles.service.ts',
  'PLAN.md',
  'SECURITY.md',
  'ARCHITECTURE.md',
  'DOMAIN_MODEL.md',
  'CODING_STANDARDS.md',
  'AGENTS.md',
  'MEMORY.md',
  'DECISIONS.md'
];

let output = '# Hardening Pass Source Code\n\nThis document contains all requested files from the identity and tenancy hardening pass.\n\n';

for (const file of filesToInclude) {
  if (fs.existsSync(file)) {
    const ext = path.extname(file).substring(1) || 'text';
    const lang = ext === 'prisma' ? 'prisma' : ext === 'ts' ? 'typescript' : ext === 'sql' ? 'sql' : ext === 'md' ? 'markdown' : 'text';
    output += `## \`${file}\`\n\n`;
    output += `\`\`\`${lang}\n`;
    output += fs.readFileSync(file, 'utf8').trim() + '\n';
    output += `\`\`\`\n\n`;
  }
}

const artifactDir = 'C:\\Users\\Mahad\\.gemini\\antigravity\\brain\\91e1d50d-71c4-4bb8-9f64-021ee0aa29f6';
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}
fs.writeFileSync(path.join(artifactDir, 'hardening-pass-code.md'), output, 'utf8');
