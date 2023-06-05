import jwtDecode, { JwtPayload } from 'jwt-decode';

/**
 * Add token type ('Bearer ') to passed token.
 */
export const extendToken = (token: string) => {
  if (token.trim().startsWith('Bearer ')) {
    return token.trim();
  }

  return `Bearer ${token}`;
};

/**
 * Remove token type ('Bearer ') from passed token.
 */
export const extractToken = (token: string) => {
  if (!token.trim().startsWith('Bearer')) {
    return token;
  }

  return token.replace('Bearer ', '').trim();
};

export const decodeToken = (token: string) => {
  const decodedToken: JwtPayload & { client_id: string } = jwtDecode(extendToken(token));
  if (!decodedToken) {
    return decodedToken;
  }

  return {
    ...decodedToken,
    isExpired: Date.now() >= (decodedToken.exp || 1) * 1000,
  };
};
