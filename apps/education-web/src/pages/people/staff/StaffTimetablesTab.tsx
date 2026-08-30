import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../../hooks/useApiClient";
import { TimetableWorkspace } from "../../../components/timetables/TimetableWorkspace";

export function StaffTimetablesTab({ staffId }: { staffId: string }) {
  const api = useApiClient();

  const {
    data: entries,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["education.timetables.staff", staffId],
    queryFn: () => api.timetables.getStaffTimetable(staffId),
    enabled: !!staffId,
    retry: false, // Don't retry if endpoint doesn't exist
  });

  if (isLoading) return <div>Loading assigned slots...</div>;

  if (isError || !entries) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border rounded-md shadow-sm">
        <p className="text-gray-500 mb-4">
          Timetable not available for this staff member.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-4 rounded-md shadow-sm border">
        <h2 className="text-lg font-semibold mb-2">Assigned Slots</h2>
        <p className="text-sm text-gray-500 mb-4">
          View this teacher's scheduled classes across all active timetables.
        </p>
        <TimetableWorkspace entries={entries} />
      </div>
    </div>
  );
}
