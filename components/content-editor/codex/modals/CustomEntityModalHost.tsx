// CustomEntityModalHost.tsx
// Modal host for creating/editing custom entities (codex-entities) using JSON Schema + RJSF

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { SchemaEntityForm, SchemaEntityFormFooter } from "../forms/SchemaEntityForm";
import { useCodexSidebarStore } from "../store/codexSidebar.store";
import { getEntityType, getCustomEntity } from "@/lib/content-editor/codex/api/entityTypeApi";
import { useCodexCustomEntityCommands } from "@/lib/content-editor/codex/commands/useCodexCustomEntityCommands";
import { toast } from "@/lib/hooks/useToast";

const FORM_ID = "custom-entity-form";

export function CustomEntityModalHost({ projectId }: { projectId: string }) {
  const modalState = useCodexSidebarStore((s) => s.customEntityModal);
  const close = useCodexSidebarStore((s) => s.closeCustomEntityModal);

  const commands = useCodexCustomEntityCommands(projectId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typeDoc, setTypeDoc] = useState<any>(null);
  const [entityDoc, setEntityDoc] = useState<any>(null);

  const isOpen = !!modalState;
  const isEdit = modalState?.mode === "edit";
  const typeId = modalState?.typeId;
  const entityId = modalState?.mode === "edit" ? modalState.entityId : null;

  useEffect(() => {
    if (!isOpen || !typeId) return;
    setLoading(true);
    Promise.all([
      getEntityType(typeId),
      isEdit && entityId ? getCustomEntity(entityId) : Promise.resolve(null),
    ])
      .then(([entityType, entityDoc]) => {
        setTypeDoc(entityType);
        setEntityDoc(entityDoc);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load custom entity form");
        close();
      })
      .finally(() => setLoading(false));
  }, [isOpen, typeId, isEdit, entityId, close]);

  const title = useMemo(() => {
    const typeName = typeDoc?.name || "Entry";
    if (!isEdit) return `Create ${typeName}`;
    return `Edit ${typeName}${entityDoc?.name ? `: ${entityDoc.name}` : ""}`;
  }, [isEdit, typeDoc?.name, entityDoc?.name]);

  const initialData = useMemo(() => {
    if (!isEdit || !entityDoc) return undefined;
    // Return structured data matching SchemaEntityFormData
    return {
      name: entityDoc.name || "",
      description: entityDoc.description || "",
      imageMediaId: typeof entityDoc.image === "object" ? entityDoc.image?.id : entityDoc.image,
      data: entityDoc.data || {},
    };
  }, [isEdit, entityDoc]);

  const handleSubmit = useCallback(
    async (formData: { name: string; description?: string; imageMediaId?: number; data?: Record<string, any> }) => {
      if (!typeId || saving) return;
      setSaving(true);
      try {
        if (isEdit && entityId) {
          await commands.updateEntity(typeId, entityId, formData);
        } else {
          await commands.createEntity(typeId, formData);
        }
        close();
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || "Failed to save entry");
      } finally {
        setSaving(false);
      }
    },
    [typeId, saving, isEdit, entityId, commands, close]
  );

  const handleDelete = useCallback(async () => {
    if (!typeId || !isEdit || !entityId || saving) return;
    setSaving(true);
    try {
      await commands.trashEntity(typeId, entityId);
      close();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete entry");
    } finally {
      setSaving(false);
    }
  }, [typeId, isEdit, entityId, saving, commands, close]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen
      onClose={close}
      title={title}
      onDelete={isEdit ? handleDelete : undefined}
      deleteLabel={isEdit ? `Delete ${entityDoc?.name || "Entry"}` : undefined}
      isDeleting={saving}
      footer={
        !loading && (
          <SchemaEntityFormFooter
            formId={FORM_ID}
            saving={saving}
            onCancel={close}
            isEdit={isEdit}
          />
        )
      }
    >
      {loading ? (
        <div className="p-8 text-center text-text-muted">Loading...</div>
      ) : (
        <div className="p-2">
          <SchemaEntityForm
            schema={typeDoc?.schema || { type: "object", properties: {} }}
            initialData={initialData}
            typeName={typeDoc?.name}
            saving={saving}
            onSubmit={handleSubmit}
            projectId={projectId}
            isEdit={isEdit}
            entityId={entityId ?? undefined}
            formId={FORM_ID}
            hideFooter
          />

        </div>
      )}
    </Modal>
  );
}


