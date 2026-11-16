"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { Field, FormError, inputClass, submitButtonClass } from "./field";
import { PasswordInput } from "./password-input";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      // Same message for "no such user" and "wrong password" on purpose
      setServerError(
        error.status === 403
          ? "حساب شما مسدود شده است"
          : "ایمیل یا رمز عبور اشتباه است",
      );
      return;
    }

    router.push("/");
    router.refresh();
  };

  // A wrong email/password pair marks both inputs red
  const emailInvalid = !!errors.email || !!serverError;
  const passwordInvalid = !!errors.password || !!serverError;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="auth-stagger space-y-5"
      noValidate
    >
      <Field id="email" label="ایمیل" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder="name@example.com"
          className={cn("text-left", inputClass(emailInvalid))}
          aria-invalid={emailInvalid}
          {...register("email", { onChange: () => setServerError(null) })}
        />
      </Field>

      <Field id="password" label="رمز عبور" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          className={inputClass(passwordInvalid)}
          aria-invalid={passwordInvalid}
          {...register("password", { onChange: () => setServerError(null) })}
        />
      </Field>

      <div>{serverError && <FormError message={serverError} />}</div>

      <Button
        type="submit"
        className={submitButtonClass}
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        ورود
      </Button>
    </form>
  );
}
