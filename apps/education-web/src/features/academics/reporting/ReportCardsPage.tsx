import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CustomButton } from "@sitehookz/ui";
import {
  ReportCard,
  ReportCardStatus,
  ReportCardPassStatus,
} from "@sitehookz/api-client";
import { useApiClient } from "../../../hooks/useApiClient";
import { GenerateReportCardsDialog } from "./GenerateReportCardsDialog";
import {
  FileText,
  Plus,
  Send,
  CheckSquare,
  Square,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

export default function ReportCardsPage() {
  const { t } = useTranslation();
  const api = useApiClient();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [batchFilter, setBatchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState<boolean>(false);

  // Fetch sections for filter
  const { data: sections } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      try {
        const res = await api.sections.list({ limit: 100 });
        return Array.isArray(res) ? res : res.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  // Fetch batches for filter
  const { data: batches } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      try {
        const res = await api.batches.list({ limit: 100 });
        return Array.isArray(res) ? res : res.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  // Fetch report cards
  const {
    data: reportCards,
    isLoading,
    error,
    refetch,
  } = useQuery<ReportCard[]>({
    queryKey: ["reportCards", { sectionFilter, batchFilter, statusFilter }],
    queryFn: () =>
      api.reportCards.list({
        sectionId: sectionFilter || undefined,
        batchId: batchFilter || undefined,
        status: statusFilter ? (statusFilter as ReportCardStatus) : undefined,
      }),
  });

  // Bulk publish mutation
  const publishMutation = useMutation({
    mutationFn: (ids: string[]) =>
      api.reportCards.publish({ reportCardIds: ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reportCards"] });
      setSelectedIds([]);
    },
  });

  // Filter report cards locally by search query
  const filteredCards = (reportCards || []).filter((card: any) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const student = card.studentEnrollment?.student;
    const studentName = student
      ? `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase()
      : "";
    const rollNo = student?.rollNumber?.toLowerCase() || "";
    const admissionNo = student?.admissionNumber?.toLowerCase() || "";
    const cardTitle = card.title?.toLowerCase() || "";

    return (
      studentName.includes(term) ||
      rollNo.includes(term) ||
      admissionNo.includes(term) ||
      cardTitle.includes(term)
    );
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCards.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePublishSelected = () => {
    if (selectedIds.length === 0) return;
    publishMutation.mutate(selectedIds);
  };

  const getPassStatusBadge = (status: ReportCardPassStatus) => {
    switch (status) {
      case ReportCardPassStatus.PASS:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            {t("reporting.pass", "Pass")}
          </span>
        );
      case ReportCardPassStatus.FAIL:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
            {t("reporting.fail", "Fail")}
          </span>
        );
      case ReportCardPassStatus.EXEMPT:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {t("reporting.exempt", "Exempt")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {t("reporting.notGraded", "Not Graded")}
          </span>
        );
    }
  };

  const getStatusBadge = (status: ReportCardStatus) => {
    switch (status) {
      case ReportCardStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {t("reporting.published", "Published")}
          </span>
        );
      case ReportCardStatus.DRAFT:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {t("reporting.draft", "Draft")}
          </span>
        );
      case ReportCardStatus.ARCHIVED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {t("reporting.archived", "Archived")}
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            {t("reporting.reportCardsTitle", "Report Cards")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              "reporting.reportCardsSubtitle",
              "Generate, review, publish, and print official student academic report cards."
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CustomButton
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("reporting.generateCards", "Generate Report Cards")}
          </CustomButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("reporting.searchPlaceholder", "Search student, roll #, title...")}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={sectionFilter}
              onChange={(e) => {
                setSectionFilter(e.target.value);
                if (e.target.value) setBatchFilter("");
              }}
              aria-label={t("reporting.filterBySection", "Filter by section")}
              className="w-full text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("reporting.allSections", "All Sections")}</option>
              {sections?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                if (e.target.value) setSectionFilter("");
              }}
              aria-label={t("reporting.filterByBatch", "Filter by batch")}
              className="w-full text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("reporting.allBatches", "All Batches")}</option>
              {batches?.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t("common.filterByStatus", "Filter by status")}
              className="w-full text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("common.allStatuses", "All Statuses")}</option>
              <option value="DRAFT">{t("reporting.draft", "Draft")}</option>
              <option value="PUBLISHED">{t("reporting.published", "Published")}</option>
              <option value="ARCHIVED">{t("reporting.archived", "Archived")}</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-md px-4 py-2 mt-2">
            <span className="text-sm font-medium text-primary">
              {t("reporting.selectedCount", "{{count}} report cards selected", {
                count: selectedIds.length,
              })}
            </span>
            <div className="flex items-center gap-2">
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                {t("common.clearSelection", "Clear")}
              </CustomButton>
              <CustomButton
                size="sm"
                onClick={handlePublishSelected}
                isLoading={publishMutation.isPending}
                className="flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {t("reporting.publishSelected", "Publish Selected")}
              </CustomButton>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
          <span>{t("common.loading", "Loading report cards...")}</span>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{t("reporting.errorLoadingCards", "Failed to load report cards.")}</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 text-center bg-card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-semibold text-foreground">
            {t("reporting.noCardsTitle", "No report cards found")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
            {t(
              "reporting.noCardsDesc",
              "Generate report cards for a section or batch to review student term performance."
            )}
          </p>
          <CustomButton onClick={() => setIsGenerateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("reporting.generateCards", "Generate Report Cards")}
          </CustomButton>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table for Desktop */}
          <div className="hidden md:block bg-card border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <th className="p-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {selectedIds.length === filteredCards.length ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">{t("reporting.student", "Student")}</th>
                  <th className="p-3">{t("reporting.title", "Title & Period")}</th>
                  <th className="p-3">{t("reporting.group", "Section / Batch")}</th>
                  <th className="p-3 text-center">{t("reporting.score", "Score & %")}</th>
                  <th className="p-3 text-center">{t("reporting.grade", "Grade")}</th>
                  <th className="p-3 text-center">{t("reporting.result", "Result")}</th>
                  <th className="p-3 text-center">{t("common.status", "Status")}</th>
                  <th className="p-3 text-right">{t("common.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCards.map((card: any) => {
                  const student = card.studentEnrollment?.student;
                  const isSelected = selectedIds.includes(card.id);

                  return (
                    <tr
                      key={card.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(card.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Student Info */}
                      <td className="p-3">
                        <div className="font-semibold text-foreground">
                          {student
                            ? `${student.firstName || ""} ${student.lastName || ""}`
                            : t("common.unknownStudent", "Student")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student?.rollNumber && `Roll: ${student.rollNumber} `}
                          {student?.admissionNumber && `| Adm: ${student.admissionNumber}`}
                        </div>
                      </td>

                      {/* Title & Period */}
                      <td className="p-3">
                        <div className="font-medium text-foreground">{card.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(card.periodStart).toLocaleDateString()} -{" "}
                            {new Date(card.periodEnd).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Section / Batch */}
                      <td className="p-3 text-muted-foreground text-xs">
                        {card.section?.name ? (
                          <span className="bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded">
                            Sec: {card.section.name}
                          </span>
                        ) : card.batch?.name ? (
                          <span className="bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded">
                            Batch: {card.batch.name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Score & % */}
                      <td className="p-3 text-center">
                        <div className="font-mono font-bold text-foreground">
                          {Number(card.totalObtainedMarks)} / {Number(card.totalMaximumMarks)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Number(card.percentage).toFixed(1)}%
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="p-3 text-center">
                        <span className="font-bold text-sm px-2 py-0.5 rounded bg-muted">
                          {card.overallGradeCode || "—"}
                        </span>
                      </td>

                      {/* Result */}
                      <td className="p-3 text-center">
                        {getPassStatusBadge(card.passStatus)}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        {getStatusBadge(card.status)}
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right">
                        <CustomButton
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/academics/report-cards/${card.id}`)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("common.view", "View")}
                        </CustomButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards for Mobile */}
          <div className="md:hidden space-y-3">
            {filteredCards.map((card: any) => {
              const student = card.studentEnrollment?.student;
              const isSelected = selectedIds.includes(card.id);

              return (
                <div
                  key={card.id}
                  className={`bg-card border rounded-lg p-4 shadow-sm space-y-3 ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(card.id)}
                        className="mt-0.5 text-muted-foreground"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <div className="font-semibold text-foreground">
                          {student
                            ? `${student.firstName || ""} ${student.lastName || ""}`
                            : "Student"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student?.rollNumber && `Roll: ${student.rollNumber} `}
                          {student?.admissionNumber && `| Adm: ${student.admissionNumber}`}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(card.status)}
                  </div>

                  <div className="text-sm">
                    <div className="font-medium text-foreground">{card.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(card.periodStart).toLocaleDateString()} -{" "}
                      {new Date(card.periodEnd).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <div>
                      <span className="text-muted-foreground mr-1">Marks:</span>
                      <span className="font-mono font-bold">
                        {Number(card.totalObtainedMarks)} / {Number(card.totalMaximumMarks)}
                      </span>
                      <span className="ml-1 text-muted-foreground">
                        ({Number(card.percentage).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold px-1.5 py-0.5 rounded bg-muted">
                        {card.overallGradeCode || "—"}
                      </span>
                      {getPassStatusBadge(card.passStatus)}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <CustomButton
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/academics/report-cards/${card.id}`)}
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t("common.viewReportCard", "View Report Card")}
                    </CustomButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generate Dialog */}
      <GenerateReportCardsDialog
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={() => {
          refetch();
        }}
        defaultSectionId={sectionFilter || undefined}
        defaultBatchId={batchFilter || undefined}
      />
    </div>
  );
}
