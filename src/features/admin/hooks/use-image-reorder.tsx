// ---------------------------------------------------------------------------
// useImageReorder — client hook for drag-and-drop image reordering via @dnd-kit
// Returns the context providers + sortable items for clean component composition
// ---------------------------------------------------------------------------

"use client";

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import type { ReactNode } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface UseImageReorderOptions {
  /** Current ordered list of image keys */
  keys: string[];
  /** Called with the new order after drag ends */
  onChange: (newKeys: string[]) => void;
}

interface UseImageReorderReturn {
  /** Wrap your sortable grid inside this context */
  dndContext: (children: ReactNode) => ReactNode;
  sortableContext: (children: ReactNode) => ReactNode;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useImageReorder({
  keys,
  onChange,
}: UseImageReorderOptions): UseImageReorderReturn {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = keys.indexOf(String(active.id));
        const newIndex = keys.indexOf(String(over.id));

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(keys, oldIndex, newIndex);
          onChange(newOrder);
        }
      }
    },
    [keys, onChange],
  );

  const dndContext = useCallback(
    (children: ReactNode) => (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
    ),
    [sensors, handleDragEnd],
  );

  const sortableContext = useCallback(
    (children: ReactNode) => (
      <SortableContext items={keys} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    ),
    [keys],
  );

  return { dndContext, sortableContext };
}
