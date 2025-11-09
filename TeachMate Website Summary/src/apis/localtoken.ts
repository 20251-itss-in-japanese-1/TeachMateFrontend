

const tokenKey = 'token';
export const getTokenFromLocalStorage = () => {
    const encryptedToken = localStorage.getItem(tokenKey);
    if (!encryptedToken)return null;
    return encryptedToken;
};

export const saveTokenToLocalStorage = (token: string) => {
  localStorage.setItem(tokenKey, token);
};

export const removeTokenFromLocalStorage = () => {
  localStorage.removeItem(tokenKey);
};