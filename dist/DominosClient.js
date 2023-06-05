"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DominosClient = void 0;
const api_1 = require("./api");
const tough_cookie_1 = require("tough-cookie");
const ts_device_utils_1 = require("ts-device-utils");
const fetch_1 = __importDefault(require("@millionscard/http/fetch"));
const constants_1 = require("./constants");
class DominosClient {
    options;
    debug;
    browser;
    cookies;
    http;
    isInitialized = false;
    isHttpInitialized = false;
    constructor(options = {}, debug = false) {
        this.options = options;
        this.debug = debug;
        this.browser = options.browser || (0, ts_device_utils_1.randomBrowser)();
        this.cookies = new tough_cookie_1.CookieJar(void 0, { rejectPublicSuffixes: false });
    }
    buildException(step, error, context) {
        return { error, success: false, step, context };
    }
    debugLog(...args) {
        if (this.debug) {
            console.log(...args);
        }
    }
    /**
     * Imports the cookies.
     */
    async importCookies(cookiesStr) {
        const cookies = JSON.parse(cookiesStr);
        if (!cookies || !cookies.length) {
            return false;
        }
        this.debugLog('Importing cookies.', { length: cookies.length });
        await cookies.reduce(async (lastSetCookiePromise, cookie) => {
            await lastSetCookiePromise;
            let { domain, path } = cookie;
            domain = domain.toString().startsWith('.') ? domain.toString().slice(1) : domain;
            const currentUrl = `https://${domain}${path}`;
            const cookieObj = new tough_cookie_1.Cookie(cookie);
            return this.cookies.setCookie(cookieObj, currentUrl);
        }, Promise.resolve({}));
        this.isInitialized = true;
        this.debugLog('Cookies imported. Initializing client service.');
        return this.isInitialized;
    }
    /**
     * Initialize http
     */
    async initializeHttp() {
        if (!this.isInitialized) {
            return { success: false, message: 'Client not initialized with cookies.' };
        }
        const headers = (0, constants_1.defaultHeaders)(this.browser);
        this.isHttpInitialized = true;
        this.http = fetch_1.default.create({
            headers: headers,
            jar: this.cookies,
            proxy: this.options.proxy,
        });
        this.debugLog('Initializing HTTP service.');
    }
    /**
     * Updates card for dominos.
     * @param cardDetails
     * @param userBillingInfo
     */
    async updateCard(credentialData, cardDetails, userBillingInfo, antiCaptchaKey) {
        this.debugLog('In update card');
        if (!this.isInitialized) {
            return { success: false, message: 'Client not initialized with cookies.' };
        }
        if (!this.isHttpInitialized) {
            return { success: false, message: 'Client http not initialized.' };
        }
        const cardData = await this.addCard(credentialData, cardDetails, userBillingInfo, antiCaptchaKey);
        console.log("cardData=", cardData);
    }
    delay(ms) {
        new Promise(resolve => setTimeout(resolve, ms));
    }
    async getCaptcha(googleKey, url, antiCaptchaKey) {
        try {
            let link = `https://2captcha.com/in.php?key=${antiCaptchaKey}&method=userrecaptcha&googlekey=${googleKey}&pageurl=${url}`;
            const token1 = await this.http.get(link);
            const tokenIn = token1.data.split("|")[1];
            await this.delay(3000);
            async function tokenResponse(http_req) {
                const res = await http_req.get(`https://2captcha.com/res.php?key=${antiCaptchaKey}&action=get&id=${tokenIn}`);
                return res.data;
            }
            let tokenRes = await tokenResponse(this.http);
            while (tokenRes === "CAPCHA_NOT_READY") {
                await this.delay(2000);
                tokenRes = await tokenResponse(this.http);
            }
            return tokenRes.split("|")[1];
        }
        catch (e) {
            throw this.buildException('captcha', e);
        }
    }
    /**
     * Step 1: Login (Will remove login after getting session data)
     */
    async login(credentialData, antiCaptchaKey) {
        this.debugLog('Waiting for captcha');
        const captcha = await this.getCaptcha('6LcHcqoUAAAAAALG9ayDxyq5yuWSZ3c3pKWQnVwJ', 'https://www.dominos.com/en/pages/customer/', antiCaptchaKey);
        this.debugLog('Captcha ::', captcha);
        const api = api_1.API_DETAILS.RequestLogin;
        const body = api.getBody(credentialData.email, credentialData.password, captcha);
        this.debugLog('RequestLogin request ::', api.url);
        try {
            const res = await this.http.post(api.url, body);
            const data = api.responseHandler(res);
            return data.data.detailedLogin;
        }
        catch (e) {
            throw this.buildException('RequestLogin', e);
        }
    }
    /**
     * Step 2: Check captcha valid or not
     */
    async checkLoginResponse(credentialData, antiCaptchaKey) {
        let loginRes = await this.login(credentialData, antiCaptchaKey);
        while (loginRes === null) {
            await this.delay(1000);
            loginRes = await this.login(credentialData, antiCaptchaKey);
        }
        return loginRes;
    }
    /**
     * Step 3: add card
     */
    async addCard(credentialData, cardData, userData, antiCaptchaKey) {
        const loginData = await this.checkLoginResponse(credentialData, antiCaptchaKey);
        this.debugLog("loginData==", loginData);
        if (loginData) {
            try {
                //get tokenize token
                const tokenizeTemplateApi = api_1.API_DETAILS.TokenizeTemplate;
                this.debugLog('tokenizeTemplate request ::', tokenizeTemplateApi.url);
                const tokenizeTemplateApiRes = await this.http.get(tokenizeTemplateApi.url);
                const tokenizeTemplate = tokenizeTemplateApi.responseHandler(tokenizeTemplateApiRes);
                this.debugLog('tokenizeTemplate response ::', tokenizeTemplate.data);
                //get acquire
                const acquireApi = api_1.API_DETAILS.acquire;
                const headers = acquireApi.getHeaders(tokenizeTemplate.data.Request.Headers);
                const body = acquireApi.getBody(cardData.card_number, cardData.expiration_month, cardData.expiration_year);
                this.debugLog('acquire request ::', acquireApi.url(tokenizeTemplate.data.Request.Uri));
                const acquireRes = await this.http.post(acquireApi.url(tokenizeTemplate.data.Request.Uri), body, { headers: headers });
                const acquire = acquireApi.responseHandler(acquireRes);
                this.debugLog('acquire response ::', acquire);
                //captcha for add card
                this.debugLog('Waiting for captcha');
                const captcha = await this.getCaptcha('6LdRZqoUAAAAAJ2SsP_3UXYCtAHSSonZOW5KAGHb', 'https://www.dominos.com/en/pages/customer/', antiCaptchaKey);
                console.log("captcha card==", captcha);
                //add card
                const cardApi = api_1.API_DETAILS.card;
                const cardHeaders = cardApi.getHeaders({
                    'authorization': `Bearer ${loginData.accessToken}`,
                    'x-dpz-captcha': `${captcha}; google-recaptcha-v2-checkbox`,
                });
                const cardBody = cardApi.getBody(userData, cardData, acquire.data, tokenizeTemplate.data, captcha);
                this.debugLog('card request ::', cardApi.url(loginData.Customer.CustomerID));
                const cardRes = await this.http.post(cardApi.url(loginData.Customer.CustomerID), cardBody, { headers: cardHeaders });
                const card = cardApi.responseHandler(cardRes);
                this.debugLog('card response ::', card.data);
                return card.data;
            }
            catch (e) {
                throw this.buildException('card', e);
            }
        }
        else {
            throw this.buildException('RequestLogin', 'Login failed');
        }
    }
}
exports.DominosClient = DominosClient;
