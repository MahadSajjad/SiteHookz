const fs = require('fs');
let file = 'apps/worker/src/main.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/import \{ NestFactory \} from '@nestjs\/core';\nimport \{ WorkerModule \} from '\.\/worker\.module';/, 'import { NestFactory } from "@nestjs/core";\n\nimport { WorkerModule } from "./worker.module";');
fs.writeFileSync(file, code);

let file2 = 'apps/worker/src/workers/email.worker.ts';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(/async handleEmail\(\{ data \}: \{ data: any \}\) \{/, 'async handleEmail({ data }: { data: any }) {\n    console.log(data);');
fs.writeFileSync(file2, code2);
