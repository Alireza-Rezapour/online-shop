import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "../components/auth-layout";
import { LoginForm } from "../components/login-form";

export const metadata: Metadata = {
  title: "ورود",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="ورود به حساب کاربری"
      description="ایمیل و رمز عبور خود را وارد کنید."
      footer={
        <>
          حساب کاربری ندارید؟{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ثبت‌نام
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
