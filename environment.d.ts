declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COOKIES: string;
      
      ANTI_CAPTCHA_KEY: string;

      EMAIL: string;
      PASSWORD: string;

      CARD_NUMBER: string;
      CARD_CVV: string;
      CARD_MONTH: string;
      CARD_YEAR: string;
      CARD_TYPE: string;

      POSTAL_CODE: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
// Ref: https://stackoverflow.com/questions/45194598/using-process-env-in-typescript
export { };
