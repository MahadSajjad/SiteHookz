import { CustomButton } from "@sitehookz/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useApiClient } from "../../../hooks/useApiClient";
import { AssessmentType } from "@sitehookz/api-client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultSubjectOfferingId?: string;
}

export function CreateAssessmentDialog({
  isOpen,
  onClose,
  onSuccess,
  defaultSubjectOfferingId,
}: Props) {
  const { t } = useTranslation();
  const api = useApiClient();

  const [title, setTitle] = useState("");
  const [subjectOfferingId, setSubjectOfferingId] = useState(
    defaultSubjectOfferingId || "",
  );
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(
    AssessmentType.QUIZ,
  );
  const [assessmentDate, setAssessmentDate] = useState("");
  const [maximumMarks, setMaximumMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [description, setDescription] = useState("");

  const { data: offerings } = useQuery({
    queryKey: ["subjectOfferings"],
    queryFn: () => api.subjectOfferings.list({ limit: 100 }),
    enabled: !defaultSubjectOfferingId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.assessments.create(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {t("assessments.create", "Create Assessment")}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({
              title,
              subjectOfferingId,
              assessmentType,
              assessmentDate,
              maximumMarks: parseFloat(maximumMarks),
              passingMarks: passingMarks ? parseFloat(passingMarks) : undefined,
              description,
            });
          }}
          className="space-y-4"
        >
          {!defaultSubjectOfferingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("academics.subjectOffering", "Subject Offering")}
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border"
                value={subjectOfferingId}
                onChange={(e) => setSubjectOfferingId(e.target.value)}
                required
              >
                <option value="">{t("common.select", "Select...")}</option>
                {offerings?.items?.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.subject?.name} - {o.section?.name || o.batch?.name || ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("common.title", "Title")}
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("common.type", "Type")}
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border"
              value={assessmentType}
              onChange={(e) =>
                setAssessmentType(e.target.value as AssessmentType)
              }
              required
            >
              {Object.values(AssessmentType).map((v) => (
                <option key={v as string} value={v as string}>
                  {t(`assessments.type.${v as string}`, v as string)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("common.date", "Date")}
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("assessments.maximumMarks", "Maximum Marks")}
            </label>
            <input
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border"
              value={maximumMarks}
              onChange={(e) => setMaximumMarks(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("assessments.passingMarks", "Passing Marks")}
            </label>
            <input
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border"
              value={passingMarks}
              onChange={(e) => setPassingMarks(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("common.description", "Description")}
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <CustomButton type="button" variant="outline" onClick={onClose}>
              {t("common.cancel", "Cancel")}
            </CustomButton>
            <CustomButton type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? t("common.saving", "Saving...")
                : t("common.save", "Save")}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
}
