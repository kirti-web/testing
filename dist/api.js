"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_DETAILS = void 0;
const constants_1 = require("./constants");
const types_1 = require("./types");
/**
 * Details of the APIs called in order.
 */
exports.API_DETAILS = Object.freeze({
    /**
     * Step 1: Used to request a login
     */
    RequestLogin: Object.freeze({
        url: 'https://www.dominos.com/graphql',
        method: types_1.HttpMethods.POST,
        getBody: (email, password, captcha) => ({
            query: constants_1.LOGIN_QUERY,
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
        responseHandler: ({ data }) => {
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
        method: types_1.HttpMethods.GET,
        responseHandler: ({ data }) => {
            return {
                data: data
            };
        },
    }),
    // /**
    //  * Step 3: Get acquire for add card
    //  */
    acquire: Object.freeze({
        url: (link) => `${link}`,
        method: types_1.HttpMethods.POST,
        getHeaders: (header) => (header),
        getBody: (card_number, expiration_month, expiration_year) => ({
            accountNumber: card_number,
            cardExpiryDate: expiration_month + expiration_year.substr(expiration_year.length - 2)
        }),
        responseHandler: ({ data }) => {
            return {
                data: data
            };
        },
    }),
    // /**
    //  * Step 4: USed to add card
    //  */
    card: Object.freeze({
        url: (customerId) => `https://order.dominos.com/power/customer/${customerId}/card/captcha`,
        method: types_1.HttpMethods.POST,
        getHeaders: (header) => (header),
        getBody: (userData, cardData, acquire, tokenizeTemplate, captcha) => ({
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
        responseHandler: ({ data }) => {
            return {
                data: data
            };
        },
    }),
});
