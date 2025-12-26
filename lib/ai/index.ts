// lib/ai/index.ts
// Main entry point for AI system

export { AIAgent, type AgentOptions } from "./agent";
export { OpenWebUIClient } from "./clients/openwebui-client";
export { ToolRegistry } from "./tools/registry";
export { getGameDataTools } from "./tools/game-data-tools";
export * from "./types";

/**
 * Create a configured AI agent with game data tools
 */
export function createGameDataAgent(config: {
  openWebUIBaseUrl: string;
  defaultModel: string;
  systemPrompt?: string;
}) {
  const { AIAgent } = require("./agent");
  const { getGameDataTools } = require("./tools/game-data-tools");

  const agent = new AIAgent({
    config: {
      openWebUIBaseUrl: config.openWebUIBaseUrl,
      defaultModel: config.defaultModel,
    },
    systemPrompt:
      config.systemPrompt ||
      "You are a helpful assistant for the Magicborn game. You can access game data using available tools. Always use tools to get accurate, up-to-date information.",
  });

  // Register all game data tools
  const tools = getGameDataTools();
  agent.registerTools(tools);

  return agent;
}




