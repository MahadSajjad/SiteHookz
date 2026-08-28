import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import urCommon from "../locales/ur/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
      },
      ur: {
        common: urCommon,
      },
    },
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.dir = lng === "ur" ? "rtl" : "ltr";
  document.documentElement.lang = lng;
});

export default i18n;
