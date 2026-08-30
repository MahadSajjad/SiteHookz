import { Module } from "@nestjs/common";

import { BatchesModule } from "./batches/batches.module";
import { ClassLevelsModule } from "./class-levels/class-levels.module";
import { CoursesModule } from "./courses/courses.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { GuardiansModule } from "./guardians/guardians.module";
import { SectionsModule } from "./sections/sections.module";
import { StaffModule } from "./staff/staff.module";
import { StudentsModule } from "./students/students.module";
import { SubjectOfferingsModule } from "./subject-offerings/subject-offerings.module";
import { SubjectsModule } from "./subjects/subjects.module";
import { TeachingAssignmentsModule } from "./teaching-assignments/teaching-assignments.module";
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
    SubjectsModule,
    SubjectOfferingsModule,
    TeachingAssignmentsModule,

    // AcademicSessionsModule
  ],
  providers: [
    // EducationOnboardingService
  ],
  exports: [
    // EducationOnboardingService
  ],
})
export class EducationModule {}
