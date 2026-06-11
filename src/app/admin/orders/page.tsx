// ---------------------------------------------------------------------------
// Admin order list — paginated table with status, date, and search filters
// Server Component — fetches data via URL searchParams
// ---------------------------------------------------------------------------

import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { getAdminOrdersList } from "@/features/admin/queries";
import { formatPrice } from "@/lib/formatPrice";

// ── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Órdenes | Admin | Largo",
  robots: { index: false, follow: false },
};

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function paymentBadge(status: string | undefined) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const variant =
    status === "APPROVED"
      ? "secondary"
      : status === "REFUNDED"
        ? "outline"
        : status === "REJECTED"
          ? "destructive"
          : "secondary";

  const label =
    status === "APPROVED"
      ? "Aprobado"
      : status === "REFUNDED"
        ? "Reembolsado"
        : status === "REJECTED"
          ? "Rechazado"
          : "Pendiente";

  return <Badge variant={variant}>{label}</Badge>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const status =
    typeof sp.status === "string" && sp.status.length > 0
      ? sp.status
      : undefined;
  const dateFrom =
    typeof sp.dateFrom === "string" && sp.dateFrom.length > 0
      ? sp.dateFrom
      : undefined;
  const dateTo =
    typeof sp.dateTo === "string" && sp.dateTo.length > 0
      ? sp.dateTo
      : undefined;
  const search =
    typeof sp.search === "string" && sp.search.length > 0
      ? sp.search
      : undefined;

  const { orders, totalPages } = await getAdminOrdersList({
    page,
    status,
    dateFrom,
    dateTo,
    search,
  });

  // Build params for pagination links (preserve current filters)
  const linkParams = new URLSearchParams();
  if (status) linkParams.set("status", status);
  if (dateFrom) linkParams.set("dateFrom", dateFrom);
  if (dateTo) linkParams.set("dateTo", dateTo);
  if (search) linkParams.set("search", search);

  function pageHref(p: number) {
    const params = new URLSearchParams(linkParams);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <h1 className="text-2xl font-bold text-card-foreground">Órdenes</h1>

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <form method="GET" className="flex flex-wrap items-end gap-3">
        {/* Status dropdown */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-status"
            className="text-xs font-medium text-muted-foreground"
          >
            Estado
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={status ?? ""}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-dateFrom"
            className="text-xs font-medium text-muted-foreground"
          >
            Desde
          </label>
          <Input
            id="filter-dateFrom"
            name="dateFrom"
            type="date"
            defaultValue={dateFrom ?? ""}
            className="w-36"
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-dateTo"
            className="text-xs font-medium text-muted-foreground"
          >
            Hasta
          </label>
          <Input
            id="filter-dateTo"
            name="dateTo"
            type="date"
            defaultValue={dateTo ?? ""}
            className="w-36"
          />
        </div>

        {/* Search */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="filter-search"
            className="text-xs font-medium text-muted-foreground"
          >
            Buscar
          </label>
          <Input
            id="filter-search"
            name="search"
            type="search"
            placeholder="# orden o email del cliente"
            defaultValue={search ?? ""}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" variant="outline" size="sm">
            <Search data-icon="inline-start" />
            Filtrar
          </Button>
          {(status || dateFrom || dateTo || search) && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">Limpiar</Link>
            </Button>
          )}
        </div>
      </form>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16">
          <p className="text-muted-foreground">No se encontraron órdenes</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden #</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    {/* Order number */}
                    <TableCell className="font-mono font-medium">
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="text-card-foreground transition-colors hover:text-primary"
                      >
                        #{order.orderNumber}
                      </Link>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <p className="text-sm font-medium text-card-foreground">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerEmail}
                      </p>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(order.createdAt, "dd/MM/yyyy", { locale: es })}
                    </TableCell>

                    {/* Items count */}
                    <TableCell className="text-center">
                      <Badge variant="secondary">{order._count.items}</Badge>
                    </TableCell>

                    {/* Total */}
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(
                        order.total,
                        order.payment?.provider
                          ? order.payment.provider === "mercadopago"
                            ? "ARS"
                            : "USD"
                          : "ARS",
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>

                    {/* Payment */}
                    <TableCell>
                      {paymentBadge(order.payment?.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Button asChild variant="outline" size="xs">
                        <Link href={`/admin/orders/${order.orderNumber}`}>
                          Ver
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={pageHref(page - 1)}
                      text="Anterior"
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .map((p, i, arr) => {
                    const showEllipsis =
                      i > 0 && p - (arr[i - 1] ?? 0) > 1;

                    return (
                      <PaginationItem key={p}>
                        {showEllipsis && (
                          <span className="flex size-8 items-center justify-center text-muted-foreground">
                            ...
                          </span>
                        )}
                        <PaginationLink
                          href={pageHref(p)}
                          isActive={p === page}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={pageHref(page + 1)}
                      text="Siguiente"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
