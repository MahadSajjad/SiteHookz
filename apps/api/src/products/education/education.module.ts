import { CoursesModule } from './courses/courses.module';
import { BatchesModule } from './batches/batches.module';

import { ClassLevelsModule } from './class-levels/class-levels.module';
import { SectionsModule } from './sections/sections.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { StudentsModule } from './students/students.module';
import { GuardiansModule } from './guardians/guardians.module';
import { StaffModule } from './staff/staff.module';
import { Module } from '@nestjs/common';
// import { AcademicSessionsModule } from './academic-sessions/academic-sessions.module';
// import { EducationOnboardingService } from './education-onboarding.service';

@Module({
  imports: [
    CoursesModule,
    BatchesModule,
    ClassLevelsModule,
    SectionsModule,
    EnrollmentsModule,
    StudentsModule,
    GuardiansModule,
    StaffModule,

    // AcademicSessionsModule
  ],
  providers: [
    // EducationOnboardingService
  ],
  exports: [
    // EducationOnboardingService
  ]
})
export class EducationModule {}
