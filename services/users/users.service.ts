import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`کاربر با شناسه ${id} یافت نشد`);
    this.name = "UserNotFoundError";
  }
}

const paginate = (page: number, pageSize: number) => ({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

const meta = (total: number, page: number, pageSize: number) => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
});

export interface AdminUserListParams {
  search?: string;
  role?: "admin" | "user";
  banned?: boolean;
  page: number;
  pageSize: number;
}

export async function listUsers(params: AdminUserListParams) {
  const { search, role, banned, page, pageSize } = params;

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(banned !== undefined ? { banned } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...paginate(page, pageSize),
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        _count: { select: { orders: { where: { status: "PAID" } } } },
      },
    }),
  ]);

  return { data: users, meta: meta(total, page, pageSize) };
}

export async function getUserOverview(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { orders: true } },
    },
  });
  if (!user) throw new UserNotFoundError(id);
  return user;
}

export async function getUserOrders(
  userId: string,
  page: number,
  pageSize: number,
) {
  const where = { userId };
  const [total, data] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...paginate(page, pageSize),
      select: {
        id: true,
        status: true,
        couponCode: true,
        discount: true,
        createdAt: true,
        totalPrice: true,
        _count: { select: { items: true } },
      },
    }),
  ]);
  return { data, meta: meta(total, page, pageSize) };
}

export async function getUserCoupons(
  userId: string,
  page: number,
  pageSize: number,
) {
  const where = { userId };
  const [total, data] = await Promise.all([
    prisma.couponUser.count({ where }),
    prisma.couponUser.findMany({
      where,
      ...paginate(page, pageSize),
      include: { coupon: true },
    }),
  ]);
  return { data, meta: meta(total, page, pageSize) };
}
