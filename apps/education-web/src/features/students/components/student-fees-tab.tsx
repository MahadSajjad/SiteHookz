import { useTranslation } from "react-i18next";

export default function StudentFeesTab({ studentId }: { studentId?: string }) {
  const { t } = useTranslation();
  // Using studentId implicitly or just keeping it available for future API calls
  console.log("Loading fees for student", studentId);

  const totalCharges = 500;
  const totalPaid = 350;
  const totalOutstanding = 150;

  const charges = [
    { id: "1", description: "Tuition Fee - Aug", amount: 150, status: "UNPAID", date: "2026-08-01" },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("finance.financialSummary", "Financial Summary")}</h2>
        <div className="space-x-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded">{t("finance.assignFeePlan", "Assign Fee Plan")}</button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded">{t("finance.generateFee", "Generate Monthly Fee")}</button>
          <button className="bg-primary text-white px-4 py-2 rounded">{t("common.recordPayment", "Record Payment")}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">{t("finance.totalCharges", "Total Charges")}</p>
          <p className="text-2xl font-bold">${totalCharges}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">{t("finance.totalPaid", "Total Paid")}</p>
          <p className="text-2xl font-bold text-green-700">${totalPaid}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">{t("finance.totalOutstanding", "Total Outstanding")}</p>
          <p className="text-2xl font-bold text-red-700">${totalOutstanding}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">{t("finance.charges", "Charges")}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.description", "Description")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.date", "Date")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("finance.amount", "Amount")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.status", "Status")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charges.map((charge) => (
                <tr key={charge.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{charge.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{charge.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${charge.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {charge.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
