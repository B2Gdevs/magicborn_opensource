// lib/__tests__/ai/tool-registry.test.ts
// Unit tests for tool registry

import { ToolRegistry } from "../../ai/tools/registry";
import { ToolExecutor } from "../../ai/types";

describe("ToolRegistry", () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe("register", () => {
    it("should register a tool", () => {
      const tool: ToolExecutor = {
        name: "test_tool",
        description: "Test tool",
        schema: {
          type: "object",
          properties: {},
        },
        execute: async () => ({ success: true, result: "test" }),
      };

      registry.register(tool);
      expect(registry.get("test_tool")).toBe(tool);
    });
  });

  describe("get", () => {
    it("should return undefined for non-existent tool", () => {
      expect(registry.get("nonexistent")).toBeUndefined();
    });
  });

  describe("getToolDefinitions", () => {
    it("should return tool definitions in OpenAPI format", () => {
      const tool: ToolExecutor = {
        name: "test_tool",
        description: "Test tool",
        schema: {
          type: "object",
          properties: {
            arg1: { type: "string" },
          },
          required: ["arg1"],
        },
        execute: async () => ({ success: true }),
      };

      registry.register(tool);
      const definitions = registry.getToolDefinitions();

      expect(definitions).toHaveLength(1);
      expect(definitions[0]).toEqual({
        type: "function",
        function: {
          name: "test_tool",
          description: "Test tool",
          parameters: {
            type: "object",
            properties: {
              arg1: { type: "string" },
            },
            required: ["arg1"],
          },
        },
      });
    });
  });

  describe("execute", () => {
    it("should execute a tool successfully", async () => {
      const tool: ToolExecutor = {
        name: "test_tool",
        description: "Test tool",
        schema: {
          type: "object",
          properties: {},
        },
        execute: async (args) => ({
          success: true,
          result: `Hello ${args.name}`,
        }),
      };

      registry.register(tool);
      const result = await registry.execute("test_tool", { name: "World" });

      expect(result.success).toBe(true);
      expect(result.result).toBe("Hello World");
    });

    it("should return error for non-existent tool", async () => {
      const result = await registry.execute("nonexistent", {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should handle tool execution errors", async () => {
      const tool: ToolExecutor = {
        name: "failing_tool",
        description: "Failing tool",
        schema: {
          type: "object",
          properties: {},
        },
        execute: async () => {
          throw new Error("Tool execution failed");
        },
      };

      registry.register(tool);
      const result = await registry.execute("failing_tool", {});

      expect(result.success).toBe(false);
      expect(result.error).toBe("Tool execution failed");
    });
  });
});




