// components/__tests__/test-utils.tsx
// Shared test utilities and mocks

import { vi } from "vitest";

// Common mocks for UI components
export const mockMediaUpload = {
  MediaUpload: ({ onMediaUploaded, label }: any) => (
    <div data-testid="media-upload">
      <label>{label}</label>
      <button onClick={() => onMediaUploaded(1)}>Upload</button>
    </div>
  ),
};

export const mockIdInput = {
  IdInput: ({ value, onChange, placeholder, autoGenerateFrom }: any) => (
    <input
      data-testid="id-input"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
    />
  ),
};

// Mock fetch globally
export const setupFetchMock = () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ url: "/media/test.jpg", id: 1 }),
  });
};

// Helper to wait for form submission
export const waitForFormSubmit = async (mockFn: any, timeout = 3000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (mockFn.mock.calls.length > 0) {
        clearInterval(checkInterval);
        resolve(mockFn.mock.calls[0][0]);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error("Form submission timeout"));
      }
    }, 100);
  });
};

