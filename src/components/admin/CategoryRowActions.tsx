"use client";

// ---------------------------------------------------------------------------
// CategoryRowActions — client-side toggle switches & archive button per category row
// Used in the category list table. Calls server actions, shows sonner toasts.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  toggleCategoryFeatured,
  archiveCategory,
} from "@/features/admin/actions";

// ── Types ────────────────────────────────────────────────────────────────────

interface CategoryRowActionsProps {
  categoryId: string;
  featured: boolean;
  active: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function CategoryRowActions({
  categoryId,
  featured,
  active,
}: CategoryRowActionsProps) {
  const [featuredState, setFeaturedState] = useState(featured);
  const [activeState, setActiveState] = useState(active);
  const [archiving, setArchiving] = useState(false);
  const [pendingFeatured, setPendingFeatured] = useState(false);

  async function handleToggleFeatured(checked: boolean) {
    setPendingFeatured(true);
    const prev = featuredState;
    setFeaturedState(checked);

    const result = await toggleCategoryFeatured(categoryId, checked);
    if ("error" in result) {
      setFeaturedState(prev);
      toast.error(result.error);
    }
    setPendingFeatured(false);
  }

  async function handleArchive() {
    if (
      !confirm("¿Archivar esta categoría? No se mostrará en la tienda.")
    )
      return;

    setArchiving(true);
    const result = await archiveCategory(categoryId);
    setArchiving(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Categoría archivada");
      setActiveState(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={featuredState}
        onCheckedChange={handleToggleFeatured}
        disabled={pendingFeatured}
        aria-label={
          featuredState ? "Desmarcar destacado" : "Marcar destacado"
        }
      />
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={handleArchive}
        disabled={archiving || !activeState}
        className="text-muted-foreground hover:text-destructive"
      >
        {archiving ? "..." : "Archivar"}
      </Button>
    </div>
  );
}
