import { coursesApi } from '@sitehookz/api-client/src/courses';
import { batchesApi } from '@sitehookz/api-client/src/batches';
import { classLevelsApi } from '@sitehookz/api-client/src/class-levels';
import { sectionsApi } from '@sitehookz/api-client/src/sections';
import { enrollmentsApi } from '@sitehookz/api-client/src/enrollments';
import { studentsApi, guardiansApi, staffApi } from '@sitehookz/api-client';

export function useApiClient() {
  return {
    courses: coursesApi,
    batches: batchesApi,
    classLevels: classLevelsApi,
    sections: sectionsApi,
    enrollments: enrollmentsApi,
    students: studentsApi,
    guardians: guardiansApi,
    staff: staffApi,
  };
}
