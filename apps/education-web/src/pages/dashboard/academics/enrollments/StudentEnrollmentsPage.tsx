import { useQuery, useMutation } from "@tanstack/react-query";
import { useApiClient } from "../../../../hooks/useApiClient";

export function StudentEnrollmentsPage({ studentId }: { studentId: string }) {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["education.enrollments.studentHistory", studentId],
    queryFn: () => api.enrollments.studentHistory(studentId),
  });

  const endMutation = useMutation({
    mutationFn: (id: string) =>
      api.enrollments.endEnrollment(id, {
        status: "COMPLETED",
        endDate: new Date(),
        endReason: "COMPLETED",
      }),
  });

  if (isLoading) return <div>Loading Enrollments...</div>;
  if (error) return <div>Error loading enrollments</div>;

  return (
    <div>
      <h1>Academic History</h1>
      {data?.map((enr: any) => (
        <div key={enr.id}>
          <p>
            {enr.placementType} - {enr.status}
          </p>
          <button onClick={() => endMutation.mutate(enr.id)}>
            End Enrollment
          </button>
        </div>
      ))}
    </div>
  );
}
