"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { authClient } from "@/lib/auth-client";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/services/profileApi";

export function ProfileView() {
  const { data, isPending } = authClient.useSession();

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetProfileQuery(data?.user.id ?? skipToken);

  const [updateProfile] = useUpdateProfileMutation();

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    birthday: string;
    gender: string;
  }>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthday: "",
    gender: "",
  });

  useEffect(() => {
    if (!profile) return;

    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phoneNumber,
      email: profile.email,
      birthday: profile.birthDate ? profile.birthDate : "",
      gender: profile.gender,
    });
  }, [profile, isLoading]);

  const handleSave = () => {
    try {
      updateProfile({ body: form, id: data?.user.id });

      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="h-fit lg:col-span-1">
        <CardContent className="flex flex-col items-center text-center">
          <p className="font-display text-lg font-medium text-foreground">
            {data?.user.name}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات شخصی</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>نام</Label>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>نام خانوادگی</Label>
              <Input
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>شماره تماس</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>ایمیل</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>تاریخ تولد</Label>
              <Input
                type="date"
                value={form.birthday}
                onChange={(e) =>
                  setForm((f) => ({ ...f, birthday: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>جنسیت</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">مذکر</SelectItem>
                  <SelectItem value="Female">مونث</SelectItem>

                  <SelectItem value="Prefer not to say">
                    ترجیح میدم نگم
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button size="lg" onClick={handleSave}>
            دخیره تغییرات
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-success animate-fade-in">
              <Check className="h-4 w-4" /> تغییرات ذخیره شد
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
