import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Explicit red styles (not the theme's destructive token) so invalid inputs
 * are always clearly red, whatever the theme colours are.
 */
export const inputClass = (invalid?: boolean) =>
  cn(
    "h-11 rounded-xl transition-[box-shadow,border-color] duration-200",
    invalid &&
      "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/25 dark:border-red-400",
  );

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className={cn(
          "transition-colors",
          error && "text-red-600 dark:text-red-400",
        )}
      >
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="auth-error-in text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="auth-error-in rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
    >
      {message}
    </p>
  );
}

export const submitButtonClass =
  "h-11 w-full rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]";
