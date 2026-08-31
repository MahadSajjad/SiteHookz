import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function FeePlanForm() {
  const { t } = useTranslation();
  const [type, setType] = useState("SCHOOL");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("common.create", "Create")} {t("finance.feePlans", "Fee Plans")}</h1>
      
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("finance.type", "Type")}</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="SCHOOL">School</option>
            <option value="TUITION">Tuition</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t("common.name", "Name")}</label>
          <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
        </div>

        {type === "SCHOOL" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("academics.classLevel", "Class Level")}</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
              <option>Grade 1</option>
              <option>Grade 2</option>
            </select>
          </div>
        )}

        {type === "TUITION" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("academics.batch", "Batch")}</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
              <option>Morning Batch</option>
              <option>Evening Batch</option>
            </select>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mt-6">{t("finance.feeHeads", "Fee Heads")}</h3>
          <div className="mt-2 flex space-x-2">
            <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
              <option>Tuition Fee</option>
              <option>Admission Fee</option>
            </select>
            <input type="number" placeholder={t("finance.amount", "Amount")} className="block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
              {t("common.add", "Add")}
            </button>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {t("common.cancel", "Cancel")}
            </button>
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {t("common.save", "Save")}
            </button>
            <button type="button" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              {t("common.activate", "Activate")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
