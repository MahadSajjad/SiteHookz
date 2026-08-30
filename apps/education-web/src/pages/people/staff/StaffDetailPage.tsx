import { CustomButton } from "@sitehookz/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useApiClient } from "../../../hooks/useApiClient";

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApiClient();
  const [activeTab, setActiveTab] = useState<"details" | "assignments">(
    "details",
  );

  const { data: staff, isLoading } = useQuery({
    queryKey: ["education.staff.get", id],
    queryFn: () => api.staff.get(id as string),
    enabled: !!id,
  });

  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useQuery({
    queryKey: ["education.teachingAssignments.list", { staffId: id }],
    queryFn: () => api.teachingAssignments.getByStaffMemberId(id as string),
    enabled: activeTab === "assignments" && !!id,
  });

  if (isLoading) return <div className="p-6">Loading Staff...</div>;
  if (!staff) return <div className="p-6">Staff not found.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{staff.name} Details</h1>
      </div>

      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`pb-2 px-1 ${activeTab === "details" ? "border-b-2 border-primary font-semibold text-primary" : "text-gray-500"}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === "assignments" ? "border-b-2 border-primary font-semibold text-primary" : "text-gray-500"}`}
          onClick={() => setActiveTab("assignments")}
        >
          Teaching Assignments
        </button>
      </div>

      {activeTab === "details" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <p>
            <strong>Name:</strong> {staff.name}
          </p>
          <p>
            <strong>Email:</strong> {staff.email}
          </p>
          <p>
            <strong>Role:</strong> {staff.role}
          </p>
        </div>
      )}

      {activeTab === "assignments" && (
        <div>
          <div className="flex justify-end mb-4">
            <CustomButton variant="default">Assign Subject</CustomButton>
          </div>
          {isAssignmentsLoading ? (
            <p>Loading assignments...</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold text-sm text-gray-600">
                      Subject
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600">
                      Section/Batch
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600">
                      Status
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentsData?.map((assignment: any) => (
                    <tr
                      key={assignment.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 text-sm">
                        {assignment.subjectOffering?.subject?.name || "N/A"}
                      </td>
                      <td className="p-4 text-sm">
                        {assignment.subjectOffering?.section?.name ||
                          assignment.subjectOffering?.batch?.name ||
                          "N/A"}
                      </td>
                      <td className="p-4 text-sm">
                        {assignment.status || "Active"}
                      </td>
                      <td className="p-4 text-sm">
                        <CustomButton variant="ghost" size="sm">
                          Edit
                        </CustomButton>
                      </td>
                    </tr>
                  ))}
                  {(!assignmentsData || assignmentsData.length === 0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-sm text-gray-500"
                      >
                        No teaching assignments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
