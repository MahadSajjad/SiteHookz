import { Module } from '@nestjs/common';
// import { AcademicSessionsModule } from './academic-sessions/academic-sessions.module';
// import { EducationOnboardingService } from './education-onboarding.service';

@Module({
  imports: [
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
