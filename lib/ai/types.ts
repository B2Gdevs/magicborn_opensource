// lib/ai/types.ts
// Type definitions for AI system

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string; // For tool calls
  tool_call_id?: string; // For tool responses
  tool_calls?: ToolCall[]; // For assistant messages with tool calls
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolResponse {
  tool_call_id: string;
  role: "tool";
  name: string;
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  tools?: ToolDefinition[];
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: "stop" | "length" | "tool_calls" | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamingChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: "function";
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason: "stop" | "length" | "tool_calls" | null;
  }>;
}

export interface AIConfig {
  openWebUIBaseUrl: string;
  defaultModel: string;
  apiKey?: string;
  timeout?: number;
}

export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface ToolExecutor {
  name: string;
  description: string;
  execute: (args: Record<string, any>) => Promise<ToolExecutionResult>;
  schema: ToolDefinition["function"]["parameters"];
}

