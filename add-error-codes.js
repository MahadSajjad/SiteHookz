const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'packages', 'platform-contracts', 'src', 'errors', 'error-codes.ts');
let content = fs.readFileSync(filePath, 'utf8');

const errorCodesToAdd = `
  // Reporting & Grading Scales
  GRADING_SCALE_NOT_FOUND: "GRADING_SCALE_NOT_FOUND",
  GRADING_SCALE_ACTIVE_MODIFICATION: "GRADING_SCALE_ACTIVE_MODIFICATION",
  GRADING_SCALE_INVALID_BANDS: "GRADING_SCALE_INVALID_BANDS",
  REPORT_CARD_NOT_FOUND: "REPORT_CARD_NOT_FOUND",
  REPORT_CARD_ALREADY_PUBLISHED: "REPORT_CARD_ALREADY_PUBLISHED",
  REPORT_CARD_INVALID_DATE_RANGE: "REPORT_CARD_INVALID_DATE_RANGE",
  REPORT_CARD_ENROLLMENT_MISMATCH: "REPORT_CARD_ENROLLMENT_MISMATCH",
`;

content = content.replace('  // General', errorCodesToAdd + '\n  // General');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Error codes added.');
