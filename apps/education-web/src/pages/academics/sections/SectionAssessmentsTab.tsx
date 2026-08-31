import { CustomButton } from "@sitehookz/ui";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useApiClient } from "../../../hooks/useApiClient";
import { CreateAssessmentDialog } from "../../../features/academics/assessments/CreateAssessmentDialog";

export function SectionAssessmentsTab({ sectionId }: { sectionId: string }) {
  const { t } = useTranslation();
  const api = useApiClient();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["section-assessments", sectionId],
    queryFn: () => api.assessments.list({ sectionId, limit: 100 }),
  });

  if (isLoading)
    return <div className="p-4">{t("common.loading", "Loading...")}</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => setIsCreateDialogOpen(true)}>
          {t("assessments.create", "Create Assessment")}
        </CustomButton>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-sm text-gray-600">
                {t("common.title", "Title")}
              </th>
              <th className="p-4 font-semibold text-sm text-gray-600">
                {t("academics.subjectOffering", "Subject")}
              </th>
              <th className="p-4 font-semibold text-sm text-gray-600">
                {t("common.type", "Type")}
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
                  {assessment.subjectOffering?.subject?.name || "-"}
                </td>
                <td className="p-4 text-sm">
                  {
                    t(
                      `assessments.type.${assessment.assessmentType}`,
                      assessment.assessmentType as any,
                    ) as string
                  }
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
      </div>

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
