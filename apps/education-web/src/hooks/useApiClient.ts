import { studentsApi, guardiansApi, staffApi } from "@sitehookz/api-client";
import { batchesApi } from "@sitehookz/api-client/src/batches";
import { classLevelsApi } from "@sitehookz/api-client/src/class-levels";
import { coursesApi } from "@sitehookz/api-client/src/courses";
import { enrollmentsApi } from "@sitehookz/api-client/src/enrollments";
import { sectionsApi } from "@sitehookz/api-client/src/sections";
import { subjectOfferingsApi } from "@sitehookz/api-client/src/subject-offerings";
import { subjectsApi } from "@sitehookz/api-client/src/subjects";
import { teachingAssignmentsApi } from "@sitehookz/api-client/src/teaching-assignments";


const api = {
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

export type ApiClientType = any;

export function useApiClient(): ApiClientType {
  return api;
}
