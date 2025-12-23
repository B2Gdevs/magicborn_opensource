// lib/ai/prompts.ts
// Helper functions to build hierarchical AI prompts from Payload CMS data

import { getPayload } from "payload";
import config from "@payload-config";

async function getPayloadClient() {
  return await getPayload({ config });
}

export interface PromptContext {
  projectId?: string | number;
  pageId?: string | number;
  chapterId?: string | number;
  actId?: string | number;
  entityId?: string | number;
  entityType?: "characters" | "lore" | "locations" | "creatures" | "objects";
}

export interface BuiltPrompt {
  systemPrompt: string;
  contextPrompt: string;
}

/**
 * Build a hierarchical system prompt from project → act → chapter → page → entity
 */
export async function buildHierarchicalPrompt(context: PromptContext): Promise<BuiltPrompt> {
  const payload = await getPayloadClient();
  const parts: string[] = [];
  const contextParts: string[] = [];

  // 1. Project-level prompts (base)
  if (context.projectId) {
    try {
      const project = await payload.findByID({
        collection: "projects",
        id: String(context.projectId),
      });

      if (project) {
        const projectData = project as any;
        if (projectData.aiSystemPrompt) {
          parts.push(projectData.aiSystemPrompt);
        }
        if (projectData.aiProjectStory) {
          contextParts.push(`PROJECT STORY & CONTEXT:\n${projectData.aiProjectStory}`);
        }
        if (projectData.aiAssistantBehavior) {
          parts.push(`ASSISTANT BEHAVIOR:\n${projectData.aiAssistantBehavior}`);
        }
      }
    } catch (error) {
      console.warn("Failed to fetch project for prompts:", error);
    }
  }

  // 2. Act-level context
  if (context.actId) {
    try {
      const act = await payload.findByID({
        collection: "acts",
        id: String(context.actId),
      });
      if (act && (act as any).aiContextPrompt) {
        contextParts.push(`ACT CONTEXT:\n${(act as any).aiContextPrompt}`);
      }
    } catch (error) {
      console.warn("Failed to fetch act for prompts:", error);
    }
  }

  // 3. Chapter-level context
  if (context.chapterId) {
    try {
      const chapter = await payload.findByID({
        collection: "chapters",
        id: String(context.chapterId),
      });
      if (chapter && (chapter as any).aiContextPrompt) {
        contextParts.push(`CHAPTER CONTEXT:\n${(chapter as any).aiContextPrompt}`);
      }
    } catch (error) {
      console.warn("Failed to fetch chapter for prompts:", error);
    }
  }

  // 4. Page-level context
  if (context.pageId) {
    try {
      const page = await payload.findByID({
        collection: "pages",
        id: String(context.pageId),
      });
      if (page && (page as any).aiContextPrompt) {
        contextParts.push(`PAGE CONTEXT:\n${(page as any).aiContextPrompt}`);
      }
    } catch (error) {
      console.warn("Failed to fetch page for prompts:", error);
    }
  }

  // 5. Entity-level context (character, lore, location, etc.)
  if (context.entityId && context.entityType) {
    try {
      const entity = await payload.findByID({
        collection: context.entityType,
        id: String(context.entityId),
      });
      if (entity && (entity as any).aiContextPrompt) {
        const entityLabel = context.entityType.charAt(0).toUpperCase() + context.entityType.slice(1, -1); // "characters" -> "Character"
        contextParts.push(`${entityLabel.toUpperCase()} CONTEXT:\n${(entity as any).aiContextPrompt}`);
      }
    } catch (error) {
      console.warn(`Failed to fetch ${context.entityType} for prompts:`, error);
    }
  }

  // Combine system prompt parts
  const systemPrompt = parts.length > 0 ? parts.join("\n\n") : undefined;

  // Combine context parts
  const contextPrompt = contextParts.length > 0 ? contextParts.join("\n\n") : undefined;

  return {
    systemPrompt: systemPrompt || "",
    contextPrompt: contextPrompt || "",
  };
}


