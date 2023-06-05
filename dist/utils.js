"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.extractToken = exports.extendToken = void 0;
const jwt_decode_1 = __importDefault(require("jwt-decode"));
/**
 * Add token type ('Bearer ') to passed token.
 */
const extendToken = (token) => {
    if (token.trim().startsWith('Bearer ')) {
        return token.trim();
    }
    return `Bearer ${token}`;
};
exports.extendToken = extendToken;
/**
 * Remove token type ('Bearer ') from passed token.
 */
const extractToken = (token) => {
    if (!token.trim().startsWith('Bearer')) {
        return token;
    }
    return token.replace('Bearer ', '').trim();
};
exports.extractToken = extractToken;
const decodeToken = (token) => {
    const decodedToken = (0, jwt_decode_1.default)((0, exports.extendToken)(token));
    if (!decodedToken) {
        return decodedToken;
    }
    return {
        ...decodedToken,
        isExpired: Date.now() >= (decodedToken.exp || 1) * 1000,
    };
};
exports.decodeToken = decodeToken;
