// lib/__tests__/ai/openwebui-client.test.ts
// Unit tests for Open WebUI client

import { OpenWebUIClient } from "../../ai/clients/openwebui-client";
import { AIConfig } from "../../ai/types";

describe("OpenWebUIClient", () => {
  const mockConfig: AIConfig = {
    openWebUIBaseUrl: "http://localhost:8080",
    defaultModel: "test-model",
  };

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  describe("constructor", () => {
    it("should create client with correct base URL", () => {
      const client = new OpenWebUIClient(mockConfig);
      expect(client).toBeDefined();
    });

    it("should remove trailing slash from base URL", () => {
      const config = { ...mockConfig, openWebUIBaseUrl: "http://localhost:8080/" };
      const client = new OpenWebUIClient(config);
      // Access private property via any for testing
      expect((client as any).baseUrl).toBe("http://localhost:8080");
    });
  });

  describe("chatCompletion", () => {
    it("should send POST request to correct endpoint", async () => {
      const client = new OpenWebUIClient(mockConfig);
      const mockResponse = {
        id: "test-id",
        object: "chat.completion",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Hello" },
            finish_reason: "stop",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.chatCompletion({
        model: "test-model",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      const client = new OpenWebUIClient(mockConfig);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Error message",
      });

      await expect(
        client.chatCompletion({
          model: "test-model",
          messages: [{ role: "user", content: "Hello" }],
        })
      ).rejects.toThrow("Open WebUI API error");
    });
  });

  describe("testConnection", () => {
    it("should return true when connection is successful", async () => {
      const client = new OpenWebUIClient(mockConfig);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const result = await client.testConnection();
      expect(result).toBe(true);
    });

    it("should return false when connection fails", async () => {
      const client = new OpenWebUIClient(mockConfig);

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result = await client.testConnection();
      expect(result).toBe(false);
    });
  });
});
