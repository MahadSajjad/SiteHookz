import { useTranslation } from "react-i18next";
import { TimetableEntry } from "@sitehookz/education";
import { useMemo } from "react";

export type TimetableDayEnum =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface TimetableWorkspaceProps {
  entries: TimetableEntry[];
}

const DAYS_IN_ORDER: TimetableDayEnum[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const MIN_PER_HOUR = 60;
const START_HOUR = 7; // 7 AM
const END_HOUR = 19; // 7 PM

export function TimetableWorkspace({ entries }: TimetableWorkspaceProps) {
  const { t } = useTranslation("education");

  const entriesByDay = useMemo(() => {
    const map = new Map<TimetableDayEnum, TimetableEntry[]>();
    DAYS_IN_ORDER.forEach((day) => map.set(day, []));
    entries.forEach((entry) => {
      const day = entry.dayOfWeek as TimetableDayEnum;
      if (map.has(day)) {
        map.get(day)!.push(entry);
      }
    });
    return map;
  }, [entries]);

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile view: Stacked cards by day */}
      <div className="flex flex-col gap-6 md:hidden">
        {DAYS_IN_ORDER.map((day) => {
          const dayEntries = entriesByDay.get(day) || [];
          if (dayEntries.length === 0) return null;
          return (
            <div key={day} className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">
                {t(`timetable.${day.toLowerCase()}`)}
              </h3>
              {dayEntries
                .sort((a, b) => a.startMinute - b.startMinute)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 border rounded-md shadow-sm bg-white flex flex-col gap-1"
                  >
                    <div className="font-medium">
                      {formatTime(entry.startMinute)} -{" "}
                      {formatTime(entry.endMinute)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Subj: {entry.subjectOfferingId.substring(0, 8)}
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            {t("timetable.emptyState")}
          </div>
        )}
      </div>

      {/* Desktop view: Week Grid */}
      <div className="hidden md:block overflow-x-auto">
        <div
          className="grid border-t border-l"
          style={{
            gridTemplateColumns: `auto repeat(${DAYS_IN_ORDER.length}, minmax(150px, 1fr))`,
          }}
        >
          {/* Header Row */}
          <div className="border-r border-b p-2 bg-gray-50"></div>
          {DAYS_IN_ORDER.map((day) => (
            <div
              key={day}
              className="border-r border-b p-2 text-center font-semibold bg-gray-50"
            >
              {t(`timetable.${day.toLowerCase()}`)}
            </div>
          ))}

          {/* Time Slots */}
          {hours.map((hour) => (
            <div key={hour} className="contents relative">
              <div className="border-r border-b p-2 text-right text-sm text-gray-500 bg-white">
                {formatTime(hour * MIN_PER_HOUR)}
              </div>
              {DAYS_IN_ORDER.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  className="border-r border-b relative h-16 bg-white"
                >
                  {(entriesByDay.get(day) || [])
                    .filter((e) => Math.floor(e.startMinute / 60) === hour)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="absolute w-[calc(100%-8px)] mx-1 bg-blue-100 text-blue-800 p-1 text-xs rounded border border-blue-200 overflow-hidden"
                        style={{
                          top: `${((entry.startMinute % 60) / 60) * 100}%`,
                          height: `${((entry.endMinute - entry.startMinute) / 60) * 100}%`,
                          minHeight: "24px",
                          zIndex: 10,
                        }}
                      >
                        <div className="font-semibold">
                          {formatTime(entry.startMinute)} -{" "}
                          {formatTime(entry.endMinute)}
                        </div>
                        <div className="truncate">
                          Subj: {entry.subjectOfferingId.substring(0, 8)}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedH = h % 12 === 0 ? 12 : h % 12;
  const formattedM = m.toString().padStart(2, "0");
  return `${formattedH}:${formattedM} ${ampm}`;
}
