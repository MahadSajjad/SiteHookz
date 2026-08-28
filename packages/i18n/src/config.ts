import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enCommon from "./locales/en/common.json";
import urCommon from "./locales/ur/common.json";

export const initI18n = () => {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { common: enCommon },
        ur: { common: urCommon },
      },
      fallbackLng: "en",
      defaultNS: "common",
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
    });
  return i18n;
};
