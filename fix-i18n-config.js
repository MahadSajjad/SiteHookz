const fs = require('fs');
let file = 'packages/i18n/src/config.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/import urCommon from "\.\/locales\/ur\/common\.json";/, 'import urCommon from "./locales/ur/common.json";\nimport enEducation from "./locales/en/education.json";\nimport urEducation from "./locales/ur/education.json";');
code = code.replace(/en: \{ common: enCommon \},/, 'en: { common: enCommon, education: enEducation },');
code = code.replace(/ur: \{ common: urCommon \},/, 'ur: { common: urCommon, education: urEducation },');
fs.writeFileSync(file, code);
