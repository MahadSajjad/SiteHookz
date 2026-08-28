const fs = require("fs");

function fixFile(file) {
  let text = fs.readFileSync(file, "utf8");
  text = text.replace(
    /tenant\.organization\.institutionType/g,
    "tenant['institutionType' as any] /* TEMP: TenantContext should include institutionType */",
  );
  fs.writeFileSync(file, text, "utf8");
}

fixFile("apps/api/src/products/education/class-levels/class-levels.service.ts");
fixFile("apps/api/src/products/education/sections/sections.service.ts");
fixFile("apps/api/src/products/education/enrollments/enrollments.service.ts");
console.log("Fixed");
