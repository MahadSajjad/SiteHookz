import { AttendanceMode } from "@sitehookz/education";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import {
  AttendanceWorkspace,
  AttendanceStudent,
} from "../../../components/attendance/AttendanceWorkspace";
import { useApiClient } from "../../../hooks/useApiClient";

export default function TuitionAttendancePage() {
  const { t } = useTranslation();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const batchId = searchParams.get("batchId") || "";
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const { data: batchesData, isLoading: isLoadingBatches } = useQuery({
    queryKey: ["batches"],
    queryFn: () => api.batches.list({ limit: 100 }),
  });

  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["attendanceSessions", "tuition", batchId, date],
    queryFn: () =>
      api.attendanceSessions.getTuitionSessions(batchId, {
        dateFrom: date,
        dateTo: date,
      }),
    enabled: !!batchId && !!date,
  });

  const activeSession = sessionsData?.items?.[0];

  const { data: rosterData, isLoading: isLoadingRoster } = useQuery({
    queryKey: ["attendanceRoster", activeSession?.id],
    queryFn: () => api.attendanceSessions.getSessionRoster(activeSession!.id),
    enabled: !!activeSession?.id,
  });

  const createSessionMutation = useMutation({
    mutationFn: () =>
      api.attendanceSessions.createTuitionSession(batchId, {
        mode: AttendanceMode.DAILY,
        attendanceDate: date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendanceSessions", "tuition", batchId, date],
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: (records: any[]) =>
      api.studentAttendance.bulkMarkAttendance(activeSession!.id, { records }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendanceRoster", activeSession?.id],
      });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async (records: any[]) => {
      await api.studentAttendance.bulkMarkAttendance(activeSession!.id, {
        records,
      });
      return api.attendanceSessions.finalizeSession(activeSession!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendanceSessions", "tuition", batchId, date],
      });
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: () => api.attendanceSessions.cancelSession(activeSession!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendanceSessions", "tuition", batchId, date],
      });
    },
  });

  const students: AttendanceStudent[] = (rosterData || []).map((r: any) => ({
    id: r.studentEnrollmentId,
    studentId: r.studentId,
    name: r.name,
    admissionNumber: r.admissionNumber,
    rollNumber: r.rollNumber,
    existingStatus: r.existingStatus,
    note: r.note,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {t("attendance.tuitionAttendance", "Tuition Attendance")}
      </h1>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("attendance.selectDate", "Select Date")}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => updateSearchParams("date", e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("attendance.selectBatch", "Select Batch")}
          </label>
          <select
            value={batchId}
            onChange={(e) => updateSearchParams("batchId", e.target.value)}
            className="border p-2 rounded min-w-[200px]"
            disabled={isLoadingBatches}
          >
            <option value="">{t("common.select", "Select...")}</option>
            {batchesData?.items?.map((batch: any) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {batchId && date && !isLoadingSessions && !activeSession && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">
            {t(
              "attendance.noSession",
              "No attendance session started for this date.",
            )}
          </p>
          <button
            onClick={() => createSessionMutation.mutate()}
            disabled={createSessionMutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createSessionMutation.isPending
              ? t("common.loading", "Loading...")
              : t("attendance.startSession", "Start Session")}
          </button>
        </div>
      )}

      {activeSession && (
        <div className="mb-4">
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {t("attendance.status.title", "Status")}: {activeSession.status}
          </span>
        </div>
      )}

      {activeSession && (
        <AttendanceWorkspace
          mode="tuition"
          students={students}
          isLoading={isLoadingRoster}
          onSaveDraft={(records) => saveDraftMutation.mutate(records)}
          onFinalize={(records) => finalizeMutation.mutate(records)}
          onCancelSession={() => cancelSessionMutation.mutate()}
          isSaving={saveDraftMutation.isPending}
          isFinalizing={finalizeMutation.isPending}
        />
      )}
    </div>
  );
}
