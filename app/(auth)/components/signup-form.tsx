"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";
import { Field, FormError, inputClass, submitButtonClass } from "./field";
import { PasswordInput } from "./password-input";

type ServerError = {
  field?: "email" | "password";
  message: string;
};

// Maps a better-auth error to a Persian message, and to the field it belongs to
function mapServerError(error: {
  code?: string;
  message?: string;
}): ServerError {
  if (
    error.code === "USER_ALREADY_EXISTS" ||
    error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  ) {
    return { field: "email", message: "با این ایمیل قبلاً ثبت‌نام شده است" };
  }

  if (error.code === "PASSWORD_TOO_SHORT") {
    return { field: "password", message: "رمز عبور باید حداقل ۸ کاراکتر باشد" };
  }

  if (
    error.code === "PASSWORD_HAS_PERSIAN_CHARACTERS" ||
    error.message === "PASSWORD_HAS_PERSIAN_CHARACTERS"
  ) {
    return {
      field: "password",
      message: "رمز عبور نباید شامل حروف یا اعداد فارسی باشد",
    };
  }

  return { message: "ثبت‌نام انجام نشد. دوباره تلاش کنید" };
}

export function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignUpValues) => {
    setServerError(null);

    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      // `name` is the combination; the server also stores firstName / lastName
      // in their own columns
      name: `${values.firstName} ${values.lastName}`.trim(),
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) {
      const mapped = mapServerError(error);
      if (mapped.field) {
        setError(mapped.field, { type: "server", message: mapped.message });
      } else {
        setServerError(mapped.message);
      }
      return;
    }

    // better-auth signs the user in automatically after sign up
    router.push("/");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="auth-stagger space-y-5"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="firstName" label="نام" error={errors.firstName?.message}>
          <Input
            id="firstName"
            autoComplete="given-name"
            className={inputClass(!!errors.firstName)}
            aria-invalid={!!errors.firstName}
            {...register("firstName")}
          />
        </Field>

        <Field
          id="lastName"
          label="نام خانوادگی"
          error={errors.lastName?.message}
        >
          <Input
            id="lastName"
            autoComplete="family-name"
            className={inputClass(!!errors.lastName)}
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
          />
        </Field>
      </div>

      <Field id="email" label="ایمیل" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder="name@example.com"
          className={`text-left ${inputClass(!!errors.email)}`}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>

      <Field
        id="password"
        label="رمز عبور"
        error={errors.password?.message}
        hint="حداقل ۸ کاراکتر، فقط با حروف و اعداد انگلیسی"
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          className={inputClass(!!errors.password)}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </Field>

      <div>{serverError && <FormError message={serverError} />}</div>

      <Button
        type="submit"
        className={submitButtonClass}
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        ثبت‌نام
      </Button>
    </form>
  );
}
