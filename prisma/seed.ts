/**
 * Seed script for the clothing shop demo.
 *
 *   npx prisma db seed
 *
 * WARNING: this WIPES every table it fills (users, products, orders, ...)
 * and rebuilds everything from scratch. It is meant for a demo database.
 * Re-running it always gives the same catalog (random parts use a fixed seed).
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../lib/generated/prisma/client";
import type {
  CouponType,
  HeroContentPosition,
  HeroCtaType,
  HeroTextTone,
  OrderStatus,
  ReviewStatus,
} from "../lib/generated/prisma/client";
import {
  ADMIN_USER,
  CUSTOMER_PASSWORD,
  adminReplies,
  attributes,
  carriers,
  collections,
  colors,
  coupons,
  customers,
  flattenCategories,
  heroSlides,
  looks,
  places,
  products,
  reviewPool,
  sizeCharts,
  type AttributeKey,
  type ProductSeed,
} from "./seed-data/catalog";
import { loadManifest, productImageLogical } from "./seed-data/images";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ───────────────────────── helpers ─────────────────────────
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261112);
const int = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));
const chance = (p: number) => rand() < p;
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function weightedPick<T extends { weight: number }>(arr: readonly T[]): T {
  let r = rand() * arr.reduce((s, x) => s + x.weight, 0);
  for (const x of arr) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return arr[arr.length - 1];
}
const digits = (n: number) =>
  Array.from({ length: n }, () => int(0, 9)).join("");
const hex = (n: number) =>
  Array.from({ length: n }, () => int(0, 15).toString(16)).join("");

const DAY = 86_400_000;
const NOW = Date.now();
const cap = (d: Date) => new Date(Math.min(d.getTime(), NOW));
const addMinutes = (d: Date, m: number) =>
  cap(new Date(d.getTime() + m * 60_000));
const addDays = (d: Date, n: number) => cap(new Date(d.getTime() + n * DAY));
function daysAgo(days: number): Date {
  const d = new Date(NOW - days * DAY);
  d.setHours(int(9, 21), int(0, 59), int(0, 59), 0);
  return d.getTime() > NOW ? new Date(NOW - int(5, 120) * 60_000) : d;
}

// ───────────────────────── images ─────────────────────────
const manifest = loadManifest();
const refCount = new Map<string, number>();
const missingImages: string[] = [];

/** Returns the storage key for a logical image and counts one reference to it. */
function img(logical: string): string | null {
  const entry = manifest[logical];
  if (!entry) {
    missingImages.push(logical);
    return null;
  }
  refCount.set(entry.key, (refCount.get(entry.key) ?? 0) + 1);
  return entry.key;
}

// ───────────────────────── build data in memory ─────────────────────────
async function build() {
  // ----- colors, size charts, sizes
  const colorRows = colors.map((c) => ({
    id: `color-${c.code}`,
    name: c.name,
    hex: c.hex,
    code: c.code,
  }));
  const colorByCode = new Map(colors.map((c) => [c.code as string, c]));

  const sizeChartRows = sizeCharts.map((c) => ({
    id: `chart-${c.key}`,
    name: c.name,
  }));
  const sizeRows = sizeCharts.flatMap((c) =>
    c.sizes.map(([name, code], i) => ({
      id: `size-${c.key}-${code}`,
      sizeChartId: `chart-${c.key}`,
      name,
      sortOrder: i,
    })),
  );
  const sizesByChart = new Map<
    string,
    Array<{ id: string; name: string; code: string }>
  >(
    sizeCharts.map((c) => [
      c.key,
      c.sizes.map(([name, code]) => ({
        id: `size-${c.key}-${code}`,
        name,
        code,
      })),
    ]),
  );

  // ----- attributes
  const attributeKeys = Object.keys(attributes) as AttributeKey[];
  const attributeRows = attributeKeys.map((k) => ({
    id: `attr-${k}`,
    name: attributes[k].name,
  }));
  const attributeValueRows = attributeKeys.flatMap((k) =>
    attributes[k].values.map((value, i) => ({
      id: `attrval-${k}-${i}`,
      attributeId: `attr-${k}`,
      value,
    })),
  );
  const valueId = (k: AttributeKey, value: string) => {
    const i = (attributes[k].values as readonly string[]).indexOf(value);
    if (i < 0) throw new Error(`Unknown ${k} value "${value}"`);
    return `attrval-${k}-${i}`;
  };

  // ----- categories
  const flat = flattenCategories();
  const catBySlug = new Map(flat.map((c) => [c.slug, c]));
  const categoryRows = flat.map((c) => ({
    id: `cat-${c.slug}`,
    name: c.name,
    slug: c.slug,
    parentId: c.parentSlug ? `cat-${c.parentSlug}` : null,
    sizeChartId: c.sizeChart ? `chart-${c.sizeChart}` : null,
    image: c.depth < 3 ? img(`categories/${c.slug}`) : null,
  }));
  const categoryAttributeRows = flat.flatMap((c) =>
    (c.attributes ?? []).map((k) => ({
      id: `catattr-${c.slug}-${k}`,
      categoryId: `cat-${c.slug}`,
      attributeId: `attr-${k}`,
    })),
  );

  // ----- products, images, variants, attributes
  type VariantMem = {
    id: string;
    productId: string;
    sku: string;
    colorId: string;
    colorName: string;
    sizeId: string;
    sizeName: string;
    stock: number;
  };
  type ProductMem = {
    seed: ProductSeed;
    id: string;
    cover: string | null;
    variants: VariantMem[];
  };

  const productRows: Array<Record<string, unknown>> = [];
  const productImageRows: Array<Record<string, unknown>> = [];
  const productAttributeRows: Array<Record<string, unknown>> = [];
  const productMems: ProductMem[] = [];

  products.forEach((p, idx) => {
    const cat = catBySlug.get(p.category);
    if (!cat || cat.depth !== 3 || !cat.sizeChart)
      throw new Error(
        `Product ${p.slug}: "${p.category}" is not a leaf category with a size chart`,
      );
    if (p.salePrice !== undefined && p.salePrice >= p.basePrice)
      throw new Error(
        `Product ${p.slug}: salePrice must be lower than basePrice`,
      );

    const id = `prod-${p.slug}`;
    const code = `P${String(idx + 1).padStart(3, "0")}`;
    const cover = img(productImageLogical(p.slug, 1));
    const hover = img(productImageLogical(p.slug, 2));

    productRows.push({
      id,
      title: p.title,
      slug: p.slug,
      coverImage: cover,
      hoverImage: hover,
      description: p.description,
      categoryId: `cat-${p.category}`,
      basePrice: p.basePrice,
      salePrice: p.salePrice ?? null,
      isPublished: true,
      createdAt: daysAgo(int(1, 70)),
    });

    ([1, 2, 3, 4] as const).forEach((n) => {
      const key = img(productImageLogical(p.slug, n));
      if (key) {
        productImageRows.push({
          id: `pi-${p.slug}-${n}`,
          productId: id,
          url: key,
          alt: `${p.title} - تصویر ${n}`,
          sortOrder: n - 1,
        });
      }
    });

    const attrValues: Partial<Record<AttributeKey, string>> = {
      material: p.material,
      fit: p.fit,
      season: p.season,
      pattern: p.pattern,
    };
    for (const k of cat.attributes ?? []) {
      const v = attrValues[k];
      if (!v)
        throw new Error(`Product ${p.slug} is missing a value for "${k}"`);
      productAttributeRows.push({
        id: `pa-${p.slug}-${k}`,
        productId: id,
        attributeId: `attr-${k}`,
        attributeValueId: valueId(k, v),
      });
    }

    const variants: VariantMem[] = [];
    for (const colorCode of p.colors) {
      const color = colorByCode.get(colorCode);
      if (!color)
        throw new Error(`Product ${p.slug}: unknown color ${colorCode}`);
      for (const size of sizesByChart.get(cat.sizeChart)!) {
        const sku = `${code}-${colorCode}-${size.code}`;
        variants.push({
          id: `var-${sku}`,
          productId: id,
          sku,
          colorId: `color-${colorCode}`,
          colorName: color.name,
          sizeId: size.id,
          sizeName: size.name,
          stock: p.hot ? int(12, 40) : chance(0.08) ? 0 : int(2, 30),
        });
      }
    }
    productMems.push({ seed: p, id, cover, variants });
  });

  const productPool = productMems.flatMap((p) =>
    Array<ProductMem>(p.seed.hot ? 5 : 1).fill(p),
  );
  const productIdBySlug = new Map(productMems.map((p) => [p.seed.slug, p.id]));
  const idOf = (slug: string) => {
    const id = productIdBySlug.get(slug);
    if (!id) throw new Error(`Unknown product slug "${slug}"`);
    return id;
  };

  // ----- collections & looks
  const collectionRows = collections.map((c) => ({
    id: `col-${c.slug}`,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: img(`collections/${c.slug}`),
    isActive: true,
  }));
  const productCollectionRows = collections.flatMap((c) =>
    c.products.map((slug) => ({
      productId: idOf(slug),
      collectionId: `col-${c.slug}`,
    })),
  );

  const lookRows = looks.map((l, i) => {
    const image = img(`looks/${l.slug}`);
    return {
      id: `look-${l.slug}`,
      title: l.title,
      slug: l.slug,
      description: l.description,
      image: image ?? "",
      isPublished: !!image,
      sortOrder: i,
    };
  });
  const lookItemRows = looks.flatMap((l) =>
    l.products.map((slug, i) => ({
      id: `lookitem-${l.slug}-${slug}`,
      lookId: `look-${l.slug}`,
      productId: idOf(slug),
      sortOrder: i,
    })),
  );

  // ----- hero slides
  const heroRows = heroSlides.map((s, i) => {
    const image = img(`hero/${s.key}-desktop`);
    const mobileImage = img(`hero/${s.key}-mobile`);
    const targetId =
      s.ctaType === "CATEGORY" ? `cat-${s.ctaTarget}` : `col-${s.ctaTarget}`;
    return {
      id: `hero-${s.key}`,
      eyebrow: s.eyebrow,
      title: s.title,
      description: s.description,
      image: image ?? "",
      mobileImage,
      imageAlt: s.imageAlt,
      focalX: s.focalX,
      focalY: s.focalY,
      ctaLabel: s.ctaLabel,
      ctaType: s.ctaType as HeroCtaType,
      ctaTargetId: targetId,
      ctaSlug: s.ctaTarget,
      desktopPosition: s.desktopPosition as HeroContentPosition,
      mobilePosition: s.mobilePosition as HeroContentPosition,
      textTone: s.textTone as HeroTextTone,
      sortOrder: i,
      isActive: !!image,
    };
  });

  // ----- carriers
  const carrierRows = carriers.map((c) => ({
    id: `carrier-${c.key}`,
    name: c.name,
    cost: c.cost,
  }));

  // ----- users & addresses
  const passwordHash = {
    admin: await hashPassword(ADMIN_USER.password),
    customer: await hashPassword(CUSTOMER_PASSWORD),
  };

  const userRows: Array<Record<string, unknown>> = [];
  const accountRows: Array<Record<string, unknown>> = [];
  const addressRows: Array<Record<string, unknown>> = [];
  const addressesByUser = new Map<
    string,
    Array<{
      receiverName: string;
      phone: string;
      province: string;
      city: string;
      details: string;
      postalCode: string;
    }>
  >();

  const allUsers = [
    { ...ADMIN_USER, role: "admin", hash: passwordHash.admin },
    ...customers.map((c) => ({
      ...c,
      role: "user",
      hash: passwordHash.customer,
    })),
  ];
  allUsers.forEach((u, i) => {
    const createdAt = daysAgo(int(80, 110));
    userRows.push({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      emailVerified: true,
      role: u.role,
      banned: false,
      firstName: u.firstName,
      lastName: u.lastName,
      gender: u.gender,
      createdAt,
      updatedAt: createdAt,
    });
    accountRows.push({
      id: `acc-${u.id}`,
      accountId: u.id,
      providerId: "credential",
      userId: u.id,
      password: u.hash,
      createdAt,
      updatedAt: createdAt,
    });

    if (u.role === "user") {
      const list: NonNullable<ReturnType<typeof addressesByUser.get>> = [];
      const count = chance(0.4) ? 2 : 1;
      for (let n = 0; n < count; n++) {
        const place = places[(i + n * 2) % places.length];
        const a = {
          receiverName: `${u.firstName} ${u.lastName}`,
          phone: `09${int(10, 39)}${digits(7)}`,
          province: place.province,
          city: place.city,
          details: place.details,
          postalCode: `${int(1, 9)}${digits(9)}`,
        };
        list.push(a);
        addressRows.push({
          id: `addr-${u.id}-${n + 1}`,
          userId: u.id,
          label: n === 0 ? "منزل" : "محل کار",
          ...a,
          isDefault: n === 0,
          createdAt,
          updatedAt: createdAt,
        });
      }
      addressesByUser.set(u.id, list);
    }
  });

  // ----- favorites
  const favoriteRows = customers.flatMap((u) => {
    const chosen = new Set<string>();
    while (chosen.size < 6) chosen.add(pick(productMems).id);
    return [...chosen].map((productId) => ({
      id: `fav-${u.id}-${productId}`,
      userId: u.id,
      productId,
    }));
  });

  // ----- orders (in memory first, so stock and coupon usage stay consistent)
  const STATUS_PLAN: Array<{
    status: OrderStatus;
    weight: number;
    min: number;
    max: number;
  }> = [
    { status: "DELIVERED", weight: 45, min: 15, max: 70 },
    { status: "SHIPPED", weight: 10, min: 3, max: 8 },
    { status: "PROCESSING", weight: 8, min: 1, max: 3 },
    { status: "PAID", weight: 10, min: 0, max: 2 },
    { status: "PENDING", weight: 10, min: 0, max: 5 },
    { status: "CANCELLED", weight: 8, min: 5, max: 60 },
    { status: "RETURNED", weight: 5, min: 25, max: 60 },
  ];
  const CONSUMES_STOCK = new Set<OrderStatus>([
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ]);
  const ORDER_COUNT = 50;

  const welcome = coupons[0];
  const save200 = coupons[1];
  const couponUsers = new Map<string, Set<string>>([
    [welcome.code, new Set()],
    [save200.code, new Set()],
  ]);
  const couponUsed = new Map<string, number>([
    [welcome.code, 0],
    [save200.code, 0],
  ]);

  const orderRows: Array<Record<string, unknown>> = [];
  const orderItemRows: Array<Record<string, unknown>> = [];
  const paymentRows: Array<Record<string, unknown>> = [];
  const shipmentRows: Array<Record<string, unknown>> = [];
  const couponUserRows: Array<{ couponId: string; userId: string }> = [];
  const delivered: Array<{ userId: string; productId: string; at: Date }> = [];

  const drafts = Array.from({ length: ORDER_COUNT }, () => {
    const plan = weightedPick(STATUS_PLAN);
    return {
      plan,
      createdAt: daysAgo(int(plan.min, plan.max)),
      user: pick(customers),
    };
  }).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  let seq = 0;
  for (const { plan, createdAt, user } of drafts) {
    const used = new Set<string>();
    const lines: Array<{ prod: ProductMem; v: VariantMem; qty: number }> = [];
    const wanted = pick([1, 1, 2, 2, 3]);
    for (let k = 0; k < wanted; k++) {
      const prod = pick(productPool);
      const candidates = prod.variants.filter(
        (v) => !used.has(v.id) && v.stock >= 2,
      );
      if (!candidates.length) continue;
      const v = pick(candidates);
      used.add(v.id);
      lines.push({ prod, v, qty: chance(0.2) ? 2 : 1 });
    }
    if (!lines.length) continue;

    seq++;
    const id = `order-${seq}`;
    const orderNumber = `ORD-${createdAt.toISOString().slice(0, 10).replace(/-/g, "")}-${String(seq).padStart(4, "0")}`;
    const address = pick(addressesByUser.get(user.id)!);

    let subtotal = 0;
    for (const { prod, v, qty } of lines) {
      const unitPrice = prod.seed.basePrice;
      const salePrice = prod.seed.salePrice ?? null;
      const lineTotal = (salePrice ?? unitPrice) * qty;
      subtotal += lineTotal;
      if (CONSUMES_STOCK.has(plan.status)) v.stock -= qty;
      orderItemRows.push({
        id: `oi-${seq}-${v.id}`,
        orderId: id,
        variantId: v.id,
        sku: v.sku,
        productTitle: prod.seed.title,
        colorName: v.colorName,
        sizeName: v.sizeName,
        unitPrice,
        salePrice,
        quantity: qty,
        lineTotal,
        image: prod.cover ?? "",
      });
      if (plan.status === "DELIVERED")
        delivered.push({ userId: user.id, productId: prod.id, at: createdAt });
    }

    // coupon
    let couponCode: string | null = null;
    let discount = 0;
    if (
      subtotal >= save200.minOrderAmount &&
      chance(0.35) &&
      !couponUsers.get(save200.code)!.has(user.id)
    ) {
      couponCode = save200.code;
      discount = save200.value;
    } else if (
      subtotal >= welcome.minOrderAmount &&
      chance(0.25) &&
      !couponUsers.get(welcome.code)!.has(user.id)
    ) {
      couponCode = welcome.code;
      discount = Math.min(
        Math.round((subtotal * welcome.value) / 100),
        welcome.maxDiscount,
      );
    }
    if (couponCode) {
      couponUsers.get(couponCode)!.add(user.id);
      couponUsed.set(couponCode, (couponUsed.get(couponCode) ?? 0) + 1);
      couponUserRows.push({
        couponId: `coupon-${couponCode}`,
        userId: user.id,
      });
    }

    const carrier = pick(carriers);
    const shippingFee = carrier.cost;
    const totalPrice = subtotal - discount + shippingFee;

    // timeline
    const paidAt = addMinutes(createdAt, int(3, 12));
    const shippedAt = addDays(createdAt, 1);
    const deliveredAt = addDays(shippedAt, int(2, 4));
    const updatedAt =
      plan.status === "DELIVERED" || plan.status === "RETURNED"
        ? deliveredAt
        : plan.status === "SHIPPED"
          ? shippedAt
          : plan.status === "PENDING" || plan.status === "CANCELLED"
            ? createdAt
            : paidAt;

    orderRows.push({
      id,
      orderNumber,
      userId: user.id,
      status: plan.status,
      subtotal,
      discount,
      shippingFee,
      totalPrice,
      shippingReceiverName: address.receiverName,
      shippingPhone: address.phone,
      shippingProvince: address.province,
      shippingCity: address.city,
      shippingAddress: address.details,
      shippingPostalCode: address.postalCode,
      couponId: couponCode ? `coupon-${couponCode}` : null,
      couponCode,
      createdAt,
      updatedAt,
    });

    if (
      ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "RETURNED"].includes(
        plan.status,
      )
    ) {
      paymentRows.push({
        id: `pay-${seq}`,
        orderId: id,
        amount: totalPrice,
        gateway: "SEP",
        authority: hex(32),
        refId: digits(12),
        status: plan.status === "RETURNED" ? "REFUNDED" : "SUCCESS",
        paidAt,
        createdAt: addMinutes(createdAt, 1),
      });
    }

    if (
      ["PROCESSING", "SHIPPED", "DELIVERED", "RETURNED"].includes(plan.status)
    ) {
      const base = {
        id: `ship-${seq}`,
        orderId: id,
        carrierId: `carrier-${carrier.key}`,
        createdAt: paidAt,
        updatedAt,
      };
      if (plan.status === "PROCESSING") {
        shipmentRows.push({
          ...base,
          status: "PACKING",
          trackingCode: null,
          shippedAt: null,
          deliveredAt: null,
        });
      } else if (plan.status === "SHIPPED") {
        shipmentRows.push({
          ...base,
          status: "SHIPPED",
          trackingCode: digits(20),
          shippedAt,
          deliveredAt: null,
        });
      } else {
        shipmentRows.push({
          ...base,
          status: plan.status === "RETURNED" ? "RETURNED" : "DELIVERED",
          trackingCode: digits(20),
          shippedAt,
          deliveredAt,
        });
      }
    }
  }

  // ----- reviews (only from delivered orders, so isVerifiedPurchase is truthful)
  const reviewed = new Set<string>();
  const reviewRows: Array<Record<string, unknown>> = [];
  for (const d of delivered) {
    const pairKey = `${d.userId}|${d.productId}`;
    if (reviewed.has(pairKey) || !chance(0.6)) continue;
    reviewed.add(pairKey);

    const r = rand();
    const rating = r < 0.5 ? 5 : r < 0.8 ? 4 : r < 0.92 ? 3 : r < 0.98 ? 2 : 1;
    const s = rand();
    const status: ReviewStatus =
      s < 0.8 ? "APPROVED" : s < 0.94 ? "PENDING" : "REJECTED";
    const pool = reviewPool[rating];
    const createdAt = addDays(d.at, int(5, 14));
    reviewRows.push({
      id: `review-${reviewRows.length + 1}`,
      productId: d.productId,
      userId: d.userId,
      rating,
      title: pick(pool.titles),
      comment: pick(pool.comments),
      status,
      isVerifiedPurchase: true,
      adminReply:
        status === "APPROVED" && chance(0.3) ? pick(adminReplies) : null,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // ----- coupons
  const couponRows = coupons.map((c) => ({
    id: `coupon-${c.code}`,
    code: c.code,
    type: c.type as CouponType,
    value: c.value,
    minOrderAmount: c.minOrderAmount,
    maxDiscount: c.maxDiscount,
    usageLimit: c.usageLimit,
    usedCount: couponUsed.get(c.code) ?? (c.expired ? 14 : 0),
    startsAt: daysAgo(c.expired ? 120 : 30),
    expiresAt: c.expired ? daysAgo(30) : null,
    isActive: c.active,
  }));

  // ----- variants (after orders, so stock reflects the sales above)
  const variantRows = productMems.flatMap((p) =>
    p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      productId: v.productId,
      colorId: v.colorId,
      sizeId: v.sizeId,
      stock: Math.max(0, v.stock),
      reservedStock: 0,
    })),
  );

  // ----- storage registry (so the cleanup job never deletes the demo images)
  const byKey = new Map(Object.values(manifest).map((e) => [e.key, e]));
  const storageRows = [...refCount.entries()].map(([key, referenceCount]) => ({
    key,
    referenceCount,
    mimeType: byKey.get(key)?.mimeType ?? null,
    size: byKey.get(key)?.size ?? null,
    unreferencedAt: null,
  }));

  return {
    colorRows,
    sizeChartRows,
    sizeRows,
    attributeRows,
    attributeValueRows,
    categoryRows,
    categoryAttributeRows,
    productRows,
    productImageRows,
    productAttributeRows,
    variantRows,
    collectionRows,
    productCollectionRows,
    lookRows,
    lookItemRows,
    heroRows,
    carrierRows,
    userRows,
    accountRows,
    addressRows,
    favoriteRows,
    couponRows,
    orderRows,
    orderItemRows,
    paymentRows,
    shipmentRows,
    couponUserRows,
    reviewRows,
    storageRows,
  };
}

// ───────────────────────── write to the database ─────────────────────────
async function main() {
  const d = await build();

  await prisma.$transaction(
    async (tx) => {
      // 1. wipe (children first)
      await tx.couponUser.deleteMany();
      await tx.orderItem.deleteMany();
      await tx.payment.deleteMany();
      await tx.shipment.deleteMany();
      await tx.order.deleteMany();
      await tx.review.deleteMany();
      await tx.favorite.deleteMany();
      await tx.lookItem.deleteMany();
      await tx.look.deleteMany();
      await tx.productCollection.deleteMany();
      await tx.collection.deleteMany();
      await tx.productAttribute.deleteMany();
      await tx.productImage.deleteMany();
      await tx.productVariant.deleteMany();
      await tx.product.deleteMany();
      await tx.categoryAttribute.deleteMany();
      await tx.category.deleteMany();
      await tx.attributeValue.deleteMany();
      await tx.attribute.deleteMany();
      await tx.size.deleteMany();
      await tx.sizeChart.deleteMany();
      await tx.color.deleteMany();
      await tx.address.deleteMany();
      await tx.session.deleteMany();
      await tx.account.deleteMany();
      await tx.verification.deleteMany();
      await tx.user.deleteMany();
      await tx.coupon.deleteMany();
      await tx.carrier.deleteMany();
      await tx.heroSlide.deleteMany();
      await tx.storageObject.deleteMany();

      // 2. insert (parents first)
      await tx.color.createMany({ data: d.colorRows });
      await tx.sizeChart.createMany({ data: d.sizeChartRows });
      await tx.size.createMany({ data: d.sizeRows });
      await tx.attribute.createMany({ data: d.attributeRows });
      await tx.attributeValue.createMany({ data: d.attributeValueRows });

      // categories level by level so a parent always exists before its children
      for (const level of [1, 2, 3]) {
        const rows = d.categoryRows.filter((c) => {
          let depth = 1;
          let parent = c.parentId;
          while (parent) {
            depth++;
            parent =
              d.categoryRows.find((x) => x.id === parent)?.parentId ?? null;
          }
          return depth === level;
        });
        await tx.category.createMany({ data: rows });
      }
      await tx.categoryAttribute.createMany({ data: d.categoryAttributeRows });

      await tx.product.createMany({ data: d.productRows as never });
      await tx.productImage.createMany({ data: d.productImageRows as never });
      await tx.productAttribute.createMany({
        data: d.productAttributeRows as never,
      });
      await tx.productVariant.createMany({ data: d.variantRows });

      await tx.collection.createMany({ data: d.collectionRows });
      await tx.productCollection.createMany({ data: d.productCollectionRows });
      await tx.look.createMany({ data: d.lookRows });
      await tx.lookItem.createMany({ data: d.lookItemRows });
      await tx.heroSlide.createMany({ data: d.heroRows });
      await tx.carrier.createMany({ data: d.carrierRows });

      await tx.user.createMany({ data: d.userRows as never });
      await tx.account.createMany({ data: d.accountRows as never });
      await tx.address.createMany({ data: d.addressRows as never });
      await tx.favorite.createMany({ data: d.favoriteRows });

      await tx.coupon.createMany({ data: d.couponRows });
      await tx.order.createMany({ data: d.orderRows as never });
      await tx.orderItem.createMany({ data: d.orderItemRows as never });
      await tx.payment.createMany({ data: d.paymentRows as never });
      await tx.shipment.createMany({ data: d.shipmentRows as never });
      await tx.couponUser.createMany({ data: d.couponUserRows });
      await tx.review.createMany({ data: d.reviewRows as never });

      await tx.storageObject.createMany({ data: d.storageRows });
    },
    { timeout: 300_000, maxWait: 30_000 },
  );

  console.log("\nSeed finished:");
  console.log(
    `  categories ${d.categoryRows.length} | products ${d.productRows.length} | variants ${d.variantRows.length}`,
  );
  console.log(
    `  users ${d.userRows.length} | orders ${d.orderRows.length} | reviews ${d.reviewRows.length}`,
  );
  console.log(
    `  collections ${d.collectionRows.length} | looks ${d.lookRows.length} | hero slides ${d.heroRows.length} | images registered ${d.storageRows.length}`,
  );

  const missing = [...new Set(missingImages)];
  if (missing.length) {
    console.log(
      `\n! ${missing.length} images are not in the manifest (run "npm run images:list"). Those fields were left empty.`,
    );
  }

  console.log("\nDemo logins:");
  console.log(`  admin     ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
  console.log(
    `  customer  ${customers[0].email} / ${CUSTOMER_PASSWORD}  (all customers share this password)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
