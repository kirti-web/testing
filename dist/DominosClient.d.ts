import { ProxyOptions } from '@millionscard/http';
import { Browser } from 'ts-device-utils';
import type { CardDetails, UserBillingInfo, UserCredentialsInfo } from './types';
export declare class DominosClient {
    private readonly options;
    private readonly debug;
    private browser;
    private cookies;
    private http;
    private isInitialized;
    private isHttpInitialized;
    constructor(options?: {
        browser?: Browser;
        proxy?: ProxyOptions;
    }, debug?: boolean);
    private buildException;
    private debugLog;
    /**
     * Imports the cookies.
     */
    importCookies(cookiesStr: string): Promise<boolean>;
    /**
     * Initialize http
     */
    initializeHttp(): Promise<{
        success: boolean;
        message: string;
    } | undefined>;
    /**
     * Updates card for dominos.
     * @param cardDetails
     * @param userBillingInfo
     */
    updateCard(credentialData: UserCredentialsInfo, cardDetails: CardDetails, userBillingInfo: UserBillingInfo, antiCaptchaKey: string): Promise<{
        success: boolean;
        message: string;
    } | undefined>;
    private delay;
    private getCaptcha;
    /**
     * Step 1: Login (Will remove login after getting session data)
     */
    private login;
    /**
     * Step 2: Check captcha valid or not
     */
    private checkLoginResponse;
    /**
     * Step 3: add card
     */
    private addCard;
}
