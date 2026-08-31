import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useApiClient } from "../../../hooks/useApiClient";
import StudentFeesTab from "../../../features/students/components/student-fees-tab";
import { StudentResultsTab } from "../../../features/academics/assessments/StudentResultsTab";

function StudentAttendanceTab({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const api = useApiClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["studentAttendanceHistory", studentId, page],
    queryFn: () =>
      api.studentAttendance.getStudentHistory(studentId, { page, limit: 10 }),
  });

  if (isLoading)
    return <div className="p-4">{t("common.loading", "Loading...")}</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        {t("common.error", "An error occurred")}
      </div>
    );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {t("attendance.history", "Attendance History")}
      </h2>
      {data?.items?.length === 0 ? (
        <div className="text-gray-500 py-4">
          {t("attendance.noHistory", "No attendance history found.")}
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("common.date", "Date")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("attendance.status.title", "Status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("attendance.context", "Context")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {item.date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "PRESENT"
                          ? "bg-green-100 text-green-800"
                          : item.status === "ABSENT"
                            ? "bg-red-100 text-red-800"
                            : item.status === "LATE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {
                        t(
                          `attendance.status.${item.status.toLowerCase()}`,
                          item.status,
                        ) as string
                      }
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.section?.name || item.batch?.name || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t flex justify-between">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {t("common.prev", "Previous")}
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data || data.items.length < 10}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {t("common.next", "Next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("profile");
  const { t } = useTranslation();
  const api = useApiClient();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: () => api.students.get(id!),
    enabled: !!id,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {student
            ? `${student.firstName} ${student.lastName}`
            : t("common.loading", "Loading...")}
        </h1>
        {student && (
          <p className="text-gray-500 mt-1">
            {t("students.admissionNumber", "Admission No")}:{" "}
            {student.admissionNumber}
          </p>
        )}
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("nav.profile", "Profile")}
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "attendance"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("nav.attendance", "Attendance")}
          </button>
          <button
            onClick={() => setActiveTab("fees")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "fees"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("nav.fees", "Fees")}
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "results"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("nav.results", "Results")}
          </button>
        </nav>
      </div>

      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            {t("nav.profile", "Profile")}
          </h2>
          {isLoading ? (
            <p>{t("common.loading", "Loading...")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">
                  {t("students.gender", "Gender")}
                </label>
                <div className="font-medium">{student?.gender || "-"}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-500">
                  {t("students.dob", "Date of Birth")}
                </label>
                <div className="font-medium">{student?.dateOfBirth || "-"}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "attendance" && id && (
        <StudentAttendanceTab studentId={id} />
      )}
      {activeTab === "fees" && id && (
        <div className="bg-white rounded shadow">
          <StudentFeesTab studentId={id} />
        </div>
      )}
      {activeTab === "results" && id && (
        <div className="bg-white rounded shadow">
          <StudentResultsTab studentId={id} />
        </div>
      )}
    </div>
  );
}
