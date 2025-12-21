// components/object/__tests__/ObjectForm.test.tsx
// Comprehensive UI tests for ObjectForm

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ObjectForm, type ObjectFormData } from "../ObjectForm";

// Mock UI components
vi.mock("@components/ui/MediaUpload", () => ({
  MediaUpload: ({ onMediaUploaded }: any) => (
    <div data-testid="media-upload">
      <button onClick={() => onMediaUploaded(1)}>Upload</button>
    </div>
  ),
}));

vi.mock("@components/ui/IdInput", () => ({
  IdInput: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="id-input"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

global.fetch = vi.fn();

describe("ObjectForm", () => {
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
      render(<ObjectForm onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId("id-input")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ember crystal/i)).toBeInTheDocument();
      const textboxes = screen.getAllByRole("textbox");
      expect(textboxes.length).toBeGreaterThan(0);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders with initial values in edit mode", () => {
      const initialValues: Partial<ObjectFormData> = {
        name: "Test Object",
        description: "Test description",
        type: "weapon",
        rarity: "rare",
      };

      render(
        <ObjectForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByPlaceholderText(/ember crystal/i)).toHaveValue("Test Object");
      const selects = screen.getAllByRole("combobox");
      expect(selects[0]).toHaveValue("weapon");
      expect(selects[1]).toHaveValue("rare");
    });
  });

  describe("Form Validation", () => {
    it("validates required name field", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      render(<ObjectForm onSubmit={mockOnSubmit} />);

      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Name is required");
      });

      alertSpy.mockRestore();
    });
  });

  describe("Create Functionality", () => {
    it("allows creating a new object with valid data", async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<ObjectForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByPlaceholderText(/ember crystal/i), "Magic Sword");
      const textboxes = screen.getAllByRole("textbox");
      const descBox = textboxes.find(box => (box as HTMLInputElement).placeholder?.toLowerCase().includes("description"));
      if (descBox) await user.type(descBox, "A powerful sword");
      const selects = screen.getAllByRole("combobox");
      await user.selectOptions(selects[0], "weapon");
      await user.selectOptions(selects[1], "epic");

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.name).toBe("Magic Sword");
      expect(submittedData.type).toBe("weapon");
      expect(submittedData.rarity).toBe("epic");

      alertSpy.mockRestore();
    });

    it("auto-generates slug from name", async () => {
      const user = userEvent.setup();
      render(<ObjectForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByPlaceholderText(/ember crystal/i), "Ember Crystal");

      // Slug should be auto-generated
      await waitFor(() => {
        const slugInput = screen.getByTestId("id-input");
        expect(slugInput).toHaveValue("ember-crystal");
      });
    });
  });

  describe("Edit Functionality", () => {
    it("loads existing object data for editing", () => {
      const initialValues: Partial<ObjectFormData> = {
        name: "Existing Object",
        description: "Existing description",
        type: "armor",
        rarity: "common",
      };

      render(
        <ObjectForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByPlaceholderText(/ember crystal/i)).toHaveValue("Existing Object");
      const selects = screen.getAllByRole("combobox");
      expect(selects[0]).toHaveValue("armor");
    });

    it("allows updating object data", async () => {
      const user = userEvent.setup();
      const initialValues: Partial<ObjectFormData> = {
        name: "Original Object",
        description: "Original description",
        type: "weapon",
      };

      render(
        <ObjectForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      await user.clear(screen.getByPlaceholderText(/ember crystal/i));
      await user.type(screen.getByPlaceholderText(/ember crystal/i), "Updated Object");

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
    it("allows typing in name field", async () => {
      const user = userEvent.setup();
      render(<ObjectForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/ember crystal/i);
      await user.type(nameInput, "Test Object Name");

      expect(nameInput).toHaveValue("Test Object Name");
    });

    it("allows selecting object type", async () => {
      const user = userEvent.setup();
      render(<ObjectForm onSubmit={mockOnSubmit} />);

      const selects = screen.getAllByRole("combobox");
      await user.selectOptions(selects[0], "artifact");

      expect(selects[0]).toHaveValue("artifact");
    });

    it("allows selecting rarity", async () => {
      const user = userEvent.setup();
      render(<ObjectForm onSubmit={mockOnSubmit} />);

      const selects = screen.getAllByRole("combobox");
      await user.selectOptions(selects[1], "legendary");

      expect(selects[1]).toHaveValue("legendary");
    });

    it("allows entering weight and value", async () => {
      const user = userEvent.setup();
      render(<ObjectForm onSubmit={mockOnSubmit} />);

      const numberInputs = screen.getAllByRole("spinbutton");
      const weightInput = numberInputs.find(input => (input as HTMLInputElement).placeholder?.toLowerCase().includes("weight"));
      const valueInput = numberInputs.find(input => (input as HTMLInputElement).placeholder?.toLowerCase().includes("value"));

      await user.type(weightInput, "2.5");
      await user.type(valueInput, "100");

      expect(weightInput).toHaveValue(2.5);
      expect(valueInput).toHaveValue(100);
    });
  });

  describe("Cancel Functionality", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ObjectForm
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

