import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomButton } from "@sitehookz/ui";
import {
  GradingScale,
  GradingScaleStatus,
  CreateGradingScaleBandDto,
} from "@sitehookz/api-client";
import { useApiClient } from "../../../hooks/useApiClient";
import {
  Plus,
  Edit2,
  Archive,
  Award,
  Trash2,
  X,
  
  AlertCircle,
  
} from "lucide-react";

interface ScaleBandFormItem {
  id?: string;
  name: string;
  code: string;
  minimumPercentage: number;
  isPassing: boolean;
  remarks?: string;
}

const DEFAULT_BANDS: ScaleBandFormItem[] = [
  { name: "Excellent", code: "A+", minimumPercentage: 90, isPassing: true },
  { name: "Very Good", code: "A", minimumPercentage: 80, isPassing: true },
  { name: "Good", code: "B", minimumPercentage: 70, isPassing: true },
  { name: "Satisfactory", code: "C", minimumPercentage: 60, isPassing: true },
  { name: "Pass", code: "D", minimumPercentage: 50, isPassing: true },
  { name: "Fail", code: "F", minimumPercentage: 0, isPassing: false },
];

export default function GradingScalesPage() {
  const { t } = useTranslation();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingScale, setEditingScale] = useState<GradingScale | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<GradingScaleStatus>(GradingScaleStatus.ACTIVE);
  const [formBands, setFormBands] = useState<ScaleBandFormItem[]>(DEFAULT_BANDS);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: scales, isLoading, error } = useQuery<GradingScale[]>({
    queryKey: ["gradingScales", { status: statusFilter }],
    queryFn: () =>
      api.gradingScales.list(
        statusFilter ? { status: statusFilter as GradingScaleStatus } : undefined
      ),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      bands: CreateGradingScaleBandDto[];
    }) => api.gradingScales.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gradingScales"] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || "Failed to create grading scale");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        status?: GradingScaleStatus;
        bands?: CreateGradingScaleBandDto[];
      };
    }) => api.gradingScales.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gradingScales"] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || "Failed to update grading scale");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.gradingScales.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gradingScales"] });
    },
  });

  const openCreateModal = () => {
    setEditingScale(null);
    setFormName("");
    setFormDescription("");
    setFormStatus(GradingScaleStatus.ACTIVE);
    setFormBands(DEFAULT_BANDS);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (scale: GradingScale) => {
    setEditingScale(scale);
    setFormName(scale.name);
    setFormDescription(scale.description || "");
    setFormStatus(scale.status);
    setFormBands(
      scale.bands && scale.bands.length > 0
        ? scale.bands.map((b) => ({
            id: b.id,
            name: b.name,
            code: b.code,
            minimumPercentage: Number(b.minimumPercentage),
            isPassing: b.isPassing,
            remarks: b.remarks || "",
          }))
        : DEFAULT_BANDS
    );
    setFormError(null);
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingScale(null);
    setFormError(null);
  };

  const handleAddBand = () => {
    setFormBands([
      ...formBands,
      { name: "New Grade", code: "N", minimumPercentage: 0, isPassing: true, remarks: "" },
    ]);
  };

  const handleRemoveBand = (index: number) => {
    setFormBands(formBands.filter((_, i) => i !== index));
  };

  const handleBandChange = (
    index: number,
    field: keyof ScaleBandFormItem,
    value: string | number | boolean
  ) => {
    const current = formBands[index];
    if (!current) return;
    const updated = [...formBands];
    updated[index] = { ...current, [field]: value };
    setFormBands(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError(t("reporting.errorNameRequired", "Scale name is required"));
      return;
    }
    if (formBands.length === 0) {
      setFormError(t("reporting.errorBandsRequired", "At least one grade band is required"));
      return;
    }

    const payloadBands: CreateGradingScaleBandDto[] = formBands.map((b) => ({
      name: b.name.trim(),
      code: b.code.trim(),
      minimumPercentage: Number(b.minimumPercentage),
      isPassing: Boolean(b.isPassing),
      ...(b.remarks?.trim() ? { remarks: b.remarks.trim() } : {}),
    }));

    const description = formDescription.trim();

    if (editingScale) {
      updateMutation.mutate({
        id: editingScale.id,
        data: {
          name: formName.trim(),
          ...(description ? { description } : {}),
          status: formStatus,
          bands: payloadBands,
        },
      });
    } else {
      createMutation.mutate({
        name: formName.trim(),
        ...(description ? { description } : {}),
        bands: payloadBands,
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-7 w-7 text-primary" />
            {t("reporting.gradingScalesTitle", "Grading Scales")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              "reporting.gradingScalesSubtitle",
              "Configure grading scales, percentage thresholds, and passing marks for report cards."
            )}
          </p>
        </div>
        <CustomButton onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("reporting.createScale", "Create Grading Scale")}
        </CustomButton>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-card border rounded-lg p-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("common.filterByStatus", "Status:")}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label={t("common.filterByStatus", "Filter by status")}
          className="text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t("common.allStatuses", "All Statuses")}</option>
          <option value="ACTIVE">{t("common.active", "Active")}</option>
          <option value="DRAFT">{t("common.draft", "Draft")}</option>
          <option value="ARCHIVED">{t("common.archived", "Archived")}</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
          <span>{t("common.loading", "Loading grading scales...")}</span>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{t("reporting.errorLoadingScales", "Failed to load grading scales.")}</p>
        </div>
      ) : !scales || scales.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 text-center bg-card">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-semibold text-foreground">
            {t("reporting.noScalesTitle", "No grading scales found")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
            {t(
              "reporting.noScalesDesc",
              "Set up your first grading scale to define grade codes and minimum percentage thresholds."
            )}
          </p>
          <CustomButton onClick={openCreateModal} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t("reporting.createScale", "Create Grading Scale")}
          </CustomButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scales.map((scale) => (
            <div
              key={scale.id}
              className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{scale.name}</h3>
                    {scale.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {scale.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      scale.status === GradingScaleStatus.ACTIVE
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : scale.status === GradingScaleStatus.DRAFT
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {scale.status}
                  </span>
                </div>
              </div>

              {/* Bands Table */}
              <div className="p-5 flex-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {t("reporting.bandsThresholds", "Grade Bands & Passing Criteria")}
                </h4>
                {scale.bands && scale.bands.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="pb-2 font-medium">{t("reporting.code", "Grade")}</th>
                          <th className="pb-2 font-medium">{t("reporting.name", "Title")}</th>
                          <th className="pb-2 font-medium">{t("reporting.minPercentage", "Min %")}</th>
                          <th className="pb-2 font-medium">{t("reporting.result", "Result")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {scale.bands
                          .sort((a, b) => Number(b.minimumPercentage) - Number(a.minimumPercentage))
                          .map((band) => (
                            <tr key={band.id} className="hover:bg-muted/50">
                              <td className="py-2 font-bold text-foreground">{band.code}</td>
                              <td className="py-2 text-foreground">{band.name}</td>
                              <td className="py-2 font-mono text-muted-foreground">
                                &ge; {Number(band.minimumPercentage)}%
                              </td>
                              <td className="py-2">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    band.isPassing
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  }`}
                                >
                                  {band.isPassing
                                    ? t("reporting.pass", "Pass")
                                    : t("reporting.fail", "Fail")}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    {t("reporting.noBandsDefined", "No bands defined yet.")}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-muted/20 border-t flex items-center justify-end gap-2">
                {scale.status !== GradingScaleStatus.ARCHIVED && (
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={() => archiveMutation.mutate(scale.id)}
                    isLoading={archiveMutation.isPending}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Archive className="h-3.5 w-3.5 mr-1" />
                    {t("common.archive", "Archive")}
                  </CustomButton>
                )}
                <CustomButton
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditModal(scale)}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  {t("reporting.manageBands", "Edit & Manage Bands")}
                </CustomButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Grading Scale */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border text-card-foreground rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">
                {editingScale
                  ? t("reporting.editScale", "Edit Grading Scale")
                  : t("reporting.createScale", "Create Grading Scale")}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {formError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Scale Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      {t("reporting.scaleName", "Scale Name")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t("reporting.scaleNamePlaceholder", "e.g. Standard K-12 Academic Scale")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      {t("common.status", "Status")}
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as GradingScaleStatus)}
                      aria-label={t("common.status", "Status")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value={GradingScaleStatus.ACTIVE}>Active</option>
                      <option value={GradingScaleStatus.DRAFT}>Draft</option>
                      <option value={GradingScaleStatus.ARCHIVED}>Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      {t("common.description", "Description")}
                    </label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder={t("reporting.descPlaceholder", "Optional notes or guidelines")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Bands Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {t("reporting.bandsList", "Grade Bands Configuration")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "reporting.bandsListSubtitle",
                          "Define grade code, label, minimum percentage required, and pass/fail condition."
                        )}
                      </p>
                    </div>
                    <CustomButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBand}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      {t("reporting.addBand", "Add Band")}
                    </CustomButton>
                  </div>

                  <div className="space-y-2 border rounded-lg p-3 bg-muted/10">
                    <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-2 py-1">
                      <div className="col-span-2">{t("reporting.code", "Grade")}</div>
                      <div className="col-span-3">{t("reporting.name", "Title / Label")}</div>
                      <div className="col-span-3">{t("reporting.minPercentage", "Min %")}</div>
                      <div className="col-span-2 text-center">{t("reporting.isPassing", "Passing?")}</div>
                      <div className="col-span-2 text-right">{t("common.actions", "Action")}</div>
                    </div>

                    {formBands.map((band, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-card border rounded-md p-2"
                      >
                        <div className="sm:col-span-2">
                          <span className="sm:hidden text-xs text-muted-foreground font-semibold mr-2">
                            Grade:
                          </span>
                          <input
                            type="text"
                            required
                            value={band.code}
                            onChange={(e) => handleBandChange(idx, "code", e.target.value)}
                            placeholder="A+"
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm font-bold"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <span className="sm:hidden text-xs text-muted-foreground font-semibold mr-2">
                            Label:
                          </span>
                          <input
                            type="text"
                            required
                            value={band.name}
                            onChange={(e) => handleBandChange(idx, "name", e.target.value)}
                            placeholder="Excellent"
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <span className="sm:hidden text-xs text-muted-foreground font-semibold mr-2">
                            Min %:
                          </span>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              required
                              value={band.minimumPercentage}
                              onChange={(e) =>
                                handleBandChange(idx, "minimumPercentage", parseFloat(e.target.value) || 0)
                              }
                              className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                            />
                            <span className="absolute right-2 text-xs text-muted-foreground font-mono">
                              %
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-start sm:justify-center">
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={band.isPassing}
                              onChange={(e) => handleBandChange(idx, "isPassing", e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className={band.isPassing ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                              {band.isPassing ? "Pass" : "Fail"}
                            </span>
                          </label>
                        </div>

                        <div className="sm:col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveBand(idx)}
                            disabled={formBands.length <= 1}
                            className="text-muted-foreground hover:text-destructive p-1 rounded disabled:opacity-30"
                            title="Remove grade band"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 border-t bg-muted/20 flex items-center justify-end gap-3">
                <CustomButton type="button" variant="outline" onClick={closeModal}>
                  {t("common.cancel", "Cancel")}
                </CustomButton>
                <CustomButton
                  type="submit"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingScale
                    ? t("common.saveChanges", "Save Changes")
                    : t("reporting.createScale", "Create Scale")}
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
