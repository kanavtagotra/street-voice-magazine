type AuthAlertProps = {
  message: string;
  variant?: "error" | "info";
};

export function AuthAlert({ message, variant = "error" }: AuthAlertProps) {
  const styles =
    variant === "error"
      ? "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
      : "border-border bg-card-muted text-muted";

  return (
    <p className={`rounded-xl border px-4 py-3 text-sm ${styles}`} role="alert">
      {message}
    </p>
  );
}
