import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend) // שימוש בטעינה דינאמית
  .use(initReactI18next)
  .init({
    fallbackLng: "he",
    supportedLngs: ["he", "en"],
    backend: {
      loadPath: "/locales/{{lng}}/translation.json" // ✅ טוען את התרגום מהתקייה הנכונה
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
