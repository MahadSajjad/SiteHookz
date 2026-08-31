import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useApiClient } from "../../../hooks/useApiClient";

export function StudentResultsTab({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const api = useApiClient();

  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["student-results", studentId],
    queryFn: () => api.assessments.getStudentHistory(studentId),
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
        {t("nav.results", "Results")}
      </h2>
      {results?.length === 0 ? (
        <div className="text-gray-500 py-4">
          {t("assessments.noResults", "No results found.")}
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
                  {t("common.title", "Title")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("common.type", "Type")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("assessments.marks", "Marks")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("common.status", "Status")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results?.map((item: any) => {
                const maxMarks = item.assessment?.maximumMarks || 0;
                const passingMarks = item.assessment?.passingMarks;
                const obtained = item.marksObtained;
                const percent =
                  maxMarks > 0 && obtained !== null && obtained !== undefined
                    ? ((obtained / maxMarks) * 100).toFixed(1)
                    : "-";

                let passStatus = "-";
                if (
                  passingMarks !== undefined &&
                  passingMarks !== null &&
                  obtained !== null &&
                  obtained !== undefined
                ) {
                  passStatus =
                    obtained >= passingMarks
                      ? t("assessments.pass", "Pass")
                      : t("assessments.fail", "Fail");
                }

                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.assessment
                        ? new Date(
                            item.assessment.assessmentDate,
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.assessment?.title || "-"}
                    </td>
                    <td className="p-4 text-sm">
                      {
                        t(
                          `assessments.type.${item.assessment.assessmentType}`,
                          item.assessment.assessmentType as any,
                        ) as string
                      }
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                        {
                          t(
                            `assessments.status.${item.status}`,
                            item.status as any,
                          ) as string
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.resultStatus === "GRADED" ? (
                        <>
                          <span className="font-semibold">{obtained}</span> /{" "}
                          {maxMarks}{" "}
                          <span className="text-gray-500 text-xs ml-1">
                            ({percent}%)
                          </span>
                        </>
                      ) : (
                        (t(
                          `assessments.resultStatus.${item.resultStatus}`,
                          item.resultStatus,
                        ) as string)
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {item.resultStatus === "GRADED" && passStatus !== "-" && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${passStatus === t("assessments.pass", "Pass") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {passStatus}
                        </span>
                      )}
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
