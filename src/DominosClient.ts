import { API_DETAILS } from './api';
import { CookieJar, Cookie } from 'tough-cookie';
import { ProxyOptions } from '@millionscard/http';
import { Browser, randomBrowser } from 'ts-device-utils';
import httpClient, { Fetch } from '@millionscard/http/fetch';
import type { CardDetails, CookiePayload, UserBillingInfo, UserCredentialsInfo } from './types';
import { defaultHeaders } from './constants';

export class DominosClient {
  private browser: Browser;
  private cookies: CookieJar;
  private http: Fetch;
  private isInitialized = false;
  private isHttpInitialized = false;

  constructor(
    private readonly options: {
      browser?: Browser;
      proxy?: ProxyOptions;
    } = {},
    private readonly debug = false,
  ) {
    this.browser = options.browser || randomBrowser();
    this.cookies = new CookieJar(void 0, { rejectPublicSuffixes: false });
  }

  private buildException(step: string, error: any, context?: Record<string, any>) {
    return { error, success: false, step, context };
  }

  private debugLog(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  /**
   * Imports the cookies.
   */
  public async importCookies(cookiesStr: string) {
    const cookies: CookiePayload = JSON.parse(cookiesStr);
    if (!cookies || !cookies.length) {
      return false;
    }

    this.debugLog('Importing cookies.', { length: cookies.length });
    await cookies.reduce(async (lastSetCookiePromise, cookie) => {
      await lastSetCookiePromise;

      let { domain, path } = cookie;
      domain = domain.toString().startsWith('.') ? domain.toString().slice(1) : domain;

      const currentUrl = `https://${domain}${path}`;
      const cookieObj = new Cookie(cookie);

      return this.cookies.setCookie(cookieObj, currentUrl);
    }, Promise.resolve({} as Cookie));

    this.isInitialized = true;
    this.debugLog('Cookies imported. Initializing client service.');
    return this.isInitialized;
  }


  /**
   * Initialize http
   */
  public async initializeHttp() {
    if (!this.isInitialized) {
      return { success: false, message: 'Client not initialized with cookies.' };
    }

    const headers: any = defaultHeaders(this.browser);

    this.isHttpInitialized = true;
    this.http = httpClient.create({
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
  public async updateCard(credentialData: UserCredentialsInfo, cardDetails: CardDetails, userBillingInfo: UserBillingInfo, antiCaptchaKey: string) {
    this.debugLog('In update card');

    if (!this.isInitialized) {
      return { success: false, message: 'Client not initialized with cookies.' };
    }

    if (!this.isHttpInitialized) {
      return { success: false, message: 'Client http not initialized.' };
    }

    const cardData = await this.addCard(credentialData, cardDetails, userBillingInfo, antiCaptchaKey)
    console.log("cardData=",cardData);
    
  }

  private delay(ms: number) {
    new Promise(resolve => setTimeout(resolve, ms))
  }

  private async getCaptcha(googleKey: any, url: any, antiCaptchaKey: string) {
    try {
      let link = `https://2captcha.com/in.php?key=${antiCaptchaKey}&method=userrecaptcha&googlekey=${googleKey}&pageurl=${url}`
      const token1 = await this.http.get(link)
      const tokenIn = token1.data.split("|")[1];
      await this.delay(3000)
      async function tokenResponse(http_req: any) {
        const res = await http_req.get(`https://2captcha.com/res.php?key=${antiCaptchaKey}&action=get&id=${tokenIn}`)
        return res.data;
      }
      let tokenRes = await tokenResponse(this.http);

      while (tokenRes === "CAPCHA_NOT_READY") {
        await this.delay(2000)
        tokenRes = await tokenResponse(this.http);
      }
      return tokenRes.split("|")[1];
    } catch (e) {
      throw this.buildException('captcha', e);
    }
  }

  /**
   * Step 1: Login (Will remove login after getting session data)
   */
  private async login(credentialData: UserCredentialsInfo, antiCaptchaKey: string) {
    this.debugLog('Waiting for captcha');
    const captcha = await this.getCaptcha('6LcHcqoUAAAAAALG9ayDxyq5yuWSZ3c3pKWQnVwJ', 'https://www.dominos.com/en/pages/customer/', antiCaptchaKey);
    this.debugLog('Captcha ::', captcha);

    const api = API_DETAILS.RequestLogin;
    const body = api.getBody(credentialData.email, credentialData.password, captcha);
    this.debugLog('RequestLogin request ::', api.url);

    try {
      const res = await this.http.post(api.url, body)
      const data = api.responseHandler(res);
      return data.data.detailedLogin;
    } catch (e) {
      throw this.buildException('RequestLogin', e);
    }
  }

  /**
   * Step 2: Check captcha valid or not
   */
  private async checkLoginResponse(credentialData: UserCredentialsInfo, antiCaptchaKey: string) {
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
  private async addCard(credentialData: UserCredentialsInfo, cardData: CardDetails, userData: UserBillingInfo, antiCaptchaKey: string) {

    const loginData = await this.checkLoginResponse(credentialData, antiCaptchaKey);
    this.debugLog("loginData==", loginData)

    if (loginData) {
      try {
        //get tokenize token
        const tokenizeTemplateApi = API_DETAILS.TokenizeTemplate;
        this.debugLog('tokenizeTemplate request ::', tokenizeTemplateApi.url);
        const tokenizeTemplateApiRes = await this.http.get(tokenizeTemplateApi.url);
        const tokenizeTemplate = tokenizeTemplateApi.responseHandler(tokenizeTemplateApiRes);
        this.debugLog('tokenizeTemplate response ::', tokenizeTemplate.data);

        //get acquire
        const acquireApi = API_DETAILS.acquire;
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
        const cardApi = API_DETAILS.card;
        const cardHeaders = cardApi.getHeaders({
          'authorization': `Bearer ${loginData.accessToken}`,
          'x-dpz-captcha': `${captcha}; google-recaptcha-v2-checkbox`,
        });
        const cardBody = cardApi.getBody(userData, cardData, acquire.data, tokenizeTemplate.data, captcha);
        this.debugLog('card request ::', cardApi.url(loginData.Customer.CustomerID));
        const cardRes = await this.http.post(cardApi.url(loginData.Customer.CustomerID), cardBody, { headers: cardHeaders })
        const card = cardApi.responseHandler(cardRes);
        this.debugLog('card response ::', card.data);
        return card.data;
      } catch (e) {
        throw this.buildException('card', e);
      }
    } else {
      throw this.buildException('RequestLogin', 'Login failed');
    }
  }
}
