// components/lore/__tests__/LoreForm.test.tsx
// Comprehensive UI tests for LoreForm

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoreForm, type LoreFormData } from "../LoreForm";

// Mock UI components
vi.mock("@components/ui/MediaUpload", () => ({
  MediaUpload: ({ onMediaUploaded }: any) => (
    <div data-testid="media-upload">
      <button onClick={() => onMediaUploaded(1)}>Upload</button>
    </div>
  ),
}));

global.fetch = vi.fn();

describe("LoreForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ url: "/media/test.jpg", id: 1 }),
    });
  });

  describe("Rendering", () => {
    it("renders all form fields in create mode", () => {
      render(<LoreForm onSubmit={mockOnSubmit} />);

      expect(screen.getByPlaceholderText(/founding of emberholt/i)).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/content/i) || screen.getByRole("textbox", { name: /content/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/author/i)).toBeInTheDocument();
    });

    it("renders with initial values in edit mode", () => {
      const initialValues: Partial<LoreFormData> = {
        title: "Test Lore",
        content: "Test content",
        category: "history",
        author: "Test Author",
      };

      render(
        <LoreForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByPlaceholderText(/title/i) || screen.getByRole("textbox", { name: /title/i })).toHaveValue("Test Lore");
      const categorySelect = screen.getByRole("combobox") || document.querySelector('select');
      expect(categorySelect).toHaveValue("history");
      expect(screen.getByPlaceholderText(/content/i) || screen.getByRole("textbox", { name: /content/i })).toHaveValue("Test content");
    });
  });

  describe("Form Validation", () => {
    it("validates required title field", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      render(<LoreForm onSubmit={mockOnSubmit} />);

      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Title is required");
      });

      alertSpy.mockRestore();
    });
  });

  describe("Create Functionality", () => {
    it("allows creating a new lore entry with valid data", async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<LoreForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByPlaceholderText(/founding of emberholt/i), "Ancient History");
      await user.type(screen.getByPlaceholderText(/content/i) || screen.getByRole("textbox", { name: /content/i }), "Long ago in a distant land...");
      await user.selectOptions(screen.getByRole("combobox"), "history");
      await user.type(screen.getByPlaceholderText(/author/i), "Historian");

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.title).toBe("Ancient History");
      expect(submittedData.category).toBe("history");
      expect(submittedData.author).toBe("Historian");

      alertSpy.mockRestore();
    });
  });

  describe("Edit Functionality", () => {
    it("loads existing lore data for editing", () => {
      const initialValues: Partial<LoreFormData> = {
        title: "Existing Lore",
        content: "Existing content",
        category: "magic-system",
        author: "Mage",
      };

      render(
        <LoreForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByPlaceholderText(/founding of emberholt/i)).toHaveValue("Existing Lore");
      expect(screen.getByRole("combobox")).toHaveValue("magic-system");
    });

    it("allows updating lore data", async () => {
      const user = userEvent.setup();
      const initialValues: Partial<LoreFormData> = {
        title: "Original Title",
        content: "Original content",
        category: "culture",
      };

      render(
        <LoreForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      await user.clear(screen.getByPlaceholderText(/founding of emberholt/i));
      await user.type(screen.getByPlaceholderText(/founding of emberholt/i), "Updated Title");

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("User Interactions", () => {
    it("allows typing in title field", async () => {
      const user = userEvent.setup();
      render(<LoreForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByPlaceholderText(/founding of emberholt/i);
      await user.type(titleInput, "Test Lore Title");

      expect(titleInput).toHaveValue("Test Lore Title");
    });

    it("allows selecting category", async () => {
      const user = userEvent.setup();
      render(<LoreForm onSubmit={mockOnSubmit} />);

      const categorySelect = screen.getByRole("combobox");
      await user.selectOptions(categorySelect, "religion");

      expect(categorySelect).toHaveValue("religion");
    });

    it("allows typing in content field", async () => {
      const user = userEvent.setup();
      render(<LoreForm onSubmit={mockOnSubmit} />);

      const contentInput = screen.getByPlaceholderText(/content/i) || screen.getByRole("textbox", { name: /content/i });
      await user.type(contentInput, "This is test content for the lore entry");

      expect(contentInput).toHaveValue("This is test content for the lore entry");
    });

    it("allows typing in author and era fields", async () => {
      const user = userEvent.setup();
      render(<LoreForm onSubmit={mockOnSubmit} />);

      const authorInput = screen.getByPlaceholderText(/author/i);
      const eraInput = screen.getByPlaceholderText(/first age/i);

      await user.type(authorInput, "Test Author");
      await user.type(eraInput, "Ancient Times");

      expect(authorInput).toHaveValue("Test Author");
      expect(eraInput).toHaveValue("Ancient Times");
    });
  });

  describe("Cancel Functionality", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <LoreForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});

