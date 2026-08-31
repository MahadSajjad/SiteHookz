import { CustomButton } from "@sitehookz/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

import { useApiClient } from "../../../hooks/useApiClient";
import { AssessmentResultStatus } from "@sitehookz/api-client/src/assessments";

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const api = useApiClient();
  const navigate = useNavigate();

  const [resultsData, setResultsData] = useState<
    Record<
      string,
      {
        marksObtained: string;
        resultStatus: AssessmentResultStatus;
        comment: string;
      }
    >
  >({});

  const {
    data: assessment,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["assessment", id],
    queryFn: () => api.assessments.get(id!),
    enabled: !!id,
  });

  const {
    data: results,
    isLoading: isLoadingResults,
    refetch: refetchResults,
  } = useQuery({
    queryKey: ["assessment-results", id],
    queryFn: () => api.assessments.getResults(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (results) {
      const initial: Record<string, any> = {};
      results.forEach((r: any) => {
        initial[r.studentEnrollmentId] = {
          marksObtained:
            r.marksObtained !== null && r.marksObtained !== undefined
              ? String(r.marksObtained)
              : "",
          resultStatus: r.resultStatus,
          comment: r.comment || "",
        };
      });
      setResultsData(initial);
    }
  }, [results]);

  const activateMutation = useMutation({
    mutationFn: () => api.assessments.activate(id!),
    onSuccess: () => refetch(),
  });

  const publishMutation = useMutation({
    mutationFn: () => api.assessments.publish(id!),
    onSuccess: () => refetch(),
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.assessments.archive(id!),
    onSuccess: () => refetch(),
  });

  const saveResultsMutation = useMutation({
    mutationFn: () => {
      const payload = Object.entries(resultsData).map(
        ([studentEnrollmentId, data]) => ({
          studentEnrollmentId,
          resultStatus: data.resultStatus,
          marksObtained: data.marksObtained
            ? parseFloat(data.marksObtained)
            : undefined,
          comment: data.comment,
        }),
      );
      return api.assessments.saveResults(id!, { results: payload });
    },
    onSuccess: () => {
      refetchResults();
      alert(t("common.savedSuccessfully", "Saved successfully"));
    },
  });

  const handleResultChange = (
    enrollmentId: string,
    field: string,
    value: string,
  ) => {
    setResultsData((prev: any) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value,
      },
    }));
  };

  const handlePublishClick = () => {
    if (
      window.confirm(
        t(
          "assessments.confirmPublish",
          "Are you sure you want to publish results? This cannot be undone.",
        ),
      )
    ) {
      publishMutation.mutate();
    }
  };

  if (isLoading)
    return <div className="p-6">{t("common.loading", "Loading...")}</div>;
  if (!assessment)
    return <div className="p-6">{t("common.notFound", "Not found")}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-500 mb-2 hover:underline"
          >
            &larr; {t("common.back", "Back")}
          </button>
          <h1 className="text-3xl font-bold">{assessment.title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>
              {t("common.type", "Type")}:{" "}
              <span className="font-medium">
                {
                  t(
                    `assessments.type.${assessment.assessmentType}`,
                    assessment.assessmentType as any,
                  ) as string
                }
              </span>
            </span>
            <span>
              {t("common.date", "Date")}:{" "}
              <span className="font-medium">
                {new Date(assessment.assessmentDate).toLocaleDateString()}
              </span>
            </span>
            <span>
              {t("assessments.maximumMarks", "Max Marks")}:{" "}
              <span className="font-medium">
                {String(assessment.maximumMarks)}
              </span>
            </span>
            {assessment.passingMarks && (
              <span>
                {t("assessments.passingMarks", "Passing Marks")}:{" "}
                <span className="font-medium">
                  {String(assessment.passingMarks)}
                </span>
              </span>
            )}
            <span>
              {t("common.status", "Status")}:{" "}
              <span className="font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {
                  t(
                    `assessments.status.${assessment.status}`,
                    assessment.status as any,
                  ) as string
                }
              </span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {assessment.status === "DRAFT" && (
            <CustomButton
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
            >
              {t("common.activate", "Activate")}
            </CustomButton>
          )}
          {assessment.status === "ACTIVE" && (
            <CustomButton
              variant="default"
              onClick={handlePublishClick}
              disabled={publishMutation.isPending}
            >
              {t("assessments.publishResults", "Publish Results")}
            </CustomButton>
          )}
          {assessment.status !== "ARCHIVED" && (
            <CustomButton
              variant="default"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              {t("common.archive", "Archive")}
            </CustomButton>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mt-8">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {t("assessments.gradingWorkspace", "Grading Workspace")}
          </h2>
          {assessment.status === "ACTIVE" && (
            <CustomButton
              onClick={() => saveResultsMutation.mutate()}
              disabled={saveResultsMutation.isPending}
            >
              {saveResultsMutation.isPending
                ? t("common.saving", "Saving...")
                : t("assessments.saveResults", "Save Results")}
            </CustomButton>
          )}
        </div>

        {isLoadingResults ? (
          <div className="p-4">{t("common.loading", "Loading results...")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-semibold text-sm text-gray-600">
                    {t("students.rollNumber", "Roll No")}
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-600">
                    {t("students.name", "Student Name")}
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-600 w-40">
                    {t("common.status", "Status")}
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-600 w-32">
                    {t("assessments.marks", "Marks")}
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-600">
                    {t("common.comment", "Comment")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {results?.map((result: any) => {
                  const data = resultsData[result.studentEnrollmentId] || {
                    resultStatus: "GRADED",
                    marksObtained: "",
                    comment: "",
                  };
                  const isReadOnly = assessment.status !== "ACTIVE";
                  const disableMarks =
                    data.resultStatus !== "GRADED" || isReadOnly;

                  return (
                    <tr
                      key={result.studentEnrollmentId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 text-sm">
                        {result.studentEnrollment?.placement?.rollNumber || "-"}
                      </td>
                      <td className="p-4 text-sm">
                        {result.studentEnrollment?.student?.firstName}{" "}
                        {result.studentEnrollment?.student?.lastName}
                      </td>
                      <td className="p-4 text-sm">
                        <select
                          className="w-full rounded-md border-gray-300 shadow-sm border p-1 text-sm"
                          value={data.resultStatus}
                          onChange={(e) =>
                            handleResultChange(
                              result.studentEnrollmentId,
                              "resultStatus",
                              e.target.value,
                            )
                          }
                          disabled={isReadOnly}
                        >
                          <option value="GRADED">
                            {t("assessments.resultStatus.GRADED", "Graded")}
                          </option>
                          <option value="ABSENT">
                            {t("assessments.resultStatus.ABSENT", "Absent")}
                          </option>
                          <option value="EXEMPT">
                            {t("assessments.resultStatus.EXEMPT", "Exempt")}
                          </option>
                        </select>
                      </td>
                      <td className="p-4 text-sm">
                        <input
                          type="number"
                          step="0.01"
                          max={Number(assessment.maximumMarks)}
                          className="w-full rounded-md border-gray-300 shadow-sm border p-1 text-sm"
                          value={disableMarks ? "" : data.marksObtained}
                          onChange={(e) =>
                            handleResultChange(
                              result.studentEnrollmentId,
                              "marksObtained",
                              e.target.value,
                            )
                          }
                          disabled={disableMarks}
                        />
                      </td>
                      <td className="p-4 text-sm">
                        <input
                          type="text"
                          className="w-full rounded-md border-gray-300 shadow-sm border p-1 text-sm"
                          value={data.comment}
                          onChange={(e) =>
                            handleResultChange(
                              result.studentEnrollmentId,
                              "comment",
                              e.target.value,
                            )
                          }
                          disabled={isReadOnly}
                        />
                      </td>
                    </tr>
                  );
                })}
                {(!results || results.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-sm text-gray-500"
                    >
                      {t(
                        "assessments.noStudents",
                        "No students found in this offering.",
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
