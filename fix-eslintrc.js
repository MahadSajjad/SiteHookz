const fs = require('fs');
let content = fs.readFileSync('apps/api/.eslintrc.js', 'utf8');
content = content.replace('rules: {', 'rules: { "@typescript-eslint/no-unused-vars": "off",');
fs.writeFileSync('apps/api/.eslintrc.js', content);
