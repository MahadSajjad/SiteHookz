import { coursesApi } from "@sitehookz/api-client/src/courses";
import { batchesApi } from "@sitehookz/api-client/src/batches";
import { classLevelsApi } from "@sitehookz/api-client/src/class-levels";
import { sectionsApi } from "@sitehookz/api-client/src/sections";
import { enrollmentsApi } from "@sitehookz/api-client/src/enrollments";
import { studentsApi, guardiansApi, staffApi } from "@sitehookz/api-client";

import { subjectsApi } from "@sitehookz/api-client/src/subjects";
import { subjectOfferingsApi } from "@sitehookz/api-client/src/subject-offerings";
import { teachingAssignmentsApi } from "@sitehookz/api-client/src/teaching-assignments";

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
    subjects: subjectsApi,
    subjectOfferings: subjectOfferingsApi,
    teachingAssignments: teachingAssignmentsApi,
  };
}
