import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "../components/auth-layout";
import { SignUpForm } from "../components/signup-form";

export const metadata: Metadata = {
  title: "ثبت‌نام",
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="ساخت حساب کاربری"
      description="برای خرید و پیگیری سفارش‌ها ثبت‌نام کنید."
      footer={
        <>
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ورود
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
