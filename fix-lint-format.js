const fs = require('fs');

const pkgs = [
  'packages/database',
  'apps/marketing-web',
  'apps/platform-admin-web',
  'apps/education-web',
  'apps/worker'
];

pkgs.forEach(pkg => {
  const rcPath = pkg + '/.eslintrc.json';
  if (!fs.existsSync(rcPath)) {
    fs.writeFileSync(rcPath, '{"extends": ["eslint:recommended"], "env": {"node": true, "browser": true}, "parserOptions": {"ecmaVersion": 2022}}', 'utf8');
  }
  
  if (!fs.existsSync(pkg + '/src')) {
    fs.mkdirSync(pkg + '/src', { recursive: true });
    fs.writeFileSync(pkg + '/src/index.js', 'console.log("dummy");', 'utf8');
  }
});
console.log("Lint configs added");
