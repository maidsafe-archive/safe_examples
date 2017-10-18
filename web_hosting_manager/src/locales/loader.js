import en from './en';

const loadLocale = (locale) => {
  const config = {};
  switch (locale) {
    case 'en':
      config.locale = en;
      break;
    default:
      config.en = en;
      break;
  }
  return config;
};

export default loadLocale;
