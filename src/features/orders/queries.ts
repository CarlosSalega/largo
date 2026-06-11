// ---------------------------------------------------------------------------
// Order queries — stock release, order lookup
// ---------------------------------------------------------------------------

import db from "@/lib/db/client";

// ---- releaseStock ----------------------------------------------------------

/**
 * Atomically release reserved stock for all items in a cancelled order.
 *
 * Increments `Product.stock` by the quantity reserved in each `OrderItem`
 * for the given order. Runs inside a Prisma transaction for atomicity.
 *
 * Called from the MercadoPago webhook handler when a payment is rejected
 * or cancelled.
 */
export async function releaseStock(orderId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.$queryRawUnsafe(
      `
      UPDATE "Product"
      SET stock = stock + oi.quantity
      FROM "OrderItem" oi
      WHERE oi."orderId" = $1
        AND oi."productId" = "Product".id
      `,
      orderId
    );
  });
}

// ---- getOrderByNumber ------------------------------------------------------

/**
 * Fetch a complete order by its public order number.
 *
 * Includes items (product snapshots), shipping address, and payment info.
 * Returns `null` when no order matches the given order number.
 *
 * Used by the public order detail page and checkout success/failure pages.
 */
export async function getOrderByNumber(orderNumber: string) {
  return db.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      address: true,
      payment: true,
    },
  });
}
