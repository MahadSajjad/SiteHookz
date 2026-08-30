const fs = require('fs');
let file = 'apps/worker/src/workers/email.worker.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('const { to, subject, template, data } = job.data;', 'const { to, subject, template } = job.data;');
fs.writeFileSync(file, content);
