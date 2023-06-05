export declare enum HttpMethods {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    OPTIONS = "OPTIONS"
}
export type CookiePayload = Array<{
    domain: string;
    expirationDate: number;
    hostOnly: boolean;
    httpOnly: boolean;
    name: string;
    path: string;
    sameSite: string;
    secure: boolean;
    session: boolean;
    storeId: string;
    value: string;
    id: number;
}>;
export type UserCredentialsInfo = {
    email: string;
    password: string;
};
export type CardDetails = {
    card_number: string;
    /**
     * 2 digit month - 0X, 11
     */
    expiration_month: string;
    /**
     * 4 digit year - 20XX, 2026
     */
    expiration_year: string;
    cvv: string;
    /**
     * Types declared in https://www.npmjs.com/package/creditcards-types
     */
    type: string;
};
export type UserBillingInfo = {
    id: string;
    external_user_id: string;
    postal_code: string;
};
