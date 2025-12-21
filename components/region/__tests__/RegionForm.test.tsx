// components/region/__tests__/RegionForm.test.tsx
// Comprehensive UI tests for RegionForm

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegionForm, type RegionFormData } from "../RegionForm";

// Mock UI components
vi.mock("@components/ui/MediaUpload", () => ({
  MediaUpload: ({ onMediaUploaded, label }: any) => (
    <div data-testid="media-upload">
      <label>{label}</label>
      <button onClick={() => onMediaUploaded(1)}>Upload</button>
    </div>
  ),
}));

vi.mock("@components/ui/GridSelector", () => ({
  GridSelector: ({ selectedCells, onCellsChange }: any) => (
    <div data-testid="grid-selector">
      <button onClick={() => onCellsChange({ minX: 0, minY: 0, width: 2, height: 2 })}>
        Select Cells
      </button>
    </div>
  ),
}));

global.fetch = vi.fn();

describe("RegionForm", () => {
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
      render(<RegionForm onSubmit={mockOnSubmit} />);

      expect(screen.getByPlaceholderText(/ember wastes/i)).toBeInTheDocument();
      const textboxes = screen.getAllByRole("textbox");
      expect(textboxes.length).toBeGreaterThan(0);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByTestId("grid-selector")).toBeInTheDocument();
    });

    it("renders with initial values in edit mode", () => {
      const initialValues: Partial<RegionFormData> = {
        name: "Test Region",
        description: "Test description",
        type: "city",
        level: 2,
      };

      render(
        <RegionForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByPlaceholderText(/ember wastes/i)).toHaveValue("Test Region");
      const textboxes = screen.getAllByRole("textbox");
      const descBox = textboxes.find(box => (box as HTMLInputElement).value === "Test description");
      expect(descBox).toBeDefined();
    });
  });

  describe("Form Validation", () => {
    it("validates required name field", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      render(<RegionForm onSubmit={mockOnSubmit} />);

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
    it("allows creating a new region with valid data", async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<RegionForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByPlaceholderText(/ember wastes/i), "New Region");
      const textboxes = screen.getAllByRole("textbox");
      const descBox = textboxes.find(box => (box as HTMLInputElement).placeholder?.toLowerCase().includes("description"));
      if (descBox) await user.type(descBox, "A new region description");
      await user.selectOptions(screen.getByRole("combobox"), "city");

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.name).toBe("New Region");
      expect(submittedData.type).toBe("city");

      alertSpy.mockRestore();
    });

    it("handles grid cell selection", async () => {
      const user = userEvent.setup();
      render(<RegionForm onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: /select cells/i }));

      await waitFor(() => {
        expect(screen.getByTestId("grid-selector")).toBeInTheDocument();
      });
    });
  });

  describe("Edit Functionality", () => {
    it("loads existing region data for editing", () => {
      const initialValues: Partial<RegionFormData> = {
        name: "Existing Region",
        description: "Existing description",
        type: "region",
        level: 1,
      };

      render(
        <RegionForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByPlaceholderText(/ember wastes/i)).toHaveValue("Existing Region");
      expect(screen.getByRole("combobox")).toHaveValue("region");
    });

    it("allows updating region data", async () => {
      const user = userEvent.setup();
      const initialValues: Partial<RegionFormData> = {
        name: "Original Region",
        description: "Original description",
        type: "city",
      };

      render(
        <RegionForm
          initialValues={initialValues}
          isEdit={true}
          onSubmit={mockOnSubmit}
        />
      );

      await user.clear(screen.getByPlaceholderText(/ember wastes/i));
      await user.type(screen.getByPlaceholderText(/ember wastes/i), "Updated Region");

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
      render(<RegionForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/ember wastes/i);
      await user.type(nameInput, "Test Region Name");

      expect(nameInput).toHaveValue("Test Region Name");
    });

    it("allows selecting region type", async () => {
      const user = userEvent.setup();
      render(<RegionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByRole("combobox");
      await user.selectOptions(typeSelect, "continent");

      expect(typeSelect).toHaveValue("continent");
    });

    it("allows typing in description field", async () => {
      const user = userEvent.setup();
      render(<RegionForm onSubmit={mockOnSubmit} />);

      const textboxes = screen.getAllByRole("textbox");
      const descInput = textboxes.find(box => (box as HTMLInputElement).placeholder?.toLowerCase().includes("description"));
      await user.type(descInput, "This is a test description");

      expect(descInput).toHaveValue("This is a test description");
    });
  });

  describe("Cancel Functionality", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <RegionForm
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

