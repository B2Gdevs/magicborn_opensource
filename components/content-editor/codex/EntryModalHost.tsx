// EntryModalHost.tsx
// Single modal host that renders entry forms based on registry
// Reads from Zustand store for trigger state

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/lib/hooks/useToast";
import { useCodexSidebarStore } from "./store/codexSidebar.store";
import "@/lib/content-editor/codex/modals/systemEntryModals";
import {
  getEntryModalConfig,
  getEntryTypeMetadata,
  type EntryModalConfig,
} from "@/lib/content-editor/codex/modals/entryModalRegistry";
import { EntryType, CodexCategory, CATEGORY_TO_ENTRY_TYPE } from "@/lib/content-editor/constants";
import { trashEntry } from "@/lib/content-editor/codex/api/codexApi";
import { useCodexHistoryStore } from "@/lib/content-editor/codex/store/codexHistory.store";

interface EntryModalHostProps {
  projectId: string;
}

export function EntryModalHost({ projectId }: EntryModalHostProps) {
  const queryClient = useQueryClient();
  const { push: pushHistory } = useCodexHistoryStore();

  // Store state
  const triggerNewEntry = useCodexSidebarStore((s) => s.triggerNewEntry);
  const editEntry = useCodexSidebarStore((s) => s.editEntry);
  const closeNewEntry = useCodexSidebarStore((s) => s.clearNewEntryTrigger);
  const closeEditEntry = useCodexSidebarStore((s) => s.closeEditEntry);

  // Local state
  const [activeModal, setActiveModal] = useState<EntryType | null>(null);
  const [editData, setEditData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<EntryModalConfig | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Handle new entry trigger
  useEffect(() => {
    if (triggerNewEntry) {
      const entryType =
        (CATEGORY_TO_ENTRY_TYPE as any)[triggerNewEntry] ?? (triggerNewEntry as EntryType);
      const config = getEntryModalConfig(entryType as EntryType);
      if (config) {
        setCurrentConfig(config);
        setActiveModal(entryType as EntryType);
        setEditData(null);
      }
      closeNewEntry();
    }
  }, [triggerNewEntry, closeNewEntry]);

  // Handle edit entry trigger
  useEffect(() => {
    if (editEntry) {
      const entryType =
        CATEGORY_TO_ENTRY_TYPE[editEntry.categoryId] ?? (editEntry.categoryId as unknown as EntryType);
      const config = getEntryModalConfig(entryType);

      if (config) {
        setLoading(true);
        setCurrentConfig(config);
        setActiveModal(entryType);

        const { collection } = getEntryTypeMetadata(entryType);
        fetch(`/api/payload/${collection}/${editEntry.entryId}`)
          .then((res) => res.json())
          .then((data) => {
            setEditData(data);
          })
          .catch((err) => {
            console.error("Failed to load entry:", err);
            toast.error("Failed to load entry for editing");
            closeModal();
          })
          .finally(() => setLoading(false));
      }
    }
  }, [editEntry]);

  // Invalidate category queries
  const invalidateCategory = useCallback(
    (category: CodexCategory) => {
      queryClient.invalidateQueries({
        queryKey: ["codexEntries", category, projectId],
      });
    },
    [queryClient, projectId]
  );

  // Close modal and reset state
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setEditData(null);
    setCurrentConfig(null);
    setSaving(false);
    setIsDeleting(false);
    closeEditEntry();
  }, [closeEditEntry]);

  // Handle save
  const handleSave = useCallback(
    async (formData: unknown) => {
      console.log("[EntryModalHost] handleSave called with formData:", formData);
      console.log("[EntryModalHost] currentConfig:", currentConfig?.displayName, "activeModal:", activeModal, "saving:", saving);
      if (!currentConfig || !activeModal || saving) {
        console.log("[EntryModalHost] Early return - missing config/modal or already saving");
        return;
      }

      setSaving(true);
      try {
        const { collection, category } = getEntryTypeMetadata(activeModal);
        const isEdit = !!editData;
        const payloadData = currentConfig.formToPayload(formData, projectId);
        console.log("[EntryModalHost] collection:", collection, "category:", category, "isEdit:", isEdit);
        console.log("[EntryModalHost] payloadData:", payloadData);

        const url = isEdit
          ? `/api/payload/${collection}/${(editData as { id: number }).id}`
          : `/api/payload/${collection}`;

        const res = await fetch(url, {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payloadData,
            // All collections now require project field
            project: parseInt(projectId, 10),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.errors?.[0]?.message ||
              err.error ||
              err.message ||
              `Failed to ${isEdit ? "update" : "create"} entry`
          );
        }

        invalidateCategory(category);
        closeModal();
        toast.success(`${currentConfig.displayName} ${isEdit ? "updated" : "created"}`);
      } catch (error) {
        console.error("Save error:", error);
        toast.error(
          `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      } finally {
        setSaving(false);
      }
    },
    [currentConfig, activeModal, editData, projectId, invalidateCategory, closeModal, saving]
  );

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!currentConfig || !activeModal || !editData || isDeleting) return;

    const entryId = (editData as { id: number }).id;
    const entryName = (editData as { name?: string }).name;

    setIsDeleting(true);
    try {
      const { collection, category } = getEntryTypeMetadata(activeModal);
      await trashEntry({ collection, id: entryId.toString() });

      // Push to history (generic op)
      const displayName = entryName || currentConfig.displayName || "entry";
      pushHistory({
        label: `Trash ${displayName}`,
        undo: async () => {
          await fetch(`/api/payload/${collection}/${entryId}/restore`, { method: "POST" });
          invalidateCategory(category);
        },
        redo: async () => {
          await trashEntry({ collection, id: entryId.toString() });
          invalidateCategory(category);
        },
        meta: { collection, category, entryId, entryName },
      });

      invalidateCategory(category);
      closeModal();
      toast.success(`${currentConfig.displayName} deleted`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        `Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsDeleting(false);
    }
  }, [currentConfig, activeModal, editData, isDeleting, pushHistory, invalidateCategory, closeModal]);

  // Submit form programmatically
  const submitForm = useCallback(() => {
    const form = formRef.current || document.querySelector(`form[data-entry-form]`);
    if (form) {
      if ("requestSubmit" in form) {
        (form as HTMLFormElement).requestSubmit();
      }
    }
  }, []);

  // Don't render if no config
  if (!activeModal || !currentConfig) {
    return null;
  }

  const { FormComponent, FooterComponent } = currentConfig;
  const isEdit = !!editData;
  const title = `${isEdit ? "Edit" : "New"} ${currentConfig.displayName}`;

  // Get initial values
  const initialValues = isEdit
    ? currentConfig.payloadToForm(editData)
    : currentConfig.defaultValues;

  // Get editEntryId for forms that need it
  const editEntryId = isEdit && editData && typeof editData === "object" && "id" in editData
    ? typeof (editData as { id: unknown }).id === "number"
      ? (editData as { id: number }).id
      : typeof (editData as { id: unknown }).id === "string"
        ? parseInt((editData as { id: string }).id, 10) || undefined
        : undefined
    : undefined;

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title={title}
      onDelete={isEdit ? handleDelete : undefined}
      deleteLabel={`Delete ${currentConfig.displayName}`}
      isDeleting={isDeleting}
      footer={
        FooterComponent ? (
          <FooterComponent
            isEdit={isEdit}
            saving={saving}
            onCancel={closeModal}
            onSubmit={submitForm}
          />
        ) : undefined
      }
    >
      {loading ? (
        <div className="p-8 text-center text-text-muted">Loading...</div>
      ) : (
        <FormComponent
          initialValues={initialValues}
          isEdit={isEdit}
          onSubmit={handleSave}
          onCancel={closeModal}
          saving={saving}
          projectId={projectId}
          editEntryId={editEntryId}
        />
      )}
    </Modal>
  );
}

