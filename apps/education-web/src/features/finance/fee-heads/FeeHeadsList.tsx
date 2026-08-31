import { useTranslation } from "react-i18next";

export default function FeeHeadsList() {
  const { t } = useTranslation();

  const data = [
    { id: "1", name: "Tuition Fee", description: "Monthly tuition fee", type: "RECURRING", status: "ACTIVE" },
    { id: "2", name: "Admission Fee", description: "One-time admission fee", type: "ONETIME", status: "ACTIVE" }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("finance.feeHeads", "Fee Heads")}</h1>
        <button className="bg-primary text-white px-4 py-2 rounded">{t("common.create", "Create")}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.name", "Name")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.description", "Description")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("finance.type", "Type")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.status", "Status")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
