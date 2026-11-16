import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getCollectionBySlug } from "@/services/collection/collection.service";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: Ctx) => {
    const { slug } = await params;
    // Persian slugs arrive percent-encoded
    return NextResponse.json(
      await getCollectionBySlug(decodeURIComponent(slug)),
    );
  },
);
