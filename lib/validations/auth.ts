import { z } from "zod";

// Persian + Arabic letters and digits (U+0600–U+06FF), Arabic supplement,
// and Arabic presentation forms.
const PERSIAN_CHARACTERS =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const hasPersianCharacters = (value: string) =>
  PERSIAN_CHARACTERS.test(value);

const passwordSchema = z
  .string()
  .min(1, "رمز عبور را وارد کنید")
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .refine((value) => !hasPersianCharacters(value), {
    message: "رمز عبور نباید شامل حروف یا اعداد فارسی باشد",
  });

const emailSchema = z
  .string()
  .trim()
  .min(1, "ایمیل را وارد کنید")
  .email("ایمیل واردشده معتبر نیست");

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "نام را وارد کنید"),
  lastName: z.string().trim().min(1, "نام خانوادگی را وارد کنید"),
  email: emailSchema,
  password: passwordSchema,
});

// Login only checks that fields are filled: rules like "no Persian characters"
// belong to sign up, and an old account must never be blocked by them.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
