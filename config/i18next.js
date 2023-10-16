const i18next = require("i18next");

const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;

i18next.init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: require("../locales/en/translation.json"),
    },
    fa: {
      translation: require("../locales/fa/translation.json"),
    },
  },
});

module.exports = (lng) => i18next.getFixedT(lng || systemLocale);
