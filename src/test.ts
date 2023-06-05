import * as dotEnv from 'dotenv';
import { DominosClient } from './DominosClient';
import { UserCredentialsInfo, CardDetails, UserBillingInfo } from './types';
import { generateRandomString, randomInt } from '@millionscard/ts-commons';

enum Options {
  Login = '--login',
  UpdateCard = '--updateCard',
}

/* eslint-disable @typescript-eslint/no-var-requires */
async function execute(env: NodeJS.ProcessEnv, option?: string) {
  dotEnv.config();
  const opt = option || Options.UpdateCard;
  const isUpdateCard = opt === Options.UpdateCard;
  const {
    ANTI_CAPTCHA_KEY,
    EMAIL,
    PASSWORD,
    CARD_NUMBER,
    CARD_CVV,
    CARD_MONTH,
    CARD_YEAR,
    CARD_TYPE,
    POSTAL_CODE,
  } = env;

  if (
    !ANTI_CAPTCHA_KEY ||
    !EMAIL ||
    !PASSWORD ||
    !CARD_NUMBER ||
    !CARD_CVV ||
    !CARD_MONTH ||
    !CARD_YEAR ||
    !CARD_TYPE ||
    !POSTAL_CODE 
  ) {
    throw new Error('Environment variables not sufficient.');
  }

  if (!isUpdateCard) {
    throw Error('Login not supported.');
  }

  const antiCaptchaKey: string = ANTI_CAPTCHA_KEY;

  const credentials: UserCredentialsInfo = {
    email: EMAIL,
    password: PASSWORD
  };

  const card: CardDetails = {
    card_number: CARD_NUMBER,
    cvv: CARD_CVV,
    expiration_month: CARD_MONTH,
    expiration_year: CARD_YEAR,
    type: CARD_TYPE,
  };

  const user: UserBillingInfo = {    
    postal_code: POSTAL_CODE,
    external_user_id: String(randomInt(1, 10000)),
    id: generateRandomString(20)
  };

  /**
   * Instead of stringified JSON in .env, read from cookies.json & localStorage.json (git ignored) file for local testing.
   * Cookie in .json format can be exported by the extension mentioned in notion.
   * Local storage object can be copied from browser console and pasted into the json file.
   */
  let cookie;
  try {
    cookie = JSON.stringify(require('../cookies.json') as Record<string, string>[]);
  } catch (e) {
    throw Error('No cookies file provided. Add cookies.json file in root directory or src/ to be consumed here.');
  }

  const controller = new DominosClient(void 0, true);
  await controller.importCookies(cookie);
  await controller.initializeHttp();

  return controller.updateCard(credentials, card, user, antiCaptchaKey);
}

(async () => {
  try {
    console.log(await execute(process.env, process.argv[2]));
  } catch (e: any) {
    console.log('TOP LEVEL EXECUTION ERROR: ', e);
  }
})();
