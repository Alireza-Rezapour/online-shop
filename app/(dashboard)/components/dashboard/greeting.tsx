"use client";

import { authClient } from "@/lib/auth-client";
import { useGetProfileQuery } from "@/redux/services/profileApi";

export function Greeting() {
  const { data } = authClient.useSession();

  const { data: profile, isLoading: profileLoading } = useGetProfileQuery(
    data?.user.id,
  );
  let name;

  if (profileLoading) {
    name = data?.user.name;
  } else {
    if (profile?.firstName && profile?.lastName && profile) {
      name = profile.firstName + " " + profile.lastName;
    } else {
      name = data?.user.name;
    }
  }

  return (
    <div className="mb-7">
      <h1 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
        خوش آمدی {name} 👋
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        از این قسمت میتوانید حساب کاربری و سفارش های خود را مدیریت کنید
      </p>
    </div>
  );
}
