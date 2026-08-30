const fs = require('fs');
let file = 'apps/api/src/products/education/teaching-assignments/teaching-assignments.service.ts';
let code = fs.readFileSync(file, 'utf8');

let findStr = `    return this.repository.assign(tenant, data);
  }`;
let replaceStr = `    try {
      return await this.repository.assign(tenant, data);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new BusinessException(
          "TEACHING_ASSIGNMENT_DUPLICATE",
          400,
          "This staff member is already actively assigned to teach this subject offering."
        );
      }
      throw error;
    }
  }`;

code = code.replace(findStr, replaceStr);
fs.writeFileSync(file, code);
