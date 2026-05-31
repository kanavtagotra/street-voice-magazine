"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AUTH_ERROR_MESSAGES, setAuthIntentCookie } from "@/lib/auth/intent";
import { isValidEmail, normalizeEmail } from "@/lib/auth/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const errorCode = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorCode ? (AUTH_ERROR_MESSAGES[errorCode] ?? AUTH_ERROR_MESSAGES.credentials) : null,
  );
  const [loading, setLoading] = useState(false);

  async function onEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const check = await fetch(`/api/auth/check-email?email=${encodeURIComponent(normalized)}`);
      const checkJson = (await check.json()) as { exists?: boolean };

      if (!checkJson.exists) {
        setLoading(false);
        setError("No account found for this email. Please create an account first.");
        return;
      }

      const result = await signIn("credentials", {
        email: normalized,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Incorrect email or password.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setLoading(false);
      setError(AUTH_ERROR_MESSAGES.network);
    }
  }

  function onGoogleSignIn() {
    setAuthIntentCookie("signin");
    void signIn("google", { callbackUrl });
  }

  return (
    <div className="space-y-6">
      {error ? <AuthAlert message={error} /> : null}

      <GoogleButton label="Continue with Google" onClick={onGoogleSignIn} disabled={loading} />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onEmailSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="signin-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loading}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
        </div>

        <div>
          <label
            htmlFor="signin-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-zinc-950"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link
          href={`/sign-up${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-semibold text-foreground hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
