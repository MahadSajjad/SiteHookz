const fs = require('fs');
const path = require('path');

const baseDir = 'apps/api/src/products/education';
const dirs = ['students', 'guardians', 'staff'];
for (const dir of dirs) {
  fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
}

// Students Module
const studentsModule = `
import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { DatabaseModule } from '../../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
`;

// Guardians Module
const guardiansModule = `
import { Module } from '@nestjs/common';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { DatabaseModule } from '../../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GuardiansController],
  providers: [GuardiansService],
})
export class GuardiansModule {}
`;

// Staff Module
const staffModule = `
import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { DatabaseModule } from '../../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
`;

fs.writeFileSync(path.join(baseDir, 'students', 'students.module.ts'), studentsModule, 'utf8');
fs.writeFileSync(path.join(baseDir, 'guardians', 'guardians.module.ts'), guardiansModule, 'utf8');
fs.writeFileSync(path.join(baseDir, 'staff', 'staff.module.ts'), staffModule, 'utf8');

// Update EducationModule
let edMod = fs.readFileSync(path.join(baseDir, 'education.module.ts'), 'utf8');
edMod = edMod.replace('imports: [', 'imports: [\n    StudentsModule,\n    GuardiansModule,\n    StaffModule,\n');
edMod = `import { StudentsModule } from './students/students.module';\nimport { GuardiansModule } from './guardians/guardians.module';\nimport { StaffModule } from './staff/staff.module';\n` + edMod;
fs.writeFileSync(path.join(baseDir, 'education.module.ts'), edMod, 'utf8');
