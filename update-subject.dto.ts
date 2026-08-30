import { createSubjectSchema } from "./create-subject.dto";
import { z } from "zod";

export const updateSubjectSchema = createSubjectSchema.partial();
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;
