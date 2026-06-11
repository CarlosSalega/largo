"use client";

// ---------------------------------------------------------------------------
// ProductRowActions — client-side toggle switches & archive button per product row
// Used in the product list table. Calls server actions, shows sonner toasts.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  toggleProductFeatured,
  toggleProductActive,
  archiveProduct,
} from "@/features/admin/actions";

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductRowActionsProps {
  productId: string;
  featured: boolean;
  active: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ProductRowActions({
  productId,
  featured,
  active,
}: ProductRowActionsProps) {
  const [featuredState, setFeaturedState] = useState(featured);
  const [activeState, setActiveState] = useState(active);
  const [archiving, setArchiving] = useState(false);
  const [pending, setPending] = useState<"featured" | "active" | null>(null);

  async function handleToggleFeatured(checked: boolean) {
    setPending("featured");
    const prev = featuredState;
    setFeaturedState(checked);

    const result = await toggleProductFeatured(productId, checked);
    if ("error" in result) {
      setFeaturedState(prev);
      toast.error(result.error);
    }
    setPending(null);
  }

  async function handleToggleActive(checked: boolean) {
    setPending("active");
    const prev = activeState;
    setActiveState(checked);

    const result = await toggleProductActive(productId, checked);
    if ("error" in result) {
      setActiveState(prev);
      toast.error(result.error);
    }
    setPending(null);
  }

  async function handleArchive() {
    if (!confirm("¿Archivar este producto? No se mostrará en la tienda.")) return;

    setArchiving(true);
    const result = await archiveProduct(productId);
    setArchiving(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Producto archivado");
      setActiveState(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={featuredState}
        onCheckedChange={handleToggleFeatured}
        disabled={pending === "featured"}
        aria-label={featuredState ? "Desmarcar destacado" : "Marcar destacado"}
      />
      <Switch
        checked={activeState}
        onCheckedChange={handleToggleActive}
        disabled={pending === "active" || archiving}
        aria-label={activeState ? "Desactivar producto" : "Activar producto"}
      />
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={handleArchive}
        disabled={archiving}
        className="text-muted-foreground hover:text-destructive"
      >
        {archiving ? "..." : "Archivar"}
      </Button>
    </div>
  );
}
