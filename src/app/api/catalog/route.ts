import { NextRequest, NextResponse } from "next/server";
import { getCatalogProducts } from "@/features/catalog/queries";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const sortParam = searchParams.get("sort");
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  // Validate sort
  const validSorts = ["price_asc", "price_desc", "name_asc"] as const;
  type ValidSort = (typeof validSorts)[number];
  const sort =
    sortParam && validSorts.includes(sortParam as ValidSort)
      ? (sortParam as ValidSort)
      : undefined;

  const page = pageParam ? parseInt(pageParam, 10) : undefined;
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  if (pageParam && (isNaN(page!) || page! < 1)) {
    return NextResponse.json(
      { error: "Invalid page parameter" },
      { status: 400 }
    );
  }
  if (limitParam && (isNaN(limit!) || limit! < 1 || limit! > 48)) {
    return NextResponse.json(
      { error: "Invalid limit parameter" },
      { status: 400 }
    );
  }

  try {
    const result = await getCatalogProducts({
      search,
      category,
      brand,
      sort,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Catalog API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
