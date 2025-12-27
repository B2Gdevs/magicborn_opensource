// lib/content-editor/codex/commands/useCodexTypeCommands.ts
// Command layer for Custom Types (codex-entity-types)

"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/useToast";
import { useCodexHistoryStore } from "../store/codexHistory.store";
import {
  createEntityType,
  updateEntityType,
  trashEntityType,
  restoreEntityType,
  getEntityType,
} from "../api/entityTypeApi";

export function useCodexTypeCommands(projectId: string) {
  const qc = useQueryClient();
  const history = useCodexHistoryStore();

  const invalidateTypes = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["codexEntityTypes", projectId] });
  }, [qc, projectId]);

  const createType = useCallback(
    async (payload: Record<string, unknown>) => {
      const created: any = await createEntityType(payload);
      invalidateTypes();

      history.push({
        label: `Create Type ${(payload.name as string) || ""}`.trim(),
        undo: async () => {
          await trashEntityType(String(created.id));
          invalidateTypes();
        },
        redo: async () => {
          await createEntityType(payload);
          invalidateTypes();
        },
        meta: { createdId: created.id, payload },
      });

      toast.success("Entity Type created", {
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
    [history, invalidateTypes]
  );

  const updateType = useCallback(
    async (typeId: string, nextPayload: Record<string, unknown>) => {
      const before: any = await getEntityType(typeId);
      await updateEntityType(typeId, nextPayload);
      invalidateTypes();

      history.push({
        label: `Update Type ${before.name || ""}`.trim(),
        undo: async () => {
          await updateEntityType(typeId, {
            name: before.name,
            slug: before.slug,
            icon: before.icon,
            schema: before.schema,
            uiSchema: before.uiSchema,
            version: before.version,
          });
          invalidateTypes();
        },
        redo: async () => {
          await updateEntityType(typeId, nextPayload);
          invalidateTypes();
        },
        meta: { typeId, before, nextPayload },
      });

      toast.success("Entity Type updated", {
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
    [history, invalidateTypes]
  );

  const trashType = useCallback(
    async (typeId: string) => {
      const before: any = await getEntityType(typeId);
      await trashEntityType(typeId);
      invalidateTypes();

      history.push({
        label: `Trash Type ${before.name || ""}`.trim(),
        undo: async () => {
          await restoreEntityType(typeId);
          invalidateTypes();
        },
        redo: async () => {
          await trashEntityType(typeId);
          invalidateTypes();
        },
        meta: { typeId, before },
      });

      toast.success("Entity Type moved to trash", {
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
    [history, invalidateTypes]
  );

  return { createType, updateType, trashType };
}


