import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../../../hooks/useApiClient";

export function CoursesPage() {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["education.courses.list"],
    queryFn: () => api.courses.list(),
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
              <td>{c.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
