"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AUTH_ERROR_MESSAGES, setAuthIntentCookie } from "@/lib/auth/intent";
import { isValidEmail, normalizeEmail, validateName, validatePassword } from "@/lib/auth/validation";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const errorCode = searchParams.get("error");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorCode ? (AUTH_ERROR_MESSAGES[errorCode] ?? null) : null,
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

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    const nameError = validateName(name || normalized.split("@")[0]);
    if (nameError) {
      setError(nameError);
      return;
    }

    setLoading(true);

    try {
      const check = await fetch(`/api/auth/check-email?email=${encodeURIComponent(normalized)}`);
      const checkJson = (await check.json()) as { exists?: boolean };

      if (checkJson.exists) {
        setLoading(false);
        setError("An account with this email already exists. Please sign in instead.");
        return;
      }

      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalized,
          password,
          name: name || normalized.split("@")[0],
        }),
      });

      const registerJson = (await registerRes.json()) as { error?: string };

      if (!registerRes.ok) {
        setLoading(false);
        setError(registerJson.error ?? AUTH_ERROR_MESSAGES.network);
        return;
      }

      const result = await signIn("credentials", {
        email: normalized,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setLoading(false);
      setError(AUTH_ERROR_MESSAGES.network);
    }
  }

  function onGoogleSignUp() {
    setAuthIntentCookie("signup");
    void signIn("google", { callbackUrl });
  }

  return (
    <div className="space-y-6">
      {error ? <AuthAlert message={error} /> : null}

      <GoogleButton label="Sign up with Google" onClick={onGoogleSignUp} disabled={loading} />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onEmailSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="signup-name"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Name
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={loading}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Email
          </label>
          <input
            id="signup-email"
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
            htmlFor="signup-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
            minLength={8}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
          <p className="mt-1.5 text-xs text-muted">At least 8 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-zinc-950"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={`/sign-in${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-semibold text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
