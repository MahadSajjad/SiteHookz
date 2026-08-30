import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useApiClient } from "../../../hooks/useApiClient";
import { CustomButton, ConfirmDialog } from "@sitehookz/ui";
import { TimetableWorkspace } from "../../../components/timetables/TimetableWorkspace";
import { AddTimetableEntryDialog } from "../../../components/timetables/AddTimetableEntryDialog";
import { CreateTimetableEntryDto } from "@sitehookz/education";
import { usePermission } from "../../../hooks/usePermission";

export function SectionTimetablesTab({ sectionId }: { sectionId: string }) {
  const { t } = useTranslation("education");
  const api = useApiClient();
  const queryClient = useQueryClient();
  const hasCreatePerm = usePermission("education.timetables.create");
  const hasPublishPerm = usePermission("education.timetables.publish");

  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["education.timetables.school", sectionId],
    queryFn: () => api.timetables.listSchoolTimetables(sectionId),
    enabled: !!sectionId,
  });

  const activeScheduleId =
    selectedScheduleId ||
    (schedules && schedules.length > 0 ? schedules[0].id : null);

  const { data: detailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["education.timetables.detail", activeScheduleId],
    queryFn: () => api.timetables.getTimetableDetail(activeScheduleId!),
    enabled: !!activeScheduleId,
  });

  const { data: subjectOfferings } = useQuery({
    queryKey: ["education.subjectOfferings.list", { sectionId }],
    queryFn: () => api.subjectOfferings.getBySectionId(sectionId),
    enabled: !!sectionId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.timetables.createSchoolTimetable(sectionId, {
        name: "New Timetable",
        effectiveFrom: new Date().toISOString(),
      }),
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({
        queryKey: ["education.timetables.school", sectionId],
      });
      setSelectedScheduleId(data.id);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.timetables.publishTimetable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["education.timetables.school", sectionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["education.timetables.detail", activeScheduleId],
      });
      setIsPublishConfirmOpen(false);
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: (data: CreateTimetableEntryDto) =>
      api.timetables.createEntry(activeScheduleId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["education.timetables.detail", activeScheduleId],
      });
      setIsAddEntryOpen(false);
    },
  });

  if (isLoadingSchedules) return <div>Loading timetables...</div>;

  if (!schedules || schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border rounded-md shadow-sm">
        <p className="text-gray-500 mb-4">{t("timetable.emptyState")}</p>
        {hasCreatePerm && (
          <CustomButton
            onClick={() => createMutation.mutate()}
            isLoading={createMutation.isPending}
          >
            {t("timetable.createTimetable")}
          </CustomButton>
        )}
      </div>
    );
  }

  const activeSchedule = schedules.find((s: any) => s.id === activeScheduleId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border">
        <div className="flex items-center gap-4">
          <select
            className="border rounded-md px-3 py-2"
            value={activeScheduleId || ""}
            onChange={(e) => setSelectedScheduleId(e.target.value)}
          >
            {schedules.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} - {t(`timetable.${s.status.toLowerCase()}`)}
              </option>
            ))}
          </select>
          {activeSchedule && (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                activeSchedule.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800"
                  : activeSchedule.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {t(`timetable.${activeSchedule.status.toLowerCase()}`)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasCreatePerm && activeSchedule?.status === "DRAFT" && (
            <CustomButton
              variant="outline"
              onClick={() => setIsAddEntryOpen(true)}
            >
              {t("timetable.addEntry")}
            </CustomButton>
          )}
          {hasPublishPerm && activeSchedule?.status === "DRAFT" && (
            <CustomButton onClick={() => setIsPublishConfirmOpen(true)}>
              {t("timetable.publish")}
            </CustomButton>
          )}
          {hasCreatePerm && (
            <CustomButton
              variant="outline"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
            >
              Create New
            </CustomButton>
          )}
        </div>
      </div>

      {isLoadingDetail ? (
        <div>Loading entries...</div>
      ) : detailData ? (
        <TimetableWorkspace entries={detailData.entries} />
      ) : null}

      <AddTimetableEntryDialog
        isOpen={isAddEntryOpen}
        onClose={() => setIsAddEntryOpen(false)}
        onSave={(data) => addEntryMutation.mutate(data)}
        isLoading={addEntryMutation.isPending}
        subjectOfferings={subjectOfferings || []}
      />

      <ConfirmDialog
        isOpen={isPublishConfirmOpen}
        title="Publish Timetable"
        message="Are you sure you want to publish this timetable? Once published, it will be visible to students and teachers."
        confirmText="Publish"
        onConfirm={() => publishMutation.mutate(activeSchedule!.id)}
        onCancel={() => setIsPublishConfirmOpen(false)}
        isLoading={publishMutation.isPending}
      />
    </div>
  );
}
