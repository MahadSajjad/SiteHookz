import { CustomButton } from "@sitehookz/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useApiClient } from "../../../hooks/useApiClient";
import { BatchTimetablesTab } from "./BatchTimetablesTab";
import { BatchAssessmentsTab } from "./BatchAssessmentsTab";

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApiClient();
  const [activeTab, setActiveTab] = useState<
    "details" | "subjects" | "timetables" | "assessments"
  >("details");

  const { data: batch, isLoading } = useQuery({
    queryKey: ["education.batches.get", id],
    queryFn: () => api.batches.get(id as string),
    enabled: !!id,
  });

  const { data: subjectsData, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ["education.subjectOfferings.list", { batchId: id }],
    queryFn: () => api.subjectOfferings.getByBatchId(id as string),
    enabled: activeTab === "subjects" && !!id,
  });

  if (isLoading) return <div className="p-6">Loading Batch...</div>;
  if (!batch) return <div className="p-6">Batch not found.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{batch.name} Details</h1>
      </div>

      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`pb-2 px-1 ${activeTab === "details" ? "border-b-2 border-primary font-semibold text-primary" : "text-gray-500"}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === "subjects" ? "border-b-2 border-primary font-semibold text-primary" : "text-gray-500"}`}
          onClick={() => setActiveTab("subjects")}
        >
          Subjects
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === "timetables" ? "border-b-2 border-primary font-semibold text-primary" : "text-gray-500"}`}
          onClick={() => setActiveTab("timetables")}
        >
          Timetables
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === "assessments" ? "border-b-2 border-primary font-semibold text-primary" : "text-gray-500"}`}
          onClick={() => setActiveTab("assessments")}
        >
          Assessments
        </button>
      </div>

      {activeTab === "details" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <p>
            <strong>Name:</strong> {batch.name}
          </p>
          <p>
            <strong>Code:</strong> {batch.code}
          </p>
          <p>
            <strong>Capacity:</strong> {batch.capacity}
          </p>
        </div>
      )}

      {activeTab === "subjects" && (
        <div>
          <div className="flex justify-end mb-4">
            <CustomButton variant="default">Add Subject</CustomButton>
          </div>
          {isSubjectsLoading ? (
            <p>Loading subjects...</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold text-sm text-gray-600">
                      Subject Name
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600">
                      Code
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600">
                      Teacher
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjectsData?.map((offering: any) => (
                    <tr key={offering.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-sm">
                        {offering.subject?.name || "N/A"}
                      </td>
                      <td className="p-4 text-sm">
                        {offering.subject?.code || "N/A"}
                      </td>
                      <td className="p-4 text-sm">
                        {offering.teacher?.name || "Unassigned"}
                      </td>
                      <td className="p-4 text-sm">
                        <CustomButton variant="ghost" size="sm">
                          Edit
                        </CustomButton>
                      </td>
                    </tr>
                  ))}
                  {(!subjectsData || subjectsData.length === 0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-sm text-gray-500"
                      >
                        No subjects offered for this batch yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "timetables" && (
        <BatchTimetablesTab batchId={id as string} />
      )}

      {activeTab === "assessments" && (
        <BatchAssessmentsTab batchId={id as string} />
      )}
    </div>
  );
}
