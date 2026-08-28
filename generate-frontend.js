const fs = require("fs");
const path = require("path");

const baseDir = path.join(
  "apps",
  "education-web",
  "src",
  "pages",
  "dashboard",
  "academics",
);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
}

writeFile(
  path.join(baseDir, "class-levels", "ClassLevelsPage.tsx"),
  `
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../../../../hooks/useApiClient';

export function ClassLevelsPage() {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['education.classLevels.list'],
    queryFn: () => api.classLevels.list()
  });

  if (isLoading) return <div>Loading Class Levels...</div>;
  if (error) return <div>Error loading class levels</div>;

  return (
    <div>
      <h1>Class Levels</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((cl: any) => (
            <tr key={cl.id}>
              <td>{cl.name}</td>
              <td>{cl.code}</td>
              <td>{cl.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`,
);

writeFile(
  path.join(baseDir, "sections", "SectionsPage.tsx"),
  `
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../../../../hooks/useApiClient';

export function SectionsPage() {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['education.sections.list'],
    queryFn: () => api.sections.list()
  });

  if (isLoading) return <div>Loading Sections...</div>;
  if (error) return <div>Error loading sections</div>;

  return (
    <div>
      <h1>Sections</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((sec: any) => (
            <tr key={sec.id}>
              <td>{sec.name}</td>
              <td>{sec.code}</td>
              <td>{sec.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`,
);
console.log("Frontend pages generated");
