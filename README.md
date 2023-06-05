# Dominos Reverse Engineering

## Introduction
This is a library to interact with Domino's API programmatically in TypeScript so that we can perform actions mentioned in the Features section below.

</br>

## Merchant Information:
- https://www.dominos.com/
- Implemented against page:
  - Update card page: https://www.dominos.com/en/pages/customer/#!/customer/settings/

</br>

## Features
- Update Card

</br>

## Usage example
```typescript
  const credentials = {
    email: process.env.EMAIL,
    password: process.env.PASSWORD
  }
  const user = {
    postal_code: process.env.POSTAL_CODE
  };
  const card = {
    card_number: process.env.CARD_NUMBER,
    expiration_month: process.env.CARD_MONTH,
    expiration_year: process.env.CARD_YEAR,
    cvv: process.env.CARD_CVV,
    type: process.env.CARD_TYPE
  };
  const antiCaptchaKey = process.env.ANTI_CAPTCHA_KEY

  const client = new DominosClient(void 0, true);
  await client.importCookies(cookie);
  await client.initializeHttp();
  controller.updateCard(credentials, card, user, antiCaptchaKey);
```

</br>

## Running locally
- Make sure you have `NodeJS v16.x` on your system.
- Run `npm install` to install dependencies.
- See `.env.example` for required environment variables and their expected formats
- While running locally, `src/test.ts` file is the entry point to the script.
- For cookies in correct format, you can export the cookies from the site by using [this extension](https://chrome.google.com/webstore/detail/%E3%82%AF%E3%83%83%E3%82%AD%E3%83%BCjson%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%87%BA%E5%8A%9B-for-puppet/nmckokihipjgplolmcmjakknndddifde?hl=en)
- It's tricky to stringify the cookies and stringified cookies might not work properly. So, instead of passing cookies via `.env` variable, you can keep a `cookies.json` file in the root of the repo which is read and passed to `importCookies` function while testing locally. [See reference.](https://github.com/millionscard/ts-dominos/blob/main/src/test.ts#L81)
- To test update card flow locally, execute `npm run test:updateCard`
- See `scripts` section in `package.json` for more supported commands.

</br>
# testing
