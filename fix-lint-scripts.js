const fs = require('fs');
const apps = ['apps/api', 'apps/education-web', 'apps/marketing-web', 'apps/platform-admin-web', 'apps/worker', 'packages/database'];
for (const app of apps) {
  let file = `${app}/package.json`;
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/"lint": "eslint .*",?/, '"lint": "eslint \\"src/**/*.{ts,tsx}\\"",');
    fs.writeFileSync(file, code);
  }
}
