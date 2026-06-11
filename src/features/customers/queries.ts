// ---------------------------------------------------------------------------
// Customer queries — order history for authenticated users
// ---------------------------------------------------------------------------

import db from "@/lib/db/client";

/**
 * Fetch all orders for a customer, most recent first.
 *
 * Includes items and payment info so the order history page can display
 * status badges, item counts, and totals without extra queries.
 *
 * Scoped to `userId` — a customer can only see their own orders.
 */
export async function getCustomerOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Fetch a single order by userId and order number.
 *
 * Returns `null` when the order doesn't exist or belongs to another
 * customer.  Uses `findFirst` (compound where) instead of `findUnique`
 * because the unique constraint is on `orderNumber` alone — we need the
 * userId check for security.
 *
 * Includes items, address, and payment so the existing `OrderDetail`
 * component can render without additional fetches.
 */
export async function getCustomerOrderByNumber(
  userId: string,
  orderNumber: string
) {
  return db.order.findFirst({
    where: { userId, orderNumber },
    include: {
      items: true,
      address: true,
      payment: true,
    },
  });
}
