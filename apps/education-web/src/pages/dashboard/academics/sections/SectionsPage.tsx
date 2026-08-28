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
