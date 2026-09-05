export const EDUCATION_GRADING_SCALES_PERMISSIONS = {
  READ: "education.grading_scales.read",
  CREATE: "education.grading_scales.create",
  UPDATE: "education.grading_scales.update",
  ARCHIVE: "education.grading_scales.archive",
  MANAGE: "education.grading_scales.manage",
} as const;

export const EDUCATION_REPORT_CARDS_PERMISSIONS = {
  READ: "education.report_cards.read",
  GENERATE: "education.report_cards.generate",
  PUBLISH: "education.report_cards.publish",
  ARCHIVE: "education.report_cards.archive",
} as const;
