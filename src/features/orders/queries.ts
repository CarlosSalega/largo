// ---------------------------------------------------------------------------
// Order queries — stock release, order lookup
// ---------------------------------------------------------------------------

import type { Prisma } from "@prisma/client";
import db from "@/lib/db/client";

// ---- releaseStock ----------------------------------------------------------

/**
 * Atomically release reserved stock for all items in a cancelled order.
 *
 * Increments `Product.stock` by the quantity reserved in each `OrderItem`
 * for the given order.
 *
 * When called from within an existing transaction, pass the `tx` client to
 * avoid nested transactions. Otherwise, runs inside its own transaction.
 *
 * Called from the MercadoPago webhook handler when a payment is rejected
 * or cancelled.
 */
export async function releaseStock(
  orderId: string,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? db;
  await client.$queryRawUnsafe(
    `
    UPDATE "Product"
    SET stock = stock + oi.quantity
    FROM "OrderItem" oi
    WHERE oi."orderId" = $1
      AND oi."productId" = "Product".id
    `,
    orderId
  );
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
