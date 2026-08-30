import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../../hooks/useApiClient";
import { CustomButton } from "@sitehookz/ui";

export default function SubjectsPage() {
  const api = useApiClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["education.subjects.list"],
    queryFn: () => api.subjects.getAll(),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <CustomButton variant="default">Add Subject</CustomButton>
      </div>

      {isLoading && <p>Loading Subjects...</p>}
      {error && <p className="text-red-500">Error loading subjects</p>}

      {!isLoading && !error && data && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-sm text-gray-600">
                  Name
                </th>
                <th className="p-4 font-semibold text-sm text-gray-600">
                  Code
                </th>
                
                <th className="p-4 font-semibold text-sm text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.map((subject: any) => (
                <tr key={subject.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{subject.name}</td>
                  <td className="p-4 text-sm">{subject.code}</td>
                  
                  <td className="p-4 text-sm">
                    <CustomButton variant="ghost" size="sm">
                      Edit
                    </CustomButton>
                  </td>
                </tr>
              ))}
              {(!data || data.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-sm text-gray-500"
                  >
                    No subjects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
