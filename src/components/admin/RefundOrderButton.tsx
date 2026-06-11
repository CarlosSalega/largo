"use client";

// ---------------------------------------------------------------------------
// RefundOrderButton — AlertDialog-wrapped button for PAID→REFUNDED transition
// ---------------------------------------------------------------------------

import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { refundOrder } from "@/features/admin/actions";

interface RefundOrderButtonProps {
  orderId: string;
}

export function RefundOrderButton({ orderId }: RefundOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRefund() {
    setLoading(true);
    try {
      const result = await refundOrder(orderId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Reembolso procesado");
        setOpen(false);
      }
    } catch {
      toast.error("Error al procesar el reembolso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Reembolsar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar reembolso</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de reembolsar esta orden? Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRefund}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Procesando..." : "Sí, reembolsar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
