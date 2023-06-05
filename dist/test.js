"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotEnv = __importStar(require("dotenv"));
const DominosClient_1 = require("./DominosClient");
const ts_commons_1 = require("@millionscard/ts-commons");
var Options;
(function (Options) {
    Options["Login"] = "--login";
    Options["UpdateCard"] = "--updateCard";
})(Options || (Options = {}));
/* eslint-disable @typescript-eslint/no-var-requires */
async function execute(env, option) {
    dotEnv.config();
    const opt = option || Options.UpdateCard;
    const isUpdateCard = opt === Options.UpdateCard;
    const { ANTI_CAPTCHA_KEY, EMAIL, PASSWORD, CARD_NUMBER, CARD_CVV, CARD_MONTH, CARD_YEAR, CARD_TYPE, POSTAL_CODE, } = env;
    if (!ANTI_CAPTCHA_KEY ||
        !EMAIL ||
        !PASSWORD ||
        !CARD_NUMBER ||
        !CARD_CVV ||
        !CARD_MONTH ||
        !CARD_YEAR ||
        !CARD_TYPE ||
        !POSTAL_CODE) {
        throw new Error('Environment variables not sufficient.');
    }
    if (!isUpdateCard) {
        throw Error('Login not supported.');
    }
    const antiCaptchaKey = ANTI_CAPTCHA_KEY;
    const credentials = {
        email: EMAIL,
        password: PASSWORD
    };
    const card = {
        card_number: CARD_NUMBER,
        cvv: CARD_CVV,
        expiration_month: CARD_MONTH,
        expiration_year: CARD_YEAR,
        type: CARD_TYPE,
    };
    const user = {
        postal_code: POSTAL_CODE,
        external_user_id: String((0, ts_commons_1.randomInt)(1, 10000)),
        id: (0, ts_commons_1.generateRandomString)(20)
    };
    /**
     * Instead of stringified JSON in .env, read from cookies.json & localStorage.json (git ignored) file for local testing.
     * Cookie in .json format can be exported by the extension mentioned in notion.
     * Local storage object can be copied from browser console and pasted into the json file.
     */
    let cookie;
    try {
        cookie = JSON.stringify(require('../cookies.json'));
    }
    catch (e) {
        throw Error('No cookies file provided. Add cookies.json file in root directory or src/ to be consumed here.');
    }
    const controller = new DominosClient_1.DominosClient(void 0, true);
    await controller.importCookies(cookie);
    await controller.initializeHttp();
    return controller.updateCard(credentials, card, user, antiCaptchaKey);
}
(async () => {
    try {
        console.log(await execute(process.env, process.argv[2]));
    }
    catch (e) {
        console.log('TOP LEVEL EXECUTION ERROR: ', e);
    }
})();
