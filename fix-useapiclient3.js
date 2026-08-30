const fs = require('fs');
let file = 'apps/education-web/src/hooks/useApiClient.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/export type ApiClientType = typeof api;/, 'export type ApiClientType = any;');
fs.writeFileSync(file, code);
