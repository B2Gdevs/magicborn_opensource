// ImportEntityTypeModal.tsx
// Modal for importing entity types via paste or file upload

"use client";

import { useState, useCallback, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Upload, Clipboard, FileJson, AlertCircle, CheckCircle } from "lucide-react";
import { assertValidEntityTypeExport } from "@/lib/content-editor/codex/schema/validate";

interface ImportEntityTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: {
    name: string;
    slug: string;
    icon?: string;
    schema: Record<string, any>;
    uiSchema?: Record<string, any>;
  }) => Promise<void>;
}

type ImportMode = "paste" | "file";
type ValidationState = "idle" | "valid" | "invalid";

export function ImportEntityTypeModal({
  isOpen,
  onClose,
  onImport,
}: ImportEntityTypeModalProps) {
  const [mode, setMode] = useState<ImportMode>("paste");
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetState = useCallback(() => {
    // Clear the textarea via ref (uncontrolled)
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
    setValidationState("idle");
    setValidationError(null);
    setParsedData(null);
    setImporting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const validateAndParseJSON = useCallback((content: string) => {
    setValidationError(null);
    setParsedData(null);

    if (!content.trim()) {
      setValidationState("idle");
      return;
    }

    try {
      const parsed = JSON.parse(content);

      // Check if it's our export format
      if (parsed.format === "magicborn.codex.entityType") {
        assertValidEntityTypeExport(parsed);
        setParsedData({
          name: parsed.name,
          slug: parsed.slug,
          icon: parsed.icon,
          schema: parsed.schema,
          uiSchema: parsed.uiSchema,
        });
        setValidationState("valid");
        return;
      }

      // Check if it's a raw JSON Schema
      if (parsed.type === "object" || parsed.$schema) {
        // Extract name from title or generate from $id
        const name = parsed.title || "Imported Type";
        const slug = (parsed.$id?.split("/").pop()?.replace(".json", "") || name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");

        setParsedData({
          name,
          slug,
          schema: parsed,
          uiSchema: undefined,
        });
        setValidationState("valid");
        return;
      }

      throw new Error("Unrecognized format. Expected JSON Schema or Magicborn export.");
    } catch (e: any) {
      setValidationState("invalid");
      setValidationError(e.message || "Invalid JSON");
    }
  }, []);

  const handlePasteChange = useCallback(
    (value: string) => {
      validateAndParseJSON(value);
    },
    [validateAndParseJSON]
  );

  const handleFileUpload = useCallback(
    async (file: File | null) => {
      if (!file) return;

      try {
        const content = await file.text();
        // Set textarea value via ref (uncontrolled)
        if (textareaRef.current) {
          textareaRef.current.value = content;
        }
        setMode("paste"); // Switch to paste mode to show content
        validateAndParseJSON(content);
      } catch (e: any) {
        setValidationState("invalid");
        setValidationError(`Failed to read file: ${e.message}`);
      }
    },
    [validateAndParseJSON]
  );

  const handleImport = useCallback(async () => {
    if (importing) return;

    // Always read fresh from textarea ref (uncontrolled input)
    // This ensures browser automation typed content is captured
    let dataToImport = parsedData;
    const textareaContent = textareaRef.current?.value?.trim() || "";
    
    if (!dataToImport && textareaContent) {
      try {
        const parsed = JSON.parse(textareaContent);
        if (parsed.format === "magicborn.codex.entityType") {
          dataToImport = {
            name: parsed.name,
            slug: parsed.slug,
            icon: parsed.icon,
            schema: parsed.schema,
            uiSchema: parsed.uiSchema,
          };
        } else if (parsed.type === "object" || parsed.$schema) {
          const name = parsed.title || "Imported Type";
          const slug = (parsed.$id?.split("/").pop()?.replace(".json", "") || name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
          dataToImport = { name, slug, schema: parsed };
        }
      } catch (e: any) {
        setValidationError(e.message || "Invalid JSON");
        setValidationState("invalid");
        return;
      }
    }

    if (!dataToImport) {
      setValidationError("No valid schema to import. Paste a JSON Schema or Magicborn export.");
      setValidationState("invalid");
      return;
    }

    setImporting(true);
    try {
      await onImport(dataToImport);
      handleClose();
    } catch (e: any) {
      setValidationError(e.message || "Failed to import");
      setValidationState("invalid");
    } finally {
      setImporting(false);
    }
  }, [parsedData, importing, onImport, handleClose]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Entity Type"
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            className="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-deep transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="px-4 py-2 bg-ember/90 border border-ember/50 text-void rounded-lg hover:bg-ember disabled:opacity-50 transition-colors font-medium"
          >
            {importing ? "Importing..." : "Import"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Mode Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg transition-colors ${
              mode === "paste"
                ? "bg-deep text-text-primary border-b-2 border-ember"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Clipboard className="w-4 h-4" />
            Paste JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg transition-colors ${
              mode === "file"
                ? "bg-deep text-text-primary border-b-2 border-ember"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
        />

        {/* Paste Area */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            JSON Schema or Magicborn Export
          </label>
          <textarea
            ref={textareaRef}
            defaultValue=""
            onChange={(e) => handlePasteChange(e.target.value)}
            onBlur={(e) => handlePasteChange(e.target.value)}
            placeholder='Paste your JSON Schema here, or use the "Upload File" button...'
            rows={12}
            className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50 focus:border-ember/50 font-mono text-sm resize-y"
          />
        </div>

        {/* Validation Status */}
        {validationState === "valid" && parsedData && (
          <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-400">Valid Schema</p>
              <p className="text-sm text-text-secondary mt-1">
                <strong>Name:</strong> {parsedData.name}
                <br />
                <strong>Slug:</strong> {parsedData.slug}
                {parsedData.schema?.properties && (
                  <>
                    <br />
                    <strong>Fields:</strong>{" "}
                    {Object.keys(parsedData.schema.properties).join(", ")}
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {validationState === "invalid" && validationError && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Invalid Schema</p>
              <p className="text-sm text-text-secondary mt-1">{validationError}</p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="p-3 bg-deep/50 border border-border/50 rounded-lg">
          <div className="flex items-start gap-2">
            <FileJson className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
            <div className="text-xs text-text-muted space-y-1">
              <p>
                <strong>Supported formats:</strong>
              </p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Standard JSON Schema (Draft 2020-12 or earlier)</li>
                <li>Magicborn Entity Type export files</li>
              </ul>
              <p className="mt-2">
                The schema will be used to generate forms for creating entities of this type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

