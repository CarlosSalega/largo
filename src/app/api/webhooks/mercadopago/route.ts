// ---------------------------------------------------------------------------
// MercadoPago webhook receiver
//
// POST /api/webhooks/mercadopago
//
// Receives payment notifications from MercadoPago, validates the signature,
// queries the definitive payment status from MP's API, and synchronises the
// Order + Payment records accordingly.
// ---------------------------------------------------------------------------

import { type NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import db from "@/lib/db/client";
import { getMPPayment } from "@/features/payments/mercadopago";
import { validateSignature } from "@/features/payments/utils";
import { releaseStock } from "@/features/orders/queries";

export const runtime = "nodejs";

// ---- POST handler ----------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Read headers ---------------------------------------------------------
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  // 2. Parse body -----------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body.data as Record<string, unknown> | undefined;
  const paymentId = data?.id as string | undefined;
  const eventId = body.id as string | number | undefined;
  const type = (body.type as string) || "payment";

  if (!paymentId || !eventId) {
    return NextResponse.json(
      { error: "Missing data.id or event id" },
      { status: 400 }
    );
  }

  // 3. Validate signature ---------------------------------------------------
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] MERCADOPAGO_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Configuration error" },
      { status: 500 }
    );
  }

  if (!validateSignature(xSignature, xRequestId, paymentId, secret)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  // 4. Idempotency ----------------------------------------------------------
  try {
    await db.webhookEvent.create({
      data: {
        eventId: String(eventId),
        type,
        payload: body as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    // P2002: duplicate eventId — already processed, return idempotent 200
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }
    throw error;
  }

  // 5. Query MercadoPago for definitive payment status -----------------------
  let mpPayment: { status?: string; external_reference?: string; id?: number };
  try {
    const response = await getMPPayment(paymentId);
    mpPayment = response;
  } catch {
    // Payment not found or MP API error
    return NextResponse.json(
      { error: "Payment not found" },
      { status: 404 }
    );
  }

  const mpStatus = mpPayment.status ?? "";
  const orderNumber = mpPayment.external_reference;

  if (!orderNumber) {
    return NextResponse.json(
      { error: "Missing external_reference in MP payment" },
      { status: 404 }
    );
  }

  // 6. Find Order + Payment in our database ----------------------------------
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { payment: true },
  });

  if (!order || !order.payment) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  const payment = order.payment;

  // 7. Map MP status → Order + Payment updates --------------------------------
  if (mpStatus === "approved") {
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "APPROVED",
          providerPaymentId: String(mpPayment.id ?? paymentId),
          paidAt: new Date(),
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    });
  } else if (mpStatus === "rejected" || mpStatus === "cancelled") {
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "REJECTED",
          providerPaymentId: String(mpPayment.id ?? paymentId),
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    });

    // Release reserved stock
    await releaseStock(order.id);
  }
  // For other statuses (e.g. "pending", "in_process") we do nothing —
  // MercadoPago will send another webhook when the status changes.

  // 8. Mark webhook event as processed ---------------------------------------
  await db.webhookEvent.update({
    where: { eventId: String(eventId) },
    data: {
      processed: true,
      processedAt: new Date(),
    },
  });

  // 9. Return 200 ------------------------------------------------------------
  return NextResponse.json({ status: "ok" });
}
