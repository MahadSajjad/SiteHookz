import { StudentsModule } from './students/students.module';
import { GuardiansModule } from './guardians/guardians.module';
import { StaffModule } from './staff/staff.module';
import { Module } from '@nestjs/common';
// import { AcademicSessionsModule } from './academic-sessions/academic-sessions.module';
// import { EducationOnboardingService } from './education-onboarding.service';

@Module({
  imports: [
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
