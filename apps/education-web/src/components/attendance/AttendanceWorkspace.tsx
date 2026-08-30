import { StudentAttendanceStatus } from "@sitehookz/education";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface AttendanceStudent {
  id: string; // enrollment id
  studentId: string;
  name: string;
  admissionNumber: string;
  rollNumber?: string | null;
  existingStatus?: StudentAttendanceStatus | null;
  note?: string | null;
}

interface AttendanceWorkspaceProps {
  mode: "school" | "tuition";
  students: AttendanceStudent[];
  isLoading?: boolean;
  onSaveDraft: (
    records: {
      studentEnrollmentId: string;
      status: StudentAttendanceStatus;
      note?: string | null;
    }[],
  ) => void;
  onFinalize: (
    records: {
      studentEnrollmentId: string;
      status: StudentAttendanceStatus;
      note?: string | null;
    }[],
  ) => void;
  onCancelSession: () => void;
  isSaving?: boolean;
  isFinalizing?: boolean;
}

export function AttendanceWorkspace({
  students,
  isLoading,
  onSaveDraft,
  onFinalize,
  onCancelSession,
  isSaving,
  isFinalizing,
}: AttendanceWorkspaceProps) {
  const { t } = useTranslation();
  const [attendanceState, setAttendanceState] = useState<
    Record<string, StudentAttendanceStatus>
  >({});

  useEffect(() => {
    if (students.length > 0) {
      const initialState: Record<string, StudentAttendanceStatus> = {};
      students.forEach((s) => {
        initialState[s.id] =
          s.existingStatus || StudentAttendanceStatus.PRESENT;
      });
      setAttendanceState(initialState);
    }
  }, [students]);

  const handleStatusChange = (
    studentId: string,
    status: StudentAttendanceStatus,
  ) => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newState: Record<string, StudentAttendanceStatus> = {};
    students.forEach((s) => {
      newState[s.id] = StudentAttendanceStatus.PRESENT;
    });
    setAttendanceState(newState);
  };

  const getRecords = () => {
    return students.map((s) => {
      const record: {
        studentEnrollmentId: string;
        status: StudentAttendanceStatus;
        note?: string | null;
      } = {
        studentEnrollmentId: s.id,
        status: attendanceState[s.id] || StudentAttendanceStatus.PRESENT,
      };
      if (s.note !== undefined) {
        record.note = s.note;
      }
      return record;
    });
  };

  const presentCount = Object.values(attendanceState).filter(
    (s) => s === StudentAttendanceStatus.PRESENT,
  ).length;
  const absentCount = Object.values(attendanceState).filter(
    (s) => s === StudentAttendanceStatus.ABSENT,
  ).length;
  const lateCount = Object.values(attendanceState).filter(
    (s) => s === StudentAttendanceStatus.LATE,
  ).length;
  const excusedCount = Object.values(attendanceState).filter(
    (s) => s === StudentAttendanceStatus.EXCUSED,
  ).length;

  if (isLoading) {
    return <div className="p-4">{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow mt-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {t("attendance.roster", "Roster")}
          </h2>
          <div className="text-sm text-gray-500 space-x-4">
            <span className="text-green-600">
              {t("attendance.status.present", "Present")}: {presentCount}
            </span>
            <span className="text-red-600">
              {t("attendance.status.absent", "Absent")}: {absentCount}
            </span>
            <span className="text-yellow-600">
              {t("attendance.status.late", "Late")}: {lateCount}
            </span>
            <span className="text-blue-600">
              {t("attendance.status.excused", "Excused")}: {excusedCount}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={markAllPresent}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
          >
            {t("attendance.markAllPresent", "Mark All Present")}
          </button>
          <button
            onClick={() => onSaveDraft(getRecords())}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm hover:bg-blue-100 disabled:opacity-50"
          >
            {t("attendance.saveDraft", "Save Draft")}
          </button>
          <button
            onClick={() => onFinalize(getRecords())}
            disabled={isFinalizing}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {t("attendance.finalize", "Finalize")}
          </button>
          <button
            onClick={onCancelSession}
            className="px-4 py-2 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50"
          >
            {t("attendance.cancelSession", "Cancel Session")}
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t("attendance.noStudents", "No students found in this roster.")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("students.name", "Name")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("students.admissionNumber", "Admission No")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("attendance.status.title", "Status")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const currentStatus =
                  attendanceState[student.id] ||
                  StudentAttendanceStatus.PRESENT;
                return (
                  <tr key={student.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.admissionNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              student.id,
                              StudentAttendanceStatus.PRESENT,
                            )
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            currentStatus === StudentAttendanceStatus.PRESENT
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {t("attendance.status.present", "Present")}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              student.id,
                              StudentAttendanceStatus.ABSENT,
                            )
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            currentStatus === StudentAttendanceStatus.ABSENT
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {t("attendance.status.absent", "Absent")}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              student.id,
                              StudentAttendanceStatus.LATE,
                            )
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            currentStatus === StudentAttendanceStatus.LATE
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {t("attendance.status.late", "Late")}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              student.id,
                              StudentAttendanceStatus.EXCUSED,
                            )
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            currentStatus === StudentAttendanceStatus.EXCUSED
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {t("attendance.status.excused", "Excused")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
