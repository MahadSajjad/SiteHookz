const fs = require('fs');
let c = fs.readFileSync('products/education/src/permissions/education-permissions.ts', 'utf8');
c = c.replace(/export \{ EDUCATION_PERMISSIONS as OLD_EDUCATION_PERMISSIONS \} from "@sitehookz\/platform-permissions";/, '');
fs.writeFileSync('products/education/src/permissions/education-permissions.ts', c);
