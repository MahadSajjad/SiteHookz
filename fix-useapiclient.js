const fs = require('fs');
let file = 'apps/education-web/src/hooks/useApiClient.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/export function useApiClient\(\)/, 'import { type ApiClient } from "@sitehookz/api-client";\n\nexport function useApiClient(): ApiClient');
fs.writeFileSync(file, code);
