export const AUTH_INTENT_COOKIE = "auth-intent";

export type AuthIntent = "signin" | "signup";

export function setAuthIntentCookie(intent: AuthIntent) {
  document.cookie = `${AUTH_INTENT_COOKIE}=${intent};path=/;max-age=600;SameSite=Lax`;
}

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  exists: "An account with this email already exists. Please sign in instead.",
  no_account: "No account found for this email. Please create an account first.",
  oauth: "Google sign-in failed. Please try again.",
  credentials: "Incorrect email or password.",
  network: "Network error. Please check your connection and try again.",
};
