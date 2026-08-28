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
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
}

writeFile(
  path.join(baseDir, "courses", "CoursesPage.tsx"),
  `
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../../../../hooks/useApiClient';

export function CoursesPage() {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['education.courses.list'],
    queryFn: () => api.courses.list()
  });

  if (isLoading) return <div>Loading Courses...</div>;
  if (error) return <div>Error loading courses</div>;

  return (
    <div>
      <h1>Courses</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((c: any) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.code}</td>
              <td>{c.isActive ? 'Active' : 'Inactive'}</td>
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
  path.join(baseDir, "batches", "BatchesPage.tsx"),
  `
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../../../../hooks/useApiClient';

export function BatchesPage() {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['education.batches.list'],
    queryFn: () => api.batches.list()
  });

  if (isLoading) return <div>Loading Batches...</div>;
  if (error) return <div>Error loading batches</div>;

  return (
    <div>
      <h1>Batches</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((b: any) => (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td>{b.code}</td>
              <td>{b.capacity}</td>
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
  path.join(baseDir, "enrollments", "StudentEnrollmentsPage.tsx"),
  `
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '../../../../hooks/useApiClient';

export function StudentEnrollmentsPage({ studentId }: { studentId: string }) {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['education.enrollments.studentHistory', studentId],
    queryFn: () => api.enrollments.studentHistory(studentId)
  });

  const endMutation = useMutation({
    mutationFn: (id: string) => api.enrollments.endEnrollment(id, { status: 'COMPLETED', endDate: new Date(), endReason: 'COMPLETED' })
  });

  if (isLoading) return <div>Loading Enrollments...</div>;
  if (error) return <div>Error loading enrollments</div>;

  return (
    <div>
      <h1>Academic History</h1>
      {data?.map((enr: any) => (
        <div key={enr.id}>
          <p>{enr.placementType} - {enr.status}</p>
          <button onClick={() => endMutation.mutate(enr.id)}>End Enrollment</button>
        </div>
      ))}
    </div>
  );
}
`,
);
console.log("Tuition Frontend generated");
