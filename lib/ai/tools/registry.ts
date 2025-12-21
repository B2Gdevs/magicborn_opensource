// lib/ai/tools/registry.ts
// Tool registry for managing available tools

import { ToolExecutor, ToolDefinition } from "../types";

export class ToolRegistry {
  private tools: Map<string, ToolExecutor> = new Map();

  /**
   * Register a tool executor
   */
  register(tool: ToolExecutor): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool executor by name
   */
  get(name: string): ToolExecutor | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): ToolExecutor[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool definitions in OpenAPI format for the AI model
   */
  getToolDefinitions(): ToolDefinition[] {
    return this.getAll().map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema,
      },
    }));
  }

  /**
   * Execute a tool by name with arguments
   */
  async execute(
    name: string,
    args: Record<string, any>
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const tool = this.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${name}' not found`,
      };
    }

    try {
      return await tool.execute(args);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

