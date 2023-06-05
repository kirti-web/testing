import { Response } from '@millionscard/http/fetch';
import { LOGIN_QUERY } from './constants';
import { CardDetails, UserBillingInfo, HttpMethods } from './types';

/**
 * Details of the APIs called in order.
 */
export const API_DETAILS = Object.freeze({

  /**
   * Step 1: Used to request a login
   */
  RequestLogin: Object.freeze({
    url: 'https://www.dominos.com/graphql',
    method: HttpMethods.POST,
    getBody: (email: string, password: string, captcha: any) => ({
      query: LOGIN_QUERY,
      variables: {
        input: {
          password: password,
          rememberMe: true,
          username: email,
          v3: {
            action: "submit",
            token: captcha
          },
          auth: {
            usesAuthProxy: true
          }
        }
      }
    }),
    responseHandler: ({ data }: Response) => {
      return {
        data: data.data
      };
    },
  }),

  // /**
  //  * Step 2: Get tokenize template for add card
  //  */
  TokenizeTemplate: Object.freeze({
    url: 'https://order.dominos.com/power/paymentGatewayService/tokenizeTemplate',
    method: HttpMethods.GET,
    responseHandler: ({ data }: Response) => {
      return {
        data: data
      };
    },
  }),

  // /**
  //  * Step 3: Get acquire for add card
  //  */
  acquire: Object.freeze({
    url: (link: string) => `${link}`,
    method: HttpMethods.POST,
    getHeaders: (header: any) => (header),
    getBody: (card_number: string, expiration_month: string, expiration_year: any) => ({
      accountNumber: card_number,
      cardExpiryDate: expiration_month + expiration_year.substr(expiration_year.length - 2)
    }),
    responseHandler: ({ data }: Response) => {
      return { 
        data: data 
      };
    },
  }),

  // /**
  //  * Step 4: USed to add card
  //  */
  card: Object.freeze({
    url: (customerId: string) => `https://order.dominos.com/power/customer/${customerId}/card/captcha`,
    method: HttpMethods.POST,
    getHeaders: (header: any) => (header),
    getBody: (userData: UserBillingInfo, cardData: CardDetails, acquire: any, tokenizeTemplate: any, captcha: any) => ({
      billingZip: userData.postal_code,
      captcha: captcha,
      cardType: cardData.type.toUpperCase(),
      expirationMonth: cardData.expiration_month,
      expirationYear: cardData.expiration_year,
      isDefault: true,
      nickName: cardData.type + '-' + Math.floor(Math.random() * 101),
      number: cardData.card_number.substr(cardData.card_number.length - 4),
      securityCode: cardData.cvv,
      token: acquire.TOKEN_ID,
      tokenType: tokenizeTemplate.TokenType
    }),
    responseHandler: ({ data }: Response) => {
      return {
        data: data
      };
    },
  }),
});
