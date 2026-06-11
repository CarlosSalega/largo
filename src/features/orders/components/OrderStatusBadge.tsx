"use client";

// ---------------------------------------------------------------------------
// OrderStatusBadge — visual badge mapping OrderStatus → Spanish label + color
// ---------------------------------------------------------------------------

import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

// ---- status map ------------------------------------------------------------

const STATUS_MAP = {
  PENDING: { label: "Pendiente de pago", color: "bg-amber-600/20 text-amber-400 border-amber-600/30" },
  PAID: { label: "Pagado", color: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" },
  CANCELLED: { label: "Cancelado", color: "bg-red-600/20 text-red-400 border-red-600/30" },
  REFUNDED: { label: "Reembolsado", color: "bg-slate-600/20 text-slate-400 border-slate-600/30" },
} as const satisfies Record<OrderStatus, { label: string; color: string }>;

// ---- component -------------------------------------------------------------

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const entry = STATUS_MAP[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        entry.color,
        className
      )}
    >
      {entry.label}
    </span>
  );
}
