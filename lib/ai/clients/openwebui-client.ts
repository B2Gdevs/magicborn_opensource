// lib/ai/clients/openwebui-client.ts
// Open WebUI REST API client for chat completion

import { AIConfig, ChatCompletionRequest, ChatCompletionResponse, StreamingChunk } from "../types";

export class OpenWebUIClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(config: AIConfig) {
    this.baseUrl = config.openWebUIBaseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 60000; // 60 seconds default
  }

  /**
   * Send a chat completion request to Open WebUI
   */
  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const url = `${this.baseUrl}/api/v1/chat/completions`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Open WebUI API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error(`Unknown error: ${error}`);
    }
  }

  /**
   * Send a streaming chat completion request
   */
  async *chatCompletionStream(
    request: ChatCompletionRequest
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    const url = `${this.baseUrl}/api/v1/chat/completions`;
    const streamRequest = { ...request, stream: true };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(streamRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Open WebUI API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return;
            }
            try {
              const chunk: StreamingChunk = JSON.parse(data);
              yield chunk;
            } catch (e) {
              // Skip invalid JSON
              console.warn("Failed to parse SSE chunk:", data);
            }
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error(`Unknown error: ${error}`);
    }
  }

  /**
   * Test connection to Open WebUI
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch models endpoint as a health check
      const url = `${this.baseUrl}/api/v1/models`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout for health check
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
