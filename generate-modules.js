const fs = require('fs');
const path = require('path');

const baseDir = path.join('apps', 'api', 'src', 'products', 'education');

fs.writeFileSync(path.join(baseDir, 'class-levels', 'class-levels.module.ts'), `
import { Module } from '@nestjs/common';
import { ClassLevelsController } from './class-levels.controller';
import { ClassLevelsService } from './class-levels.service';

@Module({
  controllers: [ClassLevelsController],
  providers: [ClassLevelsService],
  exports: [ClassLevelsService]
})
export class ClassLevelsModule {}
`);

fs.writeFileSync(path.join(baseDir, 'sections', 'sections.module.ts'), `
import { Module } from '@nestjs/common';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

@Module({
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService]
})
export class SectionsModule {}
`);

fs.writeFileSync(path.join(baseDir, 'enrollments', 'enrollments.module.ts'), `
import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService]
})
export class EnrollmentsModule {}
`);

// Update education.module.ts
let edModule = fs.readFileSync(path.join(baseDir, 'education.module.ts'), 'utf8');
edModule = `
import { ClassLevelsModule } from './class-levels/class-levels.module';
import { SectionsModule } from './sections/sections.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
` + edModule;

edModule = edModule.replace('imports: [', `imports: [\n    ClassLevelsModule,\n    SectionsModule,\n    EnrollmentsModule,`);
fs.writeFileSync(path.join(baseDir, 'education.module.ts'), edModule, 'utf8');
console.log('Modules generated');
