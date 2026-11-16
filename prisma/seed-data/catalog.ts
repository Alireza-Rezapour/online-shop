/**
 * Pure data for the seed. No Prisma / fs imports on purpose, so both
 * prisma/seed.ts and scripts/upload-images.ts can import it.
 * All prices are in Toman (integers).
 */

// ───────────────────────── Colors ─────────────────────────
export const colors = [
  { code: "BLK", name: "مشکی", hex: "#111111" },
  { code: "WHT", name: "سفید", hex: "#FFFFFF" },
  { code: "NVY", name: "سرمه‌ای", hex: "#1F2A44" },
  { code: "GRY", name: "طوسی", hex: "#8C8C8C" },
  { code: "BEG", name: "بژ", hex: "#D9C6A5" },
  { code: "OLV", name: "زیتونی", hex: "#5B6234" },
  { code: "RED", name: "قرمز", hex: "#B3202A" },
  { code: "BLU", name: "آبی", hex: "#2F6DB5" },
  { code: "CRM", name: "کرم", hex: "#F2E8D5" },
  { code: "BRN", name: "قهوه‌ای", hex: "#6B4A2F" },
  { code: "PNK", name: "صورتی", hex: "#E8A5B5" },
  { code: "LIL", name: "یاسی", hex: "#B9A3D6" },
] as const;

// ───────────────────────── Size charts ─────────────────────────
// sizes: [name shown in the shop, ASCII code used inside the SKU]
export const sizeCharts = [
  {
    key: "men-clothing",
    name: "لباس مردانه",
    sizes: [
      ["S", "S"],
      ["M", "M"],
      ["L", "L"],
      ["XL", "XL"],
      ["XXL", "XXL"],
    ],
  },
  {
    key: "men-pants",
    name: "شلوار مردانه",
    sizes: [
      ["30", "30"],
      ["32", "32"],
      ["34", "34"],
      ["36", "36"],
      ["38", "38"],
    ],
  },
  {
    key: "women-clothing",
    name: "لباس زنانه",
    sizes: [
      ["S", "S"],
      ["M", "M"],
      ["L", "L"],
      ["XL", "XL"],
    ],
  },
  {
    key: "women-pants",
    name: "شلوار و دامن زنانه",
    sizes: [
      ["36", "36"],
      ["38", "38"],
      ["40", "40"],
      ["42", "42"],
      ["44", "44"],
    ],
  },
  {
    key: "kids",
    name: "لباس بچگانه",
    sizes: [
      ["۲ تا ۳ سال", "2-3Y"],
      ["۴ تا ۵ سال", "4-5Y"],
      ["۶ تا ۷ سال", "6-7Y"],
      ["۸ تا ۹ سال", "8-9Y"],
    ],
  },
  {
    key: "belt",
    name: "کمربند",
    sizes: [
      ["۹۰", "90"],
      ["۱۰۰", "100"],
      ["۱۱۰", "110"],
    ],
  },
  { key: "one-size", name: "تک‌سایز", sizes: [["تک‌سایز", "OS"]] },
] as const satisfies ReadonlyArray<{
  key: string;
  name: string;
  sizes: ReadonlyArray<readonly [string, string]>;
}>;

// ───────────────────────── Attributes ─────────────────────────
export const attributes = {
  material: {
    name: "جنس",
    values: [
      "نخی",
      "کتان",
      "جین",
      "پلی‌استر",
      "ویسکوز",
      "پشم",
      "مخمل",
      "چرم طبیعی",
      "چرم مصنوعی",
      "بوم",
    ],
  },
  fit: { name: "فرم", values: ["اسلیم", "رگولار", "راسته", "اورسایز", "گشاد"] },
  season: {
    name: "فصل",
    values: ["بهار و تابستان", "پاییز و زمستان", "چهار فصل"],
  },
  pattern: { name: "طرح", values: ["ساده", "راه‌راه", "چهارخانه", "طرح‌دار"] },
} as const;

export type AttributeKey = keyof typeof attributes;

// ───────────────────────── Categories (3 levels) ─────────────────────────
export type CategorySeed = {
  slug: string;
  name: string;
  /** leaf only: key of a size chart */
  sizeChart?: (typeof sizeCharts)[number]["key"];
  /** leaf only: attributes that products of this category can have */
  attributes?: AttributeKey[];
  children?: CategorySeed[];
};

const CLOTHING_ATTRS: AttributeKey[] = ["material", "fit", "season", "pattern"];
const ACCESSORY_ATTRS: AttributeKey[] = ["material", "pattern"];

export const categoryTree: CategorySeed[] = [
  {
    slug: "men",
    name: "مردانه",
    children: [
      {
        slug: "men-tops",
        name: "پیراهن و تی‌شرت",
        children: [
          {
            slug: "men-tshirts",
            name: "تی‌شرت مردانه",
            sizeChart: "men-clothing",
            attributes: CLOTHING_ATTRS,
          },
          {
            slug: "men-shirts",
            name: "پیراهن مردانه",
            sizeChart: "men-clothing",
            attributes: CLOTHING_ATTRS,
          },
        ],
      },
      {
        slug: "men-bottoms",
        name: "شلوار مردانه",
        children: [
          {
            slug: "men-jeans",
            name: "شلوار جین مردانه",
            sizeChart: "men-pants",
            attributes: CLOTHING_ATTRS,
          },
          {
            slug: "men-chinos",
            name: "شلوار کتان و پارچه‌ای مردانه",
            sizeChart: "men-pants",
            attributes: CLOTHING_ATTRS,
          },
        ],
      },
    ],
  },
  {
    slug: "women",
    name: "زنانه",
    children: [
      {
        slug: "women-tops",
        name: "مانتو و بلوز",
        children: [
          {
            slug: "women-manteau",
            name: "مانتو",
            sizeChart: "women-clothing",
            attributes: CLOTHING_ATTRS,
          },
          {
            slug: "women-blouses",
            name: "بلوز و شومیز",
            sizeChart: "women-clothing",
            attributes: CLOTHING_ATTRS,
          },
        ],
      },
      {
        slug: "women-bottoms",
        name: "شلوار و دامن",
        children: [
          {
            slug: "women-pants",
            name: "شلوار زنانه",
            sizeChart: "women-pants",
            attributes: CLOTHING_ATTRS,
          },
          {
            slug: "women-skirts",
            name: "دامن",
            sizeChart: "women-pants",
            attributes: CLOTHING_ATTRS,
          },
        ],
      },
    ],
  },
  {
    slug: "kids",
    name: "بچگانه",
    children: [
      {
        slug: "kids-boys",
        name: "پسرانه",
        children: [
          {
            slug: "boys-tshirts",
            name: "تی‌شرت پسرانه",
            sizeChart: "kids",
            attributes: CLOTHING_ATTRS,
          },
          {
            slug: "boys-pants",
            name: "شلوار پسرانه",
            sizeChart: "kids",
            attributes: CLOTHING_ATTRS,
          },
        ],
      },
      {
        slug: "kids-girls",
        name: "دخترانه",
        children: [
          {
            slug: "girls-dresses",
            name: "پیراهن دخترانه",
            sizeChart: "kids",
            attributes: CLOTHING_ATTRS,
          },
          {
            slug: "girls-sweatshirts",
            name: "سویشرت و هودی دخترانه",
            sizeChart: "kids",
            attributes: CLOTHING_ATTRS,
          },
        ],
      },
    ],
  },
  {
    slug: "accessories",
    name: "اکسسوری",
    children: [
      {
        slug: "acc-bags",
        name: "کیف و کوله",
        children: [
          {
            slug: "shoulder-bags",
            name: "کیف دوشی",
            sizeChart: "one-size",
            attributes: ACCESSORY_ATTRS,
          },
          {
            slug: "backpacks",
            name: "کوله‌پشتی",
            sizeChart: "one-size",
            attributes: ACCESSORY_ATTRS,
          },
        ],
      },
      {
        slug: "acc-belts-hats",
        name: "کمربند و کلاه",
        children: [
          {
            slug: "belts",
            name: "کمربند",
            sizeChart: "belt",
            attributes: ACCESSORY_ATTRS,
          },
          {
            slug: "hats",
            name: "کلاه",
            sizeChart: "one-size",
            attributes: ACCESSORY_ATTRS,
          },
        ],
      },
    ],
  },
];

export type FlatCategory = {
  slug: string;
  name: string;
  depth: 1 | 2 | 3;
  parentSlug: string | null;
  sizeChart?: CategorySeed["sizeChart"];
  attributes?: AttributeKey[];
};

export function flattenCategories(): FlatCategory[] {
  const out: FlatCategory[] = [];
  const walk = (
    nodes: CategorySeed[],
    depth: 1 | 2 | 3,
    parent: string | null,
  ) => {
    for (const n of nodes) {
      out.push({
        slug: n.slug,
        name: n.name,
        depth,
        parentSlug: parent,
        sizeChart: n.sizeChart,
        attributes: n.attributes,
      });
      if (n.children) walk(n.children, (depth + 1) as 2 | 3, n.slug);
    }
  };
  walk(categoryTree, 1, null);
  return out;
}

// ───────────────────────── Products (2 per leaf category = 32) ─────────────────────────
export type ProductSeed = {
  slug: string;
  title: string;
  category: string; // leaf category slug
  basePrice: number;
  salePrice?: number;
  description: string;
  colors: Array<(typeof colors)[number]["code"]>;
  material: string;
  fit?: string;
  season?: string;
  pattern: string;
  /** best seller: gets many more mock orders */
  hot?: boolean;
};

export const products: ProductSeed[] = [
  // ── مردانه / تی‌شرت
  {
    slug: "men-tshirt-oversize-cotton",
    title: "تی‌شرت اورسایز نخی مردانه",
    category: "men-tshirts",
    basePrice: 890_000,
    salePrice: 690_000,
    description:
      "تی‌شرت اورسایز از نخ پنبه‌ای ۱۰۰٪ با دوخت دقیق و یقه گرد. پارچه‌ای نرم و خنک برای استفاده روزمره.",
    colors: ["BLK", "WHT", "GRY", "BEG"],
    material: "نخی",
    fit: "اورسایز",
    season: "بهار و تابستان",
    pattern: "ساده",
    hot: true,
  },
  {
    slug: "men-polo-pique",
    title: "پولوشرت مردانه پیکه",
    category: "men-tshirts",
    basePrice: 1_250_000,
    description:
      "پولوشرت یقه‌دار از پارچه پیکه با دکمه‌های مات و دوخت استاندارد؛ مناسب محیط کار و رفت‌وآمد شهری.",
    colors: ["NVY", "WHT", "OLV"],
    material: "نخی",
    fit: "رگولار",
    season: "بهار و تابستان",
    pattern: "ساده",
  },
  // ── مردانه / پیراهن
  {
    slug: "men-shirt-linen-classic",
    title: "پیراهن کتان آستین‌بلند مردانه",
    category: "men-shirts",
    basePrice: 1_650_000,
    salePrice: 1_390_000,
    description:
      "پیراهن کتان سبک با یقه کلاسیک و آستین بلند. در گرمای تابستان خنک می‌ماند و بعد از شست‌وشو فرم خودش را حفظ می‌کند.",
    colors: ["WHT", "BLU", "BEG"],
    material: "کتان",
    fit: "رگولار",
    season: "بهار و تابستان",
    pattern: "ساده",
  },
  {
    slug: "men-shirt-checked-flannel",
    title: "پیراهن فلنل چهارخانه مردانه",
    category: "men-shirts",
    basePrice: 1_480_000,
    description:
      "پیراهن فلنل نرم و گرم با طرح چهارخانه، مناسب پاییز و زمستان؛ هم به‌تنهایی و هم روی تی‌شرت قابل استفاده است.",
    colors: ["RED", "NVY", "OLV"],
    material: "نخی",
    fit: "رگولار",
    season: "پاییز و زمستان",
    pattern: "چهارخانه",
  },
  // ── مردانه / جین
  {
    slug: "men-jeans-slim-dark",
    title: "شلوار جین اسلیم‌فیت مردانه",
    category: "men-jeans",
    basePrice: 2_150_000,
    salePrice: 1_790_000,
    description:
      "شلوار جین اسلیم با کمی کشسانی برای راحتی بیشتر. رنگ تیره و ثابت که به‌مرور محو نمی‌شود.",
    colors: ["NVY", "BLK", "GRY"],
    material: "جین",
    fit: "اسلیم",
    season: "چهار فصل",
    pattern: "ساده",
    hot: true,
  },
  {
    slug: "men-jeans-straight-washed",
    title: "شلوار جین راسته واش‌شده مردانه",
    category: "men-jeans",
    basePrice: 2_290_000,
    description:
      "جین راسته با واش ملایم و قواره‌ای راحت؛ انتخابی همیشگی برای استایل روزمره.",
    colors: ["BLU", "GRY"],
    material: "جین",
    fit: "راسته",
    season: "چهار فصل",
    pattern: "ساده",
  },
  // ── مردانه / کتان و پارچه‌ای
  {
    slug: "men-chino-cotton",
    title: "شلوار چینو نخی مردانه",
    category: "men-chinos",
    basePrice: 1_850_000,
    description:
      "شلوار چینو از پارچه نخی گباردین با دوخت اسلیم. هم برای اداره و هم برای قدم‌زدن آخر هفته مناسب است.",
    colors: ["BEG", "OLV", "NVY", "BLK"],
    material: "نخی",
    fit: "اسلیم",
    season: "چهار فصل",
    pattern: "ساده",
    hot: true,
  },
  {
    slug: "men-trousers-pleated",
    title: "شلوار پارچه‌ای پیلی‌دار مردانه",
    category: "men-chinos",
    basePrice: 2_050_000,
    salePrice: 1_750_000,
    description:
      "شلوار پارچه‌ای با چین‌های جلو و کمر بلند‌تر؛ ظاهری رسمی و در عین حال راحت.",
    colors: ["BLK", "GRY", "BRN"],
    material: "ویسکوز",
    fit: "راسته",
    season: "پاییز و زمستان",
    pattern: "ساده",
  },
  // ── زنانه / مانتو
  {
    slug: "women-manteau-linen-long",
    title: "مانتو کتان بلند زنانه",
    category: "women-manteau",
    basePrice: 2_450_000,
    salePrice: 1_990_000,
    description:
      "مانتوی بلند از کتان سبک با برش راسته و جیب‌های کاربردی. برای روزهای گرم و رفت‌وآمد روزانه.",
    colors: ["BEG", "BLK", "OLV"],
    material: "کتان",
    fit: "راسته",
    season: "بهار و تابستان",
    pattern: "ساده",
    hot: true,
  },
  {
    slug: "women-manteau-wool-coat",
    title: "مانتو پشمی پاییزه زنانه",
    category: "women-manteau",
    basePrice: 3_850_000,
    description:
      "مانتوی پشمی با آستر نرم و یقه ایستاده؛ گرم، سبک و با دوختی تمیز برای فصل سرما.",
    colors: ["BRN", "GRY", "BLK"],
    material: "پشم",
    fit: "رگولار",
    season: "پاییز و زمستان",
    pattern: "ساده",
  },
  // ── زنانه / بلوز
  {
    slug: "women-blouse-satin",
    title: "شومیز ساتن آستین‌بلند زنانه",
    category: "women-blouses",
    basePrice: 1_590_000,
    description:
      "شومیز ساتن با فرم روان و براقیت ملایم؛ هم برای محل کار و هم برای مهمانی انتخاب خوبی است.",
    colors: ["CRM", "BLK", "PNK"],
    material: "پلی‌استر",
    fit: "رگولار",
    season: "بهار و تابستان",
    pattern: "ساده",
  },
  {
    slug: "women-blouse-striped",
    title: "بلوز راه‌راه نخی زنانه",
    category: "women-blouses",
    basePrice: 1_190_000,
    salePrice: 990_000,
    description:
      "بلوز نخی با طرح راه‌راه کلاسیک و یقه قایقی. سبک، راحت و مناسب استایل روزمره.",
    colors: ["WHT", "NVY", "RED"],
    material: "نخی",
    fit: "رگولار",
    season: "بهار و تابستان",
    pattern: "راه‌راه",
  },
  // ── زنانه / شلوار
  {
    slug: "women-pants-wide-leg",
    title: "شلوار پارچه‌ای واید‌لگ زنانه",
    category: "women-pants",
    basePrice: 1_950_000,
    description:
      "شلوار گشاد با کمر بلند و پارچه‌ای که خوب می‌ریزد. قواره‌ای راحت با ظاهری شیک.",
    colors: ["BLK", "BEG", "GRY"],
    material: "ویسکوز",
    fit: "گشاد",
    season: "چهار فصل",
    pattern: "ساده",
    hot: true,
  },
  {
    slug: "women-jeans-mom",
    title: "شلوار جین مام‌فیت زنانه",
    category: "women-pants",
    basePrice: 2_190_000,
    salePrice: 1_850_000,
    description:
      "جین مام‌فیت با کمر بلند و پاچه کمی کوتاه‌تر؛ قواره‌ای راحت و محبوب.",
    colors: ["BLU", "BLK", "GRY"],
    material: "جین",
    fit: "رگولار",
    season: "چهار فصل",
    pattern: "ساده",
  },
  // ── زنانه / دامن
  {
    slug: "women-skirt-midi-pleated",
    title: "دامن میدی پلیسه زنانه",
    category: "women-skirts",
    basePrice: 1_390_000,
    description:
      "دامن پلیسه بلندیِ میدی با کمر کش‌دار؛ پلیسه‌ها حتی بعد از شست‌وشو ماندگار هستند.",
    colors: ["BLK", "OLV", "CRM"],
    material: "پلی‌استر",
    fit: "رگولار",
    season: "چهار فصل",
    pattern: "ساده",
  },
  {
    slug: "women-skirt-denim",
    title: "دامن جین کمربلند زنانه",
    category: "women-skirts",
    basePrice: 1_250_000,
    salePrice: 990_000,
    description:
      "دامن جین کمربلند با دکمه‌های جلو و جیب‌های کاربردی؛ بهترین همراه برای تی‌شرت و بلوز.",
    colors: ["BLU", "BLK"],
    material: "جین",
    fit: "رگولار",
    season: "بهار و تابستان",
    pattern: "ساده",
  },
  // ── بچگانه / پسرانه / تی‌شرت
  {
    slug: "boys-tshirt-graphic",
    title: "تی‌شرت طرح‌دار پسرانه",
    category: "boys-tshirts",
    basePrice: 590_000,
    description:
      "تی‌شرت نخی نرم با چاپ مقاوم در برابر شست‌وشو. مناسب بازی و مدرسه.",
    colors: ["WHT", "NVY", "RED"],
    material: "نخی",
    fit: "رگولار",
    season: "بهار و تابستان",
    pattern: "طرح‌دار",
  },
  {
    slug: "boys-tshirt-striped",
    title: "تی‌شرت راه‌راه پسرانه",
    category: "boys-tshirts",
    basePrice: 520_000,
    salePrice: 450_000,
    description: "تی‌شرت راه‌راه نخی با یقه گرد کشی که تغییر شکل نمی‌دهد.",
    colors: ["BLU", "NVY", "RED"],
    material: "نخی",
    fit: "رگولار",
    season: "بهار و تابستان",
    pattern: "راه‌راه",
  },
  // ── بچگانه / پسرانه / شلوار
  {
    slug: "boys-jogger-cotton",
    title: "شلوار اسپرت نخی پسرانه",
    category: "boys-pants",
    basePrice: 690_000,
    description:
      "شلوار اسپرت با کمر کش‌دار و بند و جیب‌های عمیق؛ راحت برای تمام روز.",
    colors: ["GRY", "NVY", "BLK"],
    material: "نخی",
    fit: "رگولار",
    season: "چهار فصل",
    pattern: "ساده",
    hot: true,
  },
  {
    slug: "boys-jeans-stretch",
    title: "شلوار جین کشی پسرانه",
    category: "boys-pants",
    basePrice: 890_000,
    salePrice: 750_000,
    description:
      "جین کشی با کمر تنظیم‌شونده که برای بازی و تحرک بچه‌ها طراحی شده است.",
    colors: ["BLU", "BLK"],
    material: "جین",
    fit: "اسلیم",
    season: "چهار فصل",
    pattern: "ساده",
  },
  // ── بچگانه / دخترانه / پیراهن
  {
    slug: "girls-dress-floral",
    title: "پیراهن گل‌دار دخترانه",
    category: "girls-dresses",
    basePrice: 980_000,
    description: "پیراهن نخی گل‌دار با دامن پرچین و آستر نرم؛ دلنشین و راحت.",
    colors: ["PNK", "CRM", "LIL"],
    material: "نخی",
    fit: "رگولار",
    season: "بهار و تابستان",
    pattern: "طرح‌دار",
  },
  {
    slug: "girls-dress-velvet",
    title: "پیراهن مجلسی مخمل دخترانه",
    category: "girls-dresses",
    basePrice: 1_450_000,
    salePrice: 1_190_000,
    description:
      "پیراهن مخمل با پاپیون پشت و آستر نرم، مناسب مهمانی‌ها و جشن‌ها.",
    colors: ["RED", "NVY", "BLK"],
    material: "مخمل",
    fit: "رگولار",
    season: "پاییز و زمستان",
    pattern: "ساده",
  },
  // ── بچگانه / دخترانه / سویشرت
  {
    slug: "girls-sweatshirt-hooded",
    title: "هودی نخی دخترانه",
    category: "girls-sweatshirts",
    basePrice: 850_000,
    description: "هودی نخی با آستر کرکی نازک، کلاه کشی و جیب کانگورویی.",
    colors: ["PNK", "CRM", "GRY"],
    material: "نخی",
    fit: "اورسایز",
    season: "پاییز و زمستان",
    pattern: "ساده",
  },
  {
    slug: "girls-sweatshirt-crop",
    title: "سویشرت کراپ دخترانه",
    category: "girls-sweatshirts",
    basePrice: 760_000,
    salePrice: 640_000,
    description:
      "سویشرت کراپ با پارچه سه‌نخ نرم و قواره راحت؛ مناسب پاییز و بهار.",
    colors: ["LIL", "PNK", "WHT"],
    material: "نخی",
    fit: "رگولار",
    season: "چهار فصل",
    pattern: "ساده",
  },
  // ── اکسسوری / کیف دوشی
  {
    slug: "bag-shoulder-leather-mini",
    title: "کیف دوشی مینی چرم طبیعی",
    category: "shoulder-bags",
    basePrice: 2_650_000,
    description: "کیف دوشی کوچک از چرم طبیعی با بند قابل تنظیم و آستر مقاوم.",
    colors: ["BLK", "BRN", "BEG"],
    material: "چرم طبیعی",
    pattern: "ساده",
  },
  {
    slug: "bag-shoulder-canvas",
    title: "کیف دوشی بوم",
    category: "shoulder-bags",
    basePrice: 890_000,
    salePrice: 690_000,
    description:
      "کیف دوشی از پارچه بوم ضخیم با زیپ محکم و فضای کافی برای وسایل روزمره.",
    colors: ["BEG", "BLK", "OLV"],
    material: "بوم",
    pattern: "ساده",
  },
  // ── اکسسوری / کوله‌پشتی
  {
    slug: "backpack-urban-waterproof",
    title: "کوله‌پشتی شهری ضدآب",
    category: "backpacks",
    basePrice: 1_750_000,
    description:
      "کوله‌پشتی ضدآب با جای لپ‌تاپ ۱۵ اینچ، پشت‌بند اسفنجی و چند جیب مجزا.",
    colors: ["BLK", "NVY", "GRY"],
    material: "پلی‌استر",
    pattern: "ساده",
    hot: true,
  },
  {
    slug: "backpack-leather-minimal",
    title: "کوله‌پشتی مینیمال چرم مصنوعی",
    category: "backpacks",
    basePrice: 2_250_000,
    salePrice: 1_890_000,
    description:
      "کوله‌پشتی چرم مصنوعی با طراحی ساده و تمیز؛ سبک و مناسب کار روزانه.",
    colors: ["BLK", "BRN"],
    material: "چرم مصنوعی",
    pattern: "ساده",
  },
  // ── اکسسوری / کمربند
  {
    slug: "belt-leather-classic",
    title: "کمربند چرم طبیعی کلاسیک",
    category: "belts",
    basePrice: 990_000,
    description: "کمربند چرم طبیعی با سگک فلزی مات و لبه‌های دوخت‌شده.",
    colors: ["BLK", "BRN"],
    material: "چرم طبیعی",
    pattern: "ساده",
  },
  {
    slug: "belt-canvas-casual",
    title: "کمربند پارچه‌ای اسپرت",
    category: "belts",
    basePrice: 420_000,
    salePrice: 350_000,
    description:
      "کمربند پارچه‌ای سبک با سگک تنظیم‌شونده؛ مناسب شلوار کتان و جین.",
    colors: ["OLV", "NVY", "BLK"],
    material: "بوم",
    pattern: "ساده",
  },
  // ── اکسسوری / کلاه
  {
    slug: "hat-baseball-cotton",
    title: "کلاه کپ نخی",
    category: "hats",
    basePrice: 490_000,
    description: "کلاه کپ نخی با بند پشت قابل تنظیم و لبه خمیده.",
    colors: ["BLK", "WHT", "NVY"],
    material: "نخی",
    pattern: "ساده",
  },
  {
    slug: "hat-wool-beanie",
    title: "کلاه بافت پشمی",
    category: "hats",
    basePrice: 540_000,
    description: "کلاه بافت پشمی نرم و گرم با لبه دوبل برای روزهای سرد.",
    colors: ["GRY", "BRN", "BLK", "RED"],
    material: "پشم",
    pattern: "ساده",
  },
];

// ───────────────────────── Collections ─────────────────────────
export const collections = [
  {
    slug: "new-season",
    name: "کالکشن فصل جدید",
    description: "تازه‌ترین طرح‌های این فصل برای آقایان و بانوان.",
    products: [
      "men-tshirt-oversize-cotton",
      "men-shirt-linen-classic",
      "women-manteau-linen-long",
      "women-blouse-satin",
      "women-pants-wide-leg",
      "bag-shoulder-leather-mini",
      "men-chino-cotton",
      "women-skirt-midi-pleated",
    ],
  },
  {
    slug: "essentials",
    name: "پایه‌های همیشگی",
    description: "لباس‌هایی ساده و بی‌زمان که در هر کمدی جا دارند.",
    products: [
      "men-polo-pique",
      "men-jeans-slim-dark",
      "women-jeans-mom",
      "women-blouse-striped",
      "hat-baseball-cotton",
      "belt-leather-classic",
      "boys-jogger-cotton",
    ],
  },
  {
    slug: "cold-season",
    name: "پاییز و زمستان",
    description: "پوشش‌های گرم و نرم برای روزهای سرد.",
    products: [
      "men-shirt-checked-flannel",
      "men-trousers-pleated",
      "women-manteau-wool-coat",
      "girls-dress-velvet",
      "girls-sweatshirt-hooded",
      "hat-wool-beanie",
    ],
  },
  {
    slug: "kids-corner",
    name: "گوشه کودکان",
    description: "لباس‌های راحت و رنگی برای بازی و مدرسه.",
    products: [
      "boys-tshirt-graphic",
      "boys-tshirt-striped",
      "boys-jeans-stretch",
      "girls-dress-floral",
      "girls-sweatshirt-crop",
      "girls-sweatshirt-hooded",
    ],
  },
] as const;

// ───────────────────────── Shop the look ─────────────────────────
export const looks = [
  {
    slug: "urban-casual-men",
    title: "استایل شهری آقایان",
    description: "ترکیبی راحت و مرتب برای روزهای پرتحرک شهری.",
    products: [
      "men-tshirt-oversize-cotton",
      "men-jeans-slim-dark",
      "backpack-urban-waterproof",
      "hat-baseball-cotton",
    ],
  },
  {
    slug: "elegant-women",
    title: "ظرافت روزمره بانوان",
    description: "استایلی ساده و شیک برای محل کار و دورهمی.",
    products: [
      "women-blouse-satin",
      "women-pants-wide-leg",
      "bag-shoulder-leather-mini",
    ],
  },
  {
    slug: "kids-weekend",
    title: "آخر هفته بچه‌ها",
    description: "راحت، رنگی و آماده برای بازی.",
    products: [
      "boys-tshirt-striped",
      "boys-jeans-stretch",
      "girls-sweatshirt-hooded",
    ],
  },
] as const;

// ───────────────────────── Hero slides ─────────────────────────
export const heroSlides = [
  {
    key: "slide-1",
    eyebrow: "کالکشن جدید",
    title: "پوشاک مردانه\nاستایل فصل جدید",
    description: "تی‌شرت، پیراهن و شلوار با دوختی دقیق و پارچه‌های باکیفیت.",
    imageAlt: "کالکشن مردانه فصل جدید",
    ctaLabel: "مشاهده کالکشن مردانه",
    ctaType: "CATEGORY",
    ctaTarget: "men",
    desktopPosition: "CENTER_RIGHT",
    mobilePosition: "CENTER",
    textTone: "LIGHT",
    focalX: 50,
    focalY: 40,
  },
  {
    key: "slide-2",
    eyebrow: "بانوان",
    title: "مجموعه زنانه\nظرافت در جزئیات",
    description: "مانتو، شومیز و شلوار با قواره‌هایی راحت و شیک.",
    imageAlt: "کالکشن زنانه",
    ctaLabel: "مشاهده کالکشن زنانه",
    ctaType: "CATEGORY",
    ctaTarget: "women",
    desktopPosition: "CENTER_RIGHT",
    mobilePosition: "CENTER",
    textTone: "LIGHT",
    focalX: 50,
    focalY: 35,
  },
  {
    key: "slide-3",
    eyebrow: "پاییز و زمستان",
    title: "گرمای دلنشین\nپوشش فصل سرما",
    description: "پشم، فلنل و مخمل؛ انتخاب‌هایی گرم برای روزهای سرد.",
    imageAlt: "کالکشن پاییز و زمستان",
    ctaLabel: "مشاهده کالکشن",
    ctaType: "COLLECTION",
    ctaTarget: "cold-season",
    desktopPosition: "CENTER_RIGHT",
    mobilePosition: "CENTER",
    textTone: "LIGHT",
    focalX: 50,
    focalY: 50,
  },
] as const;

// ───────────────────────── Carriers & coupons ─────────────────────────
export const carriers = [
  { key: "post", name: "پست پیشتاز", cost: 80_000 },
  { key: "tipax", name: "تیپاکس", cost: 120_000 },
  { key: "courier", name: "پیک موتوری (فقط تهران)", cost: 150_000 },
] as const;

export const coupons = [
  {
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minOrderAmount: 500_000,
    maxDiscount: 300_000,
    usageLimit: 1000,
    active: true,
    expired: false,
  },
  {
    code: "SAVE200K",
    type: "FIXED",
    value: 200_000,
    minOrderAmount: 1_500_000,
    maxDiscount: null,
    usageLimit: 200,
    active: true,
    expired: false,
  },
  {
    code: "SUMMER20",
    type: "PERCENTAGE",
    value: 20,
    minOrderAmount: null,
    maxDiscount: 500_000,
    usageLimit: 100,
    active: false,
    expired: true,
  },
] as const;

// ───────────────────────── Demo users ─────────────────────────
export const ADMIN_USER = {
  id: "seed-user-admin",
  email: "admin@example.com",
  password: "Admin@12345",
  firstName: "مدیر",
  lastName: "فروشگاه",
  gender: "male",
};

export const CUSTOMER_PASSWORD = "Customer@123";

export const customers = [
  {
    id: "seed-user-1",
    email: "ali.rezaei@example.com",
    firstName: "علی",
    lastName: "رضایی",
    gender: "male",
  },
  {
    id: "seed-user-2",
    email: "sara.mohammadi@example.com",
    firstName: "سارا",
    lastName: "محمدی",
    gender: "female",
  },
  {
    id: "seed-user-3",
    email: "mohammad.hosseini@example.com",
    firstName: "محمد",
    lastName: "حسینی",
    gender: "male",
  },
  {
    id: "seed-user-4",
    email: "negar.karimi@example.com",
    firstName: "نگار",
    lastName: "کریمی",
    gender: "female",
  },
  {
    id: "seed-user-5",
    email: "reza.ahmadi@example.com",
    firstName: "رضا",
    lastName: "احمدی",
    gender: "male",
  },
  {
    id: "seed-user-6",
    email: "mahsa.sadeghi@example.com",
    firstName: "مهسا",
    lastName: "صادقی",
    gender: "female",
  },
] as const;

export const places = [
  {
    province: "تهران",
    city: "تهران",
    details: "خیابان ولیعصر، کوچه گلها، پلاک ۱۲، واحد ۳",
  },
  {
    province: "اصفهان",
    city: "اصفهان",
    details: "خیابان چهارباغ بالا، کوچه نسترن، پلاک ۸",
  },
  {
    province: "خراسان رضوی",
    city: "مشهد",
    details: "بلوار وکیل‌آباد، وکیل‌آباد ۲۷، پلاک ۴۱",
  },
  {
    province: "فارس",
    city: "شیراز",
    details: "خیابان زند، کوچه ۱۶، پلاک ۵، طبقه دوم",
  },
  {
    province: "آذربایجان شرقی",
    city: "تبریز",
    details: "خیابان امام، کوچه شهید رحیمی، پلاک ۲۳",
  },
  {
    province: "البرز",
    city: "کرج",
    details: "گوهردشت، فاز ۳، خیابان ۱۰۴ غربی، پلاک ۶",
  },
];

export const reviewPool: Record<
  number,
  { titles: string[]; comments: string[] }
> = {
  5: {
    titles: ["عالی", "کاملاً راضی‌ام", "پیشنهاد می‌کنم"],
    comments: [
      "کیفیت دوخت و پارچه عالیه و دقیقاً مطابق عکس بود.",
      "سایزبندی دقیق بود و بسته‌بندی هم تمیز رسید. راضی‌ام.",
      "برای قیمتش واقعاً ارزش داره، حتماً دوباره خرید می‌کنم.",
      "رنگ بعد از شست‌وشو هم ثابت موند و فرمش عوض نشد.",
    ],
  },
  4: {
    titles: ["خوب", "راضی‌ام"],
    comments: [
      "کلی راضی‌ام، فقط رنگش در واقعیت کمی روشن‌تر از عکس بود.",
      "جنس خوبه و ارسال هم سریع بود.",
      "قواره‌اش خوبه، فقط کاش پارچه کمی ضخیم‌تر بود.",
    ],
  },
  3: {
    titles: ["معمولی", "قابل قبول"],
    comments: [
      "معمولیه؛ نه عالی نه بد. برای قیمتش قابل قبوله.",
      "سایزش کمی کوچک‌تر از انتظارم بود.",
    ],
  },
  2: {
    titles: ["انتظارم بیشتر بود"],
    comments: ["پارچه انتظارم رو برآورده نکرد و کیفیت دوخت متوسط بود."],
  },
  1: {
    titles: ["ناراضی"],
    comments: ["متأسفانه با توضیحات محصول همخوانی نداشت."],
  },
};

export const adminReplies = [
  "ممنون از اعتماد و بازخورد شما.",
  "از اینکه خرید شما رضایت‌بخش بوده خوشحالیم.",
  "بازخورد شما را به تیم کیفیت منتقل می‌کنیم؛ سپاس.",
];
