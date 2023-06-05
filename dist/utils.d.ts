/**
 * Add token type ('Bearer ') to passed token.
 */
export declare const extendToken: (token: string) => string;
/**
 * Remove token type ('Bearer ') from passed token.
 */
export declare const extractToken: (token: string) => string;
export declare const decodeToken: (token: string) => {
    isExpired: boolean;
    iss?: string | undefined;
    sub?: string | undefined;
    aud?: string | string[] | undefined;
    exp?: number | undefined;
    nbf?: number | undefined;
    iat?: number | undefined;
    jti?: string | undefined;
    client_id: string;
};
