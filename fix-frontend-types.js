const fs = require('fs');

function fixFile(file, edits) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [from, to] of edits) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content, 'utf8');
}

// 1. GenerateReportCardsDialog.tsx: remove unused Calendar
fixFile('apps/education-web/src/features/academics/reporting/GenerateReportCardsDialog.tsx', [
  ['import { Calendar, AlertCircle, Sparkles } from "lucide-react";', 'import { AlertCircle, Sparkles } from "lucide-react";'],
  ['defaultSectionId?: string;', 'defaultSectionId?: string | undefined;'],
  ['defaultBatchId?: string;', 'defaultBatchId?: string | undefined;']
]);

// 2. GradingScalesPage.tsx
fixFile('apps/education-web/src/features/academics/reporting/GradingScalesPage.tsx', [
  ['import type { GradingScale, GradingScaleBand } from "@sitehookz/api-client";', 'import type { GradingScale } from "@sitehookz/api-client";'],
  ['Check,', ''],
  ['ChevronRight,', ''],
  ['id?: string;\n  name?: string;\n  code?: string;\n  minimumPercentage?: number;\n  isPassing?: boolean;\n  remarks?: string;', 'id?: string | undefined;\n  name: string;\n  code: string;\n  minimumPercentage: number;\n  isPassing: boolean;\n  remarks?: string | undefined;'],
  ['description: description.trim() || undefined,', '...(description.trim() ? { description: description.trim() } : {}),'],
  ['...(scale.description !== undefined && { description: scale.description }),', '...(scale.description ? { description: scale.description } : {}),']
]);

// 3. ReportCardDetailPage.tsx
fixFile('apps/education-web/src/features/academics/reporting/ReportCardDetailPage.tsx', [
  ['import React, { useRef } from "react";', 'import { useRef } from "react";'],
  ['CheckCircle,', ''],
  ['XCircle,', ''],
  ['Award,', ''],
  ['Building,', ''],
  ['User,', ''],
  ['const { data: reportCard, isLoading, error, refetch } =', 'const { data: reportCard, isLoading, error } =']
]);

// 4. ReportCardsPage.tsx
fixFile('apps/education-web/src/features/academics/reporting/ReportCardsPage.tsx', [
  ['import React, { useState } from "react";', 'import { useState } from "react";'],
  ['Filter,', ''],
  ['GraduationCap,', ''],
  ['defaultSectionId={selectedSection || undefined}', 'defaultSectionId={selectedSection || undefined}'],
  ['defaultBatchId={selectedBatch || undefined}', 'defaultBatchId={selectedBatch || undefined}']
]);

// 5. Tabs
fixFile('apps/education-web/src/pages/academics/batches/BatchReportCardsTab.tsx', [
  ['import React, { useState } from "react";', 'import { useState } from "react";']
]);

fixFile('apps/education-web/src/pages/academics/sections/SectionReportCardsTab.tsx', [
  ['import React, { useState } from "react";', 'import { useState } from "react";']
]);

console.log('Fixed strictness issues.');
