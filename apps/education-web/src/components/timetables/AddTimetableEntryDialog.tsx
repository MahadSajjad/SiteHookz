import { useState } from "react";
import { CustomButton } from "@sitehookz/ui";
import { useTranslation } from "react-i18next";
import { CreateTimetableEntryDto } from "@sitehookz/education";

export type TimetableDayEnum =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface AddTimetableEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: CreateTimetableEntryDto) => void;
  isLoading?: boolean;
  subjectOfferings: any[];
}

const DAYS: TimetableDayEnum[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function AddTimetableEntryDialog({
  isOpen,
  onClose,
  onSave,
  isLoading,
  subjectOfferings,
}: AddTimetableEntryDialogProps) {
  const { t } = useTranslation("education");

  const [dayOfWeek, setDayOfWeek] = useState<TimetableDayEnum>("MONDAY");
  const [startHour, setStartHour] = useState(8);
  const [startMin, setStartMin] = useState(0);
  const [endHour, setEndHour] = useState(9);
  const [endMin, setEndMin] = useState(0);
  const [subjectOfferingId, setSubjectOfferingId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectOfferingId) {
      alert("Please select a subject.");
      return;
    }
    const startMinute = startHour * 60 + startMin;
    const endMinute = endHour * 60 + endMin;

    if (endMinute <= startMinute) {
      alert("End time must be after start time.");
      return;
    }

    onSave({
      dayOfWeek: dayOfWeek as any,
      startMinute,
      endMinute,
      subjectOfferingId,
      teachingAssignmentId: null,
      note: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4">{t("timetable.addEntry")}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              {t("timetable.day")}
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as TimetableDayEnum)}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {t(`timetable.${day.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">
                Start Time
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  className="w-full border rounded-md px-3 py-2"
                  value={startHour}
                  onChange={(e) => setStartHour(parseInt(e.target.value))}
                />
                <span className="self-center">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  className="w-full border rounded-md px-3 py-2"
                  value={startMin}
                  onChange={(e) => setStartMin(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">
                End Time
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  className="w-full border rounded-md px-3 py-2"
                  value={endHour}
                  onChange={(e) => setEndHour(parseInt(e.target.value))}
                />
                <span className="self-center">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  className="w-full border rounded-md px-3 py-2"
                  value={endMin}
                  onChange={(e) => setEndMin(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              {t("timetable.subjectOffering")}
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={subjectOfferingId}
              onChange={(e) => setSubjectOfferingId(e.target.value)}
              required
            >
              <option value="">{t("timetable.selectSubject")}</option>
              {subjectOfferings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.subject?.name || offering.id}{" "}
                  {offering.teacher ? `(${offering.teacher.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <CustomButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit" isLoading={!!isLoading}>
              Save
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
}
