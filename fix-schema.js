const fs = require('fs');

let schema = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

// I want to remove the duplicate definitions
let lines = schema.split('\n');

const count = {};
const newLines = [];

// Very hacky but safe way: remove all newly added duplicate relations
// The duplicates are: studentEnrollments StudentEnrollment[], sections Section[], batches Batch[]
// Let's just filter out the second occurrence in each block. Or just use a block parser.

let currentModel = null;
let seenInModel = new Set();

for (let line of lines) {
  const match = line.match(/^model\s+(\w+)\s+\{/);
  if (match) {
    currentModel = match[1];
    seenInModel.clear();
    newLines.push(line);
    continue;
  }
  if (line.trim() === '}') {
    currentModel = null;
    newLines.push(line);
    continue;
  }
  
  if (currentModel) {
    const trimmed = line.trim();
    if (trimmed.startsWith('studentEnrollments StudentEnrollment[]')) {
      if (seenInModel.has('studentEnrollments')) continue;
      seenInModel.add('studentEnrollments');
    }
    if (trimmed.startsWith('sections Section[]') || trimmed.startsWith('sections                  Section[]')) {
      if (seenInModel.has('sections')) continue;
      seenInModel.add('sections');
    }
    if (trimmed.startsWith('batches Batch[]') || trimmed.startsWith('batches                   Batch[]')) {
      if (seenInModel.has('batches')) continue;
      seenInModel.add('batches');
    }
  }
  
  newLines.push(line);
}

fs.writeFileSync('packages/database/prisma/schema.prisma', newLines.join('\n'), 'utf8');

