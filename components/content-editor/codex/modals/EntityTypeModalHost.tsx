// EntityTypeModalHost.tsx
// Modal host for creating/editing custom entity types (codex-entity-types)

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { EntityTypeBuilder } from "../forms/EntityTypeBuilder";
import { useCodexSidebarStore } from "../store/codexSidebar.store";
import { useCodexTypeCommands } from "@/lib/content-editor/codex/commands/useCodexTypeCommands";
import { getEntityType } from "@/lib/content-editor/codex/api/entityTypeApi";
import { toast } from "@/lib/hooks/useToast";

export function EntityTypeModalHost({ projectId }: { projectId: string }) {
  const modalState = useCodexSidebarStore((s) => s.entityTypeModal);
  const close = useCodexSidebarStore((s) => s.closeEntityTypeModal);

  const commands = useCodexTypeCommands(projectId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typeDoc, setTypeDoc] = useState<any>(null);

  const isOpen = !!modalState;
  const isEdit = modalState?.mode === "edit";
  const typeId = modalState?.mode === "edit" ? modalState.typeId : null;

  useEffect(() => {
    if (!isOpen) return;
    if (!isEdit || !typeId) {
      setTypeDoc(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getEntityType(typeId)
      .then((doc) => setTypeDoc(doc))
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load Entity Type");
        close();
      })
      .finally(() => setLoading(false));
  }, [isOpen, isEdit, typeId, close]);

  const title = useMemo(() => {
    if (!isEdit) return "Create New Entity Type";
    return `Edit Entity Type${typeDoc?.name ? `: ${typeDoc.name}` : ""}`;
  }, [isEdit, typeDoc?.name]);

  const handleSubmit = useCallback(
    async (v: { name: string; slug: string; icon?: string; schema: any; uiSchema: any }) => {
      if (saving) return;
      setSaving(true);
      try {
        if (isEdit && typeId) {
          await commands.updateType(typeId, {
            name: v.name,
            slug: v.slug,
            icon: v.icon,
            schema: v.schema,
            uiSchema: v.uiSchema,
            version: (typeDoc?.version ?? 1) + 1,
          });
        } else {
          await commands.createType({
            project: parseInt(projectId, 10),
            name: v.name,
            slug: v.slug,
            icon: v.icon,
            schema: v.schema,
            uiSchema: v.uiSchema,
            version: 1,
            isSystem: false,
          });
        }
        close();
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || "Failed to save Entity Type");
      } finally {
        setSaving(false);
      }
    },
    [saving, isEdit, typeId, commands, projectId, close, typeDoc?.version]
  );

  const handleDelete = useCallback(async () => {
    if (!isEdit || !typeId || saving) return;
    setSaving(true);
    try {
      await commands.trashType(typeId);
      close();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete Entity Type");
    } finally {
      setSaving(false);
    }
  }, [isEdit, typeId, saving, commands, close]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen
      onClose={close}
      title={title}
      onDelete={isEdit ? handleDelete : undefined}
      deleteLabel={isEdit ? `Delete ${typeDoc?.name || "Entity Type"}` : undefined}
      isDeleting={saving}
    >
      {loading ? (
        <div className="p-8 text-center text-text-muted">Loading...</div>
      ) : (
        <div className="p-2">
          <EntityTypeBuilder
            initial={
              isEdit && typeDoc
                ? {
                    name: typeDoc.name,
                    slug: typeDoc.slug,
                    icon: typeDoc.icon,
                    schema: typeDoc.schema,
                    uiSchema: typeDoc.uiSchema,
                  }
                : undefined
            }
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={close}
          />
        </div>
      )}
    </Modal>
  );
}


