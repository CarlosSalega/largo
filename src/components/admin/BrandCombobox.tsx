"use client";

// ---------------------------------------------------------------------------
// BrandCombobox — searchable brand selector with inline creation
// Uses shadcn Command for the dropdown. No Popover dependency.
// Props: value, onChange, brands list. Calls createBrandInline action.
// ---------------------------------------------------------------------------

import { useState, useRef, useEffect, useCallback } from "react";
import { Check, Plus, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { createBrandInline } from "@/features/admin/actions";

// ── Types ────────────────────────────────────────────────────────────────────

interface Brand {
  id: string;
  name: string;
}

interface BrandComboboxProps {
  value: string | undefined;
  onChange: (brandId: string) => void;
  brands: Brand[];
  disabled?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function BrandCombobox({
  value,
  onChange,
  brands,
  disabled = false,
}: BrandComboboxProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedBrand = brands.find((b) => b.id === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setCreating(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setCreating(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const handleCreate = useCallback(async () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;

    setPending(true);
    try {
      const result = await createBrandInline(trimmed);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Marca creada");
        onChange(result.brandId);
        setNewBrandName("");
        setCreating(false);
        setOpen(false);
      }
    } catch {
      toast.error("Error al crear la marca.");
    } finally {
      setPending(false);
    }
  }, [newBrandName, onChange]);

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full justify-between"
      >
        {selectedBrand ? (
          <span className="truncate">{selectedBrand.name}</span>
        ) : (
          <span className="text-muted-foreground">Seleccionar marca</span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </Button>

      {/* ── Dropdown ───────────────────────────────────────────────────── */}
      {open && !creating && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
          <Command>
            <CommandInput placeholder="Buscar marca..." />
            <CommandList>
              <CommandEmpty>No se encontraron marcas.</CommandEmpty>
              <CommandGroup>
                {brands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={brand.name}
                    onSelect={() => {
                      onChange(brand.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        brand.id === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {brand.name}
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Divider + create option */}
              <div className="-mx-1 h-px bg-border" />
              <CommandItem
                onSelect={() => {
                  setCreating(true);
                }}
                className="text-primary"
              >
                <Plus className="size-4" />
                Crear nueva marca
              </CommandItem>
            </CommandList>
          </Command>
        </div>
      )}

      {/* ── Inline create input ─────────────────────────────────────────── */}
      {open && creating && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-3 shadow-lg">
          <p className="mb-2 text-sm font-medium text-popover-foreground">
            Nueva marca
          </p>
          <div className="flex gap-2">
            <Input
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Nombre de la marca"
              disabled={pending}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setCreating(false);
                  setNewBrandName("");
                }
              }}
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCreate}
              disabled={pending || newBrandName.trim().length === 0}
            >
              {pending ? "Creando..." : "Crear"}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setNewBrandName("");
            }}
            className="mt-2 text-xs text-muted-foreground transition-colors hover:text-card-foreground"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
