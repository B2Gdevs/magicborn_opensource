// lib/ai/agent.ts
// Main AI agent that handles chat with tool calling

import { OpenWebUIClient } from "./clients/openwebui-client";
import { ToolRegistry } from "./tools/registry";
import {
  ChatMessage,
  AIConfig,
  ToolCall,
  ToolResponse,
  ChatCompletionRequest,
} from "./types";

export interface AgentOptions {
  config: AIConfig;
  systemPrompt?: string;
  maxToolIterations?: number; // Max number of tool call rounds
}

export class AIAgent {
  private client: OpenWebUIClient;
  private toolRegistry: ToolRegistry;
  private systemPrompt: string;
  private maxToolIterations: number;
  private defaultModel: string;

  constructor(options: AgentOptions) {
    this.client = new OpenWebUIClient(options.config);
    this.toolRegistry = new ToolRegistry();
    this.defaultModel = options.config.defaultModel;
    this.systemPrompt =
      options.systemPrompt ||
      "You are a helpful assistant for the Magicborn game. You can access game data using available tools.";
    this.maxToolIterations = options.maxToolIterations || 5;
  }

  /**
   * Register tools with the agent
   */
  registerTools(tools: import("./tools/game-data-tools").ToolExecutor[]): void {
    tools.forEach((tool) => this.toolRegistry.register(tool));
  }

  /**
   * Process a chat message with automatic tool calling
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<{
    response: string;
    messages: ChatMessage[];
    toolCalls: number;
  }> {
    const messages: ChatMessage[] = [
      { role: "system", content: this.systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    let toolCalls = 0;
    let iterations = 0;

    while (iterations < this.maxToolIterations) {
      iterations++;

      // Build request with tools if available
      const request: ChatCompletionRequest = {
        model: this.defaultModel,
        messages,
        tools: this.toolRegistry.getToolDefinitions(),
        tool_choice: "auto",
      };

      // Get response from Open WebUI
      const response = await this.client.chatCompletion(request);
      const choice = response.choices[0];

      if (!choice) {
        throw new Error("No response from AI model");
      }

      const assistantMessage = choice.message;
      messages.push(assistantMessage);

      // Check if model wants to call tools
      if (choice.finish_reason === "tool_calls" && assistantMessage.tool_calls) {
        // Execute tool calls
        for (const toolCall of assistantMessage.tool_calls) {
          toolCalls++;
          const result = await this.executeToolCall(toolCall);
          messages.push(result);
        }
        // Continue loop to get final response
        continue;
      }

      // Model returned final answer
      return {
        response: assistantMessage.content || "",
        messages,
        toolCalls,
      };
    }

    // Max iterations reached
    return {
      response:
        "I've reached the maximum number of tool calls. Please try rephrasing your question.",
      messages,
      toolCalls,
    };
  }

  /**
   * Execute a tool call and return tool response message
   */
  private async executeToolCall(toolCall: ToolCall): Promise<ToolResponse> {
    try {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await this.toolRegistry.execute(
        toolCall.function.name,
        args
      );

      return {
        tool_call_id: toolCall.id,
        role: "tool",
        name: toolCall.function.name,
        content: JSON.stringify(result),
      };
    } catch (error) {
      return {
        tool_call_id: toolCall.id,
        role: "tool",
        name: toolCall.function.name,
        content: JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
      };
    }
  }

  /**
   * Stream chat response (for real-time updates)
   */
  async *chatStream(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): AsyncGenerator<
    { type: "content" | "tool_call" | "done"; data: any },
    void,
    unknown
  > {
    const messages: ChatMessage[] = [
      { role: "system", content: this.systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    const request: ChatCompletionRequest = {
      model: this.defaultModel,
      messages,
      tools: this.toolRegistry.getToolDefinitions(),
      tool_choice: "auto",
      stream: true,
    };

    let fullContent = "";
    let toolCalls: ToolCall[] = [];

    for await (const chunk of this.client.chatCompletionStream(request)) {
      const choice = chunk.choices[0];
      if (!choice) continue;

      const delta = choice.delta;

      // Content delta
      if (delta.content) {
        fullContent += delta.content;
        yield { type: "content", data: delta.content };
      }

      // Tool call delta
      if (delta.tool_calls) {
        for (const toolCallDelta of delta.tool_calls) {
          const index = toolCallDelta.index || 0;
          if (!toolCalls[index]) {
            toolCalls[index] = {
              id: toolCallDelta.id || "",
              type: "function",
              function: {
                name: toolCallDelta.function?.name || "",
                arguments: toolCallDelta.function?.arguments || "",
              },
            };
          } else {
            toolCalls[index].function.arguments +=
              toolCallDelta.function?.arguments || "";
          }
        }
      }

      // Finished
      if (choice.finish_reason === "tool_calls" && toolCalls.length > 0) {
        // Execute tools and continue
        for (const toolCall of toolCalls) {
          const result = await this.executeToolCall(toolCall);
          messages.push(result);
          yield { type: "tool_call", data: { tool: toolCall.function.name } };
        }
        // Recursively continue with tool results
        yield* this.chatStream("", messages);
        return;
      }

      if (choice.finish_reason === "stop") {
        yield { type: "done", data: { content: fullContent } };
        return;
      }
    }
  }
}




