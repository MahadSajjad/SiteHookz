import { CustomButton } from "@sitehookz/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useApiClient } from "../../../hooks/useApiClient";
import { CreateAssessmentDialog } from "./CreateAssessmentDialog";

export default function AssessmentsPage() {
  const { t } = useTranslation();
  const api = useApiClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["assessments", { page, status, type }],
    queryFn: () =>
      api.assessments.list({
        page,
        limit: 20,
        ...(status ? { status: status as any } : {}),
        ...(type ? { type: type as any } : {}),
      }),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("academics.assessments", "Assessments")}
        </h1>
        <CustomButton onClick={() => setIsCreateDialogOpen(true)}>
          {t("assessments.create", "Create Assessment")}
        </CustomButton>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <select
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{t("common.allStatuses", "All Statuses")}</option>
            <option value="DRAFT">
              {t("assessments.status.DRAFT", "Draft")}
            </option>
            <option value="ACTIVE">
              {t("assessments.status.ACTIVE", "Active")}
            </option>
            <option value="RESULTS_PUBLISHED">
              {t("assessments.status.RESULTS_PUBLISHED", "Results Published")}
            </option>
            <option value="ARCHIVED">
              {t("assessments.status.ARCHIVED", "Archived")}
            </option>
          </select>
        </div>
        <div className="w-48">
          <select
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">{t("common.allTypes", "All Types")}</option>
            <option value="QUIZ">{t("assessments.type.QUIZ", "Quiz")}</option>
            <option value="ASSIGNMENT">
              {t("assessments.type.ASSIGNMENT", "Assignment")}
            </option>
            <option value="TEST">{t("assessments.type.TEST", "Test")}</option>
            <option value="MIDTERM">
              {t("assessments.type.MIDTERM", "Midterm")}
            </option>
            <option value="FINAL">
              {t("assessments.type.FINAL", "Final")}
            </option>
            <option value="PRACTICAL">
              {t("assessments.type.PRACTICAL", "Practical")}
            </option>
            <option value="OTHER">
              {t("assessments.type.OTHER", "Other")}
            </option>
          </select>
        </div>
      </div>

      {isLoading && <p>{t("common.loading", "Loading...")}</p>}
      {error && (
        <p className="text-red-500">
          {t("common.error", "Error loading assessments")}
        </p>
      )}

      {!isLoading && !error && data && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-sm text-gray-600">
                  {t("common.title", "Title")}
                </th>
                <th className="p-4 font-semibold text-sm text-gray-600">
                  {t("common.type", "Type")}
                </th>
                <th className="p-4 font-semibold text-sm text-gray-600">
                  {t("common.date", "Date")}
                </th>
                <th className="p-4 font-semibold text-sm text-gray-600">
                  {t("common.status", "Status")}
                </th>
                <th className="p-4 font-semibold text-sm text-gray-600">
                  {t("common.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((assessment: any) => (
                <tr key={assessment.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{assessment.title}</td>
                  <td className="p-4 text-sm">
                    {
                      t(
                        `assessments.type.${assessment.assessmentType}`,
                        assessment.assessmentType as any,
                      ) as string
                    }
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                      {
                        t(
                          `assessments.status.${assessment.status}`,
                          assessment.status as any,
                        ) as string
                      }
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/dashboard/academics/assessments/${assessment.id}`,
                        )
                      }
                    >
                      {t("common.view", "View")}
                    </CustomButton>
                  </td>
                </tr>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-sm text-gray-500"
                  >
                    {t("assessments.noAssessments", "No assessments found.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="md:hidden">
            {data?.items?.map((assessment: any) => (
              <div key={assessment.id} className="p-4 border-b">
                <div className="font-semibold">{assessment.title}</div>
                <div className="text-sm text-gray-500">
                  {
                    t(
                      `assessments.type.${assessment.assessmentType}`,
                      assessment.assessmentType as any,
                    ) as string
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(assessment.assessmentDate).toLocaleDateString()}
                </div>
                <div className="mt-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                    {
                      t(
                        `assessments.status.${assessment.status}`,
                        assessment.status as any,
                      ) as string
                    }
                  </span>
                </div>
                <div className="mt-4">
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/dashboard/academics/assessments/${assessment.id}`,
                      )
                    }
                  >
                    {t("common.view", "View")}
                  </CustomButton>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex justify-between">
            <CustomButton
              variant="outline"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              {t("common.prev", "Previous")}
            </CustomButton>
            <CustomButton
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data || data.items?.length < 20}
            >
              {t("common.next", "Next")}
            </CustomButton>
          </div>
        </div>
      )}
      {isCreateDialogOpen && (
        <CreateAssessmentDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
