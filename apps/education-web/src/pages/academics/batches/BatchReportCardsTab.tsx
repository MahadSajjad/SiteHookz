import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CustomButton } from "@sitehookz/ui";
import { useApiClient } from "../../../hooks/useApiClient";
import { GenerateReportCardsDialog } from "../../../features/academics/reporting/GenerateReportCardsDialog";
import { Plus, Eye, FileText, Calendar } from "lucide-react";

export function BatchReportCardsTab({ batchId }: { batchId: string }) {
  const { t } = useTranslation();
  const api = useApiClient();
  const navigate = useNavigate();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const { data: reportCards, isLoading, refetch } = useQuery({
    queryKey: ["batch-report-cards", batchId],
    queryFn: () => api.reportCards.list({ batchId }),
  });

  if (isLoading) {
    return <div className="p-4">{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("reporting.batchReportCards", "Batch Report Cards")}
        </h3>
        <CustomButton onClick={() => setIsGenerateOpen(true)} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          {t("reporting.generateCards", "Generate Report Cards")}
        </CustomButton>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b text-muted-foreground text-xs uppercase font-semibold">
              <th className="p-3">{t("reporting.student", "Student")}</th>
              <th className="p-3">{t("reporting.title", "Title & Period")}</th>
              <th className="p-3 text-center">{t("reporting.score", "Marks")}</th>
              <th className="p-3 text-center">{t("reporting.percentage", "%")}</th>
              <th className="p-3 text-center">{t("reporting.grade", "Grade")}</th>
              <th className="p-3 text-center">{t("reporting.result", "Result")}</th>
              <th className="p-3 text-center">{t("common.status", "Status")}</th>
              <th className="p-3 text-right">{t("common.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reportCards?.map((card: any) => {
              const student = card.studentEnrollment?.student;
              return (
                <tr key={card.id} className="hover:bg-muted/30">
                  <td className="p-3 font-semibold text-foreground">
                    {student ? `${student.firstName || ""} ${student.lastName || ""}` : "Student"}
                    {student?.rollNumber && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        Roll: {student.rollNumber}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-foreground">{card.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(card.periodStart).toLocaleDateString()} -{" "}
                      {new Date(card.periodEnd).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono font-semibold text-foreground">
                    {Number(card.totalObtainedMarks)} / {Number(card.totalMaximumMarks)}
                  </td>
                  <td className="p-3 text-center font-mono text-foreground">
                    {Number(card.percentage).toFixed(1)}%
                  </td>
                  <td className="p-3 text-center font-bold text-foreground">
                    {card.overallGradeCode || "—"}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                        card.passStatus === "PASS"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {card.passStatus}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-xs bg-muted text-foreground">
                      {card.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/academics/report-cards/${card.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      {t("common.view", "View")}
                    </CustomButton>
                  </td>
                </tr>
              );
            })}
            {(!reportCards || reportCards.length === 0) && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  {t("reporting.noCardsForBatch", "No report cards generated for this batch yet.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GenerateReportCardsDialog
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={() => refetch()}
        defaultBatchId={batchId}
      />
    </div>
  );
}
