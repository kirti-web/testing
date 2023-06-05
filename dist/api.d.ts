import { Response } from '@millionscard/http/fetch';
import { CardDetails, UserBillingInfo, HttpMethods } from './types';
/**
 * Details of the APIs called in order.
 */
export declare const API_DETAILS: Readonly<{
    /**
     * Step 1: Used to request a login
     */
    RequestLogin: Readonly<{
        url: "https://www.dominos.com/graphql";
        method: HttpMethods.POST;
        getBody: (email: string, password: string, captcha: any) => {
            query: string;
            variables: {
                input: {
                    password: string;
                    rememberMe: boolean;
                    username: string;
                    v3: {
                        action: string;
                        token: any;
                    };
                    auth: {
                        usesAuthProxy: boolean;
                    };
                };
            };
        };
        responseHandler: ({ data }: Response) => {
            data: any;
        };
    }>;
    TokenizeTemplate: Readonly<{
        url: "https://order.dominos.com/power/paymentGatewayService/tokenizeTemplate";
        method: HttpMethods.GET;
        responseHandler: ({ data }: Response) => {
            data: any;
        };
    }>;
    acquire: Readonly<{
        url: (link: string) => string;
        method: HttpMethods.POST;
        getHeaders: (header: any) => any;
        getBody: (card_number: string, expiration_month: string, expiration_year: any) => {
            accountNumber: string;
            cardExpiryDate: string;
        };
        responseHandler: ({ data }: Response) => {
            data: any;
        };
    }>;
    card: Readonly<{
        url: (customerId: string) => string;
        method: HttpMethods.POST;
        getHeaders: (header: any) => any;
        getBody: (userData: UserBillingInfo, cardData: CardDetails, acquire: any, tokenizeTemplate: any, captcha: any) => {
            billingZip: string;
            captcha: any;
            cardType: string;
            expirationMonth: string;
            expirationYear: string;
            isDefault: boolean;
            nickName: string;
            number: string;
            securityCode: string;
            token: any;
            tokenType: any;
        };
        responseHandler: ({ data }: Response) => {
            data: any;
        };
    }>;
}>;
