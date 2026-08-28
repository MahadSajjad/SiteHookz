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
