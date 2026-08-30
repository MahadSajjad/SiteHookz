import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "../../../../hooks/useApiClient";

export function ClassLevelsPage() {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["education.classLevels.list"],
    queryFn: () => api.classLevels.list(),
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
              <td>{cl.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
