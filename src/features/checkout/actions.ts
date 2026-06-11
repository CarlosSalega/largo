"use server";

// ---------------------------------------------------------------------------
// Checkout Server Actions — order creation with atomic stock validation
// ---------------------------------------------------------------------------

import { nanoid } from "nanoid";
import type { Prisma } from "@prisma/client";
import db from "@/lib/db/client";
import type {
  ConfirmCheckoutInput,
  ConfirmCheckoutResult,
} from "./types";

// ---- generateOrderNumber ---------------------------------------------------

/**
 * Generate a unique 12-character NanoID for order numbers.
 * Retries on P2002 unique constraint collision (max 3 retries).
 */
export async function generateOrderNumber(): Promise<string> {
  return nanoid(12);
}

// ---- releaseExpiredStock ---------------------------------------------------

/**
 * Release stock from PENDING orders older than 30 minutes.
 * Uses raw SQL for efficiency — runs inside the checkout transaction.
 */
async function releaseExpiredStock(tx: Prisma.TransactionClient): Promise<void> {
  await tx.$queryRawUnsafe(`
    UPDATE "Product"
    SET stock = stock + oi.quantity
    FROM "OrderItem" oi
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE o.status = 'PENDING'
      AND o."createdAt" < NOW() - INTERVAL '30 minutes'
      AND oi."productId" = "Product".id
  `);
}

// ---- confirmCheckout -------------------------------------------------------

/**
 * Create an order atomically with stock validation.
 *
 * Steps inside prisma.$transaction:
 * 1. Validate stock for every product
 * 2. Release expired PENDING stock
 * 3. INSERT Order (with nanoid orderNumber)
 * 4. INSERT OrderItem[] (product snapshots)
 * 5. INSERT Address
 * 6. INSERT Payment (PENDING, mercadopago)
 * 7. UPDATE Product.stock -= quantity (WHERE stock >= quantity)
 * 8. Return { orderId, orderNumber }
 *
 * Cart clearing is handled client-side on success.
 */
export async function confirmCheckout(
  input: ConfirmCheckoutInput
): Promise<ConfirmCheckoutResult> {
  const { customer, shipping, cartItems } = input;

  // Guard: empty cart
  if (cartItems.length === 0) {
    return { error: "El carrito está vacío" };
  }

  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await db.$transaction(async (tx) => {
        // ---------------------------------------------------------------
        // 1. Validate stock for every product
        // ---------------------------------------------------------------
        const productIds = cartItems.map((item) => item.productId);

        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, stock: true, name: true },
        });

        const stockMap = new Map(products.map((p) => [p.id, p.stock]));

        for (const item of cartItems) {
          const currentStock = stockMap.get(item.productId);
          if (currentStock === undefined) {
            throw new StockError(
              `Producto "${item.name}" no encontrado`
            );
          }
          if (currentStock < item.quantity) {
            throw new StockError(
              `Producto "${item.name}" agotado`
            );
          }
        }

        // ---------------------------------------------------------------
        // 2. Release expired PENDING stock
        // ---------------------------------------------------------------
        await releaseExpiredStock(tx);

        // ---------------------------------------------------------------
        // 3. Generate order number (retried on P2002)
        // ---------------------------------------------------------------
        const orderNumber = await generateOrderNumber();

        // Subtotal and total (no shipping fees in MVP)
        const subtotal = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const total = subtotal;
        const currency = cartItems[0].currency;

        // ---------------------------------------------------------------
        // 3. INSERT Order
        // ---------------------------------------------------------------
        const order = await tx.order.create({
          data: {
            orderNumber,
            status: "PENDING",
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone ?? null,
            subtotal,
            total,
            userId: null, // guest checkout
          },
        });

        // ---------------------------------------------------------------
        // 4. INSERT OrderItem[] (product snapshots)
        // ---------------------------------------------------------------
        await tx.orderItem.createMany({
          data: cartItems.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.name,
            productPrice: item.price,
            productImage: item.image ?? null,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        });

        // ---------------------------------------------------------------
        // 5. INSERT Address
        // ---------------------------------------------------------------
        await tx.address.create({
          data: {
            orderId: order.id,
            street: shipping.street,
            city: shipping.city,
            state: shipping.state,
            zipCode: shipping.zipCode,
            country: shipping.country,
          },
        });

        // ---------------------------------------------------------------
        // 6. INSERT Payment (PENDING, mercadopago)
        // ---------------------------------------------------------------
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "mercadopago",
            status: "PENDING",
            amount: total,
            currency,
          },
        });

        // ---------------------------------------------------------------
        // 7. UPDATE Product.stock -= quantity (WHERE stock >= quantity)
        // ---------------------------------------------------------------
        for (const item of cartItems) {
          const updateResult = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          // If no rows updated, stock was insufficient (race condition)
          if (updateResult.count === 0) {
            throw new StockError(
              `Producto "${item.name}" agotado`
            );
          }
        }

        // ---------------------------------------------------------------
        // 8. Return success
        // ---------------------------------------------------------------
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
        };
      });

      // Transaction succeeded — return result
      return result;

    } catch (error) {
      // StockError: propagate as user-facing error
      if (error instanceof StockError) {
        return { error: error.message };
      }

      // P2002: unique constraint on orderNumber → retry
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        if (attempt < MAX_RETRIES - 1) continue;
        return {
          error:
            "Ocurrió un error al procesar tu pedido. Intentá de nuevo.",
        };
      }

      // Unknown error
      console.error("[confirmCheckout] Unexpected error:", error);
      return {
        error:
          "Ocurrió un error al procesar tu pedido. Intentá de nuevo.",
      };
    }
  }

  // Fallback (shouldn't reach here)
  return {
    error: "Ocurrió un error al procesar tu pedido. Intentá de nuevo.",
  };
}

// ---- Internal error class --------------------------------------------------

class StockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockError";
  }
}
