const fs = require('fs');

const fixPage = (file, isStaff) => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/import React, { useState } from "react";/, 'import { useState } from "react";');
  code = code.replace(/import React from "react";\n/, '');
  code = code.replace(/@sitehookz\/ui\/src\/components\/CustomButton/g, '@sitehookz/ui');
  
  if (file.includes('BatchDetailPage')) {
    code = code.replace(/api\.subjectOfferings\.list\(\{ batchId: id \}\)/, 'api.subjectOfferings.getByBatchId(id as string)');
  } else if (file.includes('SectionDetailPage')) {
    code = code.replace(/api\.subjectOfferings\.list\(\{ sectionId: id \}\)/, 'api.subjectOfferings.getBySectionId(id as string)');
  } else if (file.includes('StaffDetailPage')) {
    code = code.replace(/api\.teachingAssignments\.list\(\{ staffMemberId: id \}\)/, 'api.teachingAssignments.getByStaffMemberId(id as string)');
  }

  code = code.replace(/subjectsData\?\.items\?\.map/g, 'subjectsData?.map');
  code = code.replace(/!\subjectsData\?\.items \|\| subjectsData\.items\.length/g, '!subjectsData || subjectsData.length');
  
  code = code.replace(/assignmentsData\?\.items\?\.map/g, 'assignmentsData?.map');
  code = code.replace(/!\assignmentsData\?\.items \|\| assignmentsData\.items\.length/g, '!assignmentsData || assignmentsData.length');

  fs.writeFileSync(file, code);
}

fixPage('apps/education-web/src/pages/academics/batches/BatchDetailPage.tsx');
fixPage('apps/education-web/src/pages/academics/sections/SectionDetailPage.tsx');
fixPage('apps/education-web/src/pages/people/staff/StaffDetailPage.tsx');
