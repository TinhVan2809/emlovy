export const AUTH_TOKEN_CHANGED_EVENT = "emlovy:auth-token-changed";
export const AUTH_SESSION_COOKIE = "emlovy_session";
const AUTH_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const syncAuthSessionCookie = (isAuthenticated: boolean) => {
  if (typeof document === "undefined") {
    return;
  }

  if (isAuthenticated) {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AUTH_SESSION_COOKIE}=1; Path=/; Max-Age=${AUTH_SESSION_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  } else {
    document.cookie = `${AUTH_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
};

export const hasAuthSession = () => {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie.split("; ").some((cookie) =>
    cookie.startsWith(`${AUTH_SESSION_COOKIE}=`),
  );
};

export const syncAuthSession = (isAuthenticated: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  if (isAuthenticated) {
    syncAuthSessionCookie(true);
  } else {
    syncAuthSessionCookie(false);
  }

  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
};
