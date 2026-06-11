// ---------------------------------------------------------------------------
// Admin queries — product list, categories, brands, order detail
// Server-side only (RSC / Server Actions). No auth check — caller responsible.
// ---------------------------------------------------------------------------

import db from "@/lib/db/client";
import type { Prisma } from "@prisma/client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface GetAdminProductsParams {
  page?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
  stock?: "in_stock" | "out_of_stock" | "all";
  categoryId?: string;
  brandId?: string;
  limit?: number;
}

// ── Product List (paginated, filterable) ─────────────────────────────────────

export async function getAdminProducts(
  params: GetAdminProductsParams = {},
) {
  const {
    page = 1,
    search,
    status = "all",
    stock = "all",
    categoryId,
    brandId,
    limit = 20,
  } = params;

  const where: Prisma.ProductWhereInput = {};

  // Search by name (case-insensitive)
  if (search && search.trim().length > 0) {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }

  // Active / Inactive filter
  if (status === "active") {
    where.active = true;
    where.deletedAt = null;
  } else if (status === "inactive") {
    where.OR = [{ active: false }, { deletedAt: { not: null } }];
  }

  // Stock level filter
  if (stock === "in_stock") {
    where.stock = { gt: 0 };
  } else if (stock === "out_of_stock") {
    where.stock = 0;
  }

  // Category / Brand filters
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (brandId) {
    where.brandId = brandId;
  }

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    totalCount,
    page,
  };
}

// ── Single Product (full includes) ───────────────────────────────────────────

export async function getAdminProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: "asc" } },
    },
  });
}

// ── All Categories (for select dropdowns) ────────────────────────────────────

export async function getAdminCategories() {
  return db.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

// ── Category List (paginated, searchable) ────────────────────────────────────

export interface GetAdminCategoriesParams {
  page?: number;
  search?: string;
  limit?: number;
}

export async function getAdminCategoriesList(
  params: GetAdminCategoriesParams = {},
) {
  const { page = 1, search, limit = 20 } = params;

  const where: Prisma.CategoryWhereInput = {};

  if (search && search.trim().length > 0) {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }

  const [categories, totalCount] = await Promise.all([
    db.category.findMany({
      where,
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.category.count({ where }),
  ]);

  return {
    categories,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    totalCount,
    page,
  };
}

// ── Single Category (for edit page) ──────────────────────────────────────────

export async function getAdminCategoryById(id: string) {
  return db.category.findUnique({
    where: { id },
  });
}

// ── All Active Brands (for BrandCombobox) ────────────────────────────────────

export async function getAdminBrands() {
  return db.brand.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

// ── Orders List (paginated, filterable) ──────────────────────────────────────

export interface GetAdminOrdersParams {
  page?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
}

export async function getAdminOrdersList(
  params: GetAdminOrdersParams = {},
) {
  const {
    page = 1,
    status,
    dateFrom,
    dateTo,
    search,
    limit = 20,
  } = params;

  const where: Prisma.OrderWhereInput = {};

  // Status filter
  if (
    status &&
    ["PENDING", "PAID", "CANCELLED", "REFUNDED"].includes(status)
  ) {
    where.status = status as "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      // End of the selected day
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  // Search by orderNumber or customerEmail
  if (search && search.trim().length > 0) {
    const trimmedSearch = search.trim();
    where.OR = [
      { orderNumber: { contains: trimmedSearch, mode: "insensitive" } },
      { customerEmail: { contains: trimmedSearch, mode: "insensitive" } },
    ];
  }

  const [orders, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        payment: { select: { status: true, provider: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  return {
    orders,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    totalCount,
    page,
  };
}

// ── Order Detail (for admin review) ──────────────────────────────────────────

export async function getAdminOrderDetail(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
      address: true,
      payment: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
