import type { Payment, Prisma } from "@/lib/generated/prisma/client";
import type { PaymentStatus } from "@/lib/generated/prisma/enums";
import type {
  CreatePaymentResult,
  VerifyPaymentResult,
} from "@/services/types";
import { Serialized } from "../serialized";

export const paymentWithOrderInclude = {
  order: true,
} satisfies Prisma.PaymentInclude;

export type PaymentDto = Serialized<Payment>;
export type PaymentWithOrderDto = Serialized<
  Prisma.PaymentGetPayload<{ include: typeof paymentWithOrderInclude }>
>;

export type GetPaymentsParams = { status?: PaymentStatus };
// What the gateway page sends
export type UpdatePaymentStatusRequest = {
  id: string;
  status: "SUCCESS" | "FAILED";
};

export type { CreatePaymentResult, VerifyPaymentResult };
