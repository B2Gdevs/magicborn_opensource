// lib/content-editor/codex/commands/useCodexCustomEntityCommands.ts
// Command layer for Custom Entities (codex-entities)

"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/useToast";
import { useCodexHistoryStore } from "../store/codexHistory.store";
import {
  createCustomEntity,
  updateCustomEntity,
  trashCustomEntity,
  restoreCustomEntity,
  getCustomEntity,
} from "../api/entityTypeApi";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function useCodexCustomEntityCommands(projectId: string) {
  const qc = useQueryClient();
  const history = useCodexHistoryStore();

  const invalidateEntities = useCallback(
    (typeId: string) => {
      qc.invalidateQueries({ queryKey: ["codexEntities", projectId, typeId] });
    },
    [qc, projectId]
  );

  const createEntity = useCallback(
    async (
      typeId: string,
      formData: {
        name: string;
        description?: string;
        imageMediaId?: number;
        data?: Record<string, any>;
      }
    ) => {
      const name = String(formData?.name || "Untitled");
      const slug = slugify(name);

      const payload = {
        project: parseInt(projectId, 10),
        type: parseInt(typeId, 10),
        name,
        slug,
        description: formData.description || "",
        image: formData.imageMediaId || null, // Payload upload field
        data: formData.data || {},
      } as Record<string, unknown>;

      const created: any = await createCustomEntity(payload);
      invalidateEntities(typeId);

      history.push({
        label: `Create ${name}`,
        undo: async () => {
          await trashCustomEntity(String(created.id));
          invalidateEntities(typeId);
        },
        redo: async () => {
          await createCustomEntity(payload);
          invalidateEntities(typeId);
        },
        meta: { createdId: created.id, typeId, payload },
      });

      toast.success("Entry created", {
        action: {
          label: "Undo",
          onClick: async () => {
            const op = history.undo();
            if (!op) return;
            await op.undo();
          },
        },
      });

      return created;
    },
    [history, invalidateEntities, projectId]
  );

  const updateEntity = useCallback(
    async (
      typeId: string,
      entityId: string,
      formData: {
        name: string;
        description?: string;
        imageMediaId?: number;
        data?: Record<string, any>;
      }
    ) => {
      const before: any = await getCustomEntity(entityId);
      const name = String(formData?.name || before.name || "Untitled");
      const slug = slugify(name);

      const nextPayload: Record<string, unknown> = {
        name,
        slug,
        description: formData.description || "",
        image: formData.imageMediaId || null, // Payload upload field
        data: formData.data || {},
      };

      await updateCustomEntity(entityId, nextPayload);
      invalidateEntities(typeId);

      history.push({
        label: `Update ${name}`,
        undo: async () => {
          await updateCustomEntity(entityId, {
            name: before.name,
            slug: before.slug,
            description: before.description,
            image: before.image,
            data: before.data,
            tags: before.tags,
            type: typeof before.type === "object" ? (before.type as any).id : before.type,
            project: typeof before.project === "object" ? (before.project as any).id : before.project,
          });
          invalidateEntities(typeId);
        },
        redo: async () => {
          await updateCustomEntity(entityId, nextPayload);
          invalidateEntities(typeId);
        },
        meta: { typeId, entityId, before, nextPayload },
      });

      toast.success("Entry updated", {
        action: {
          label: "Undo",
          onClick: async () => {
            const op = history.undo();
            if (!op) return;
            await op.undo();
          },
        },
      });
    },
    [history, invalidateEntities]
  );

  const trashEntity = useCallback(
    async (typeId: string, entityId: string) => {
      const before: any = await getCustomEntity(entityId);
      await trashCustomEntity(entityId);
      invalidateEntities(typeId);

      history.push({
        label: `Trash ${before.name || "entry"}`,
        undo: async () => {
          await restoreCustomEntity(entityId);
          invalidateEntities(typeId);
        },
        redo: async () => {
          await trashCustomEntity(entityId);
          invalidateEntities(typeId);
        },
        meta: { typeId, entityId, before },
      });

      toast.success("Entry moved to trash", {
        action: {
          label: "Undo",
          onClick: async () => {
            const op = history.undo();
            if (!op) return;
            await op.undo();
          },
        },
      });
    },
    [history, invalidateEntities]
  );

  return { createEntity, updateEntity, trashEntity };
}


