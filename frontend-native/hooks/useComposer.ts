import { useCallback, useState } from "react";

export type ComposerMode = "create" | "edit";

export function useComposer<T>() {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<ComposerMode>("create");
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = useCallback(() => {
    setMode("create");
    setEditingItem(null);
    setIsVisible(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setMode("edit");
    setEditingItem(item);
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setIsVisible(false);
    // Reset item để chuẩn bị cho lần mở sau
    setEditingItem(null);
  }, [isSubmitting]);

  return {
    isVisible,
    mode,
    editingItem,
    isSubmitting,
    setIsSubmitting,
    openCreate,
    openEdit,
    close,
  };
}