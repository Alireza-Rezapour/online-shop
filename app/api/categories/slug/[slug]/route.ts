import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlugService } from "@/services/category/category.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ slug: string }> };

// Public: used by /categories/[slug] pages
export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: Ctx) => {
    const { slug } = await params;
    return NextResponse.json(
      await getCategoryBySlugService(decodeURIComponent(slug)),
    );
  },
);
