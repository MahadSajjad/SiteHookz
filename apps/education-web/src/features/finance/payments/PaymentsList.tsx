import { useTranslation } from "react-i18next";

export default function PaymentsList() {
  const { t } = useTranslation();

  const data = [
    { id: "1", receiptNo: "REC-001", studentName: "John Doe", amount: 150, date: "2026-08-30", status: "SUCCESS" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("finance.payments", "Payments")}</h1>
        <button className="bg-primary text-white px-4 py-2 rounded">{t("common.recordPayment", "Record Payment")}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("finance.receiptNo", "Receipt No")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.student", "Student")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("finance.amount", "Amount")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.date", "Date")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.status", "Status")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.receiptNo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
