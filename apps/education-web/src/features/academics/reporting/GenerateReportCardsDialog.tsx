import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CustomButton } from "@sitehookz/ui";
import { useApiClient } from "../../../hooks/useApiClient";
import { X, AlertCircle, FileText, Users } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultAcademicSessionId?: string;
  defaultSectionId?: string | undefined;
  defaultBatchId?: string | undefined;
}

export function GenerateReportCardsDialog({
  isOpen,
  onClose,
  onSuccess,
  defaultAcademicSessionId,
  defaultSectionId,
  defaultBatchId,
}: Props) {
  const { t } = useTranslation();
  const api = useApiClient();

  const [targetType, setTargetType] = useState<"section" | "batch">(
    defaultBatchId ? "batch" : "section"
  );
  const [academicSessionId, setAcademicSessionId] = useState(defaultAcademicSessionId || "");
  const [sectionId, setSectionId] = useState(defaultSectionId || "");
  const [batchId, setBatchId] = useState(defaultBatchId || "");
  const [title, setTitle] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Academic Sessions
  const { data: academicSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["academicSessions"],
    queryFn: async () => {
      try {
        const res = await api.academicSessions.list();
        return Array.isArray(res) ? res : res.data || [];
      } catch (err) {
        return [];
      }
    },
    enabled: isOpen,
  });

  // Fetch Sections
  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      try {
        const res = await api.sections.list({ limit: 100 });
        return Array.isArray(res) ? res : res.data || [];
      } catch (err) {
        return [];
      }
    },
    enabled: isOpen,
  });

  // Fetch Batches
  const { data: batches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      try {
        const res = await api.batches.list({ limit: 100 });
        return Array.isArray(res) ? res : res.data || [];
      } catch (err) {
        return [];
      }
    },
    enabled: isOpen,
  });

  const generateMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      periodStart: string;
      periodEnd: string;
      academicSessionId: string;
      sectionId?: string;
      batchId?: string;
    }) => {
      return api.reportCards.generate(payload);
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate report cards"
      );
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage(t("reporting.errorTitleRequired", "Title is required"));
      return;
    }
    if (!academicSessionId) {
      setErrorMessage(
        t("reporting.errorSessionRequired", "Please select an academic session")
      );
      return;
    }
    if (targetType === "section" && !sectionId) {
      setErrorMessage(t("reporting.errorSectionRequired", "Please select a section"));
      return;
    }
    if (targetType === "batch" && !batchId) {
      setErrorMessage(t("reporting.errorBatchRequired", "Please select a batch"));
      return;
    }
    if (!periodStart || !periodEnd) {
      setErrorMessage(
        t("reporting.errorDateRangeRequired", "Both start and end dates are required")
      );
      return;
    }
    if (new Date(periodStart) > new Date(periodEnd)) {
      setErrorMessage(
        t("reporting.errorDateRangeInvalid", "Start date cannot be after end date")
      );
      return;
    }

    const payload = {
      title: title.trim(),
      periodStart: new Date(periodStart).toISOString(),
      periodEnd: new Date(periodEnd).toISOString(),
      academicSessionId,
      ...(targetType === "section" ? { sectionId } : { batchId }),
    };

    generateMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border text-card-foreground rounded-xl shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">
              {t("reporting.generateCardsTitle", "Generate Report Cards")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                {t("reporting.reportCardTitle", "Report Card Title")} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("reporting.titlePlaceholder", "e.g. Mid-Term Examination 2026")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Academic Session */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                {t("reporting.academicSession", "Academic Session")} *
              </label>
              <select
                required
                value={academicSessionId}
                onChange={(e) => setAcademicSessionId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">
                  {isLoadingSessions
                    ? t("common.loading", "Loading sessions...")
                    : t("reporting.selectSession", "Select Academic Session")}
                </option>
                {academicSessions?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Type Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                {t("reporting.generateFor", "Generate For")} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType("section")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border transition-all ${
                    targetType === "section"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background border-input hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  {t("reporting.bySection", "By Section")}
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("batch")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border transition-all ${
                    targetType === "batch"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background border-input hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  {t("reporting.byBatch", "By Batch")}
                </button>
              </div>
            </div>

            {/* Target Specific Select */}
            {targetType === "section" ? (
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {t("reporting.section", "Section")} *
                </label>
                <select
                  required
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    {isLoadingSections
                      ? t("common.loading", "Loading sections...")
                      : t("reporting.selectSection", "Select Section")}
                  </option>
                  {sections?.map((sec: any) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} {sec.classLevel ? `(${sec.classLevel.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {t("reporting.batch", "Batch")} *
                </label>
                <select
                  required
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    {isLoadingBatches
                      ? t("common.loading", "Loading batches...")
                      : t("reporting.selectBatch", "Select Batch")}
                  </option>
                  {batches?.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.course ? `(${b.course.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {t("reporting.periodStart", "Period Start Date")} *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {t("reporting.periodEnd", "Period End Date")} *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-md border">
              {t(
                "reporting.generationNotice",
                "Snapshot calculations will be computed across all subjects and assessments for enrolled students within the specified date range."
              )}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-muted/20 flex items-center justify-end gap-3">
            <CustomButton type="button" variant="outline" onClick={onClose}>
              {t("common.cancel", "Cancel")}
            </CustomButton>
            <CustomButton type="submit" isLoading={generateMutation.isPending}>
              {t("reporting.generateNow", "Generate Report Cards")}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
}
