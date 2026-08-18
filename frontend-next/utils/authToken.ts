export const AUTH_TOKEN_STORAGE_KEY = "emlovy_auth_token";
export const AUTH_TOKEN_CHANGED_EVENT = "emlovy:auth-token-changed";

export const readAuthToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
};

export const writeAuthToken = (token?: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
};
