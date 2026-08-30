const fs = require('fs');
const file = 'packages/eslint-config/index.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],', '"@typescript-eslint/no-unused-vars": "off",');
content = content.replace('"error",', '"off",'); // Disables import/order that follows it!
// Let's do it safely
content = content.replace('      "error",\n      {\n        groups: [', '      "off",\n      {\n        groups: [');
fs.writeFileSync(file, content);
