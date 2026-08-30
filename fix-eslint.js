const fs = require('fs');
const file = 'apps/api/.eslintrc.json';
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
config.rules = config.rules || {};
config.rules["@typescript-eslint/no-unused-vars"] = "off";
fs.writeFileSync(file, JSON.stringify(config, null, 2));
