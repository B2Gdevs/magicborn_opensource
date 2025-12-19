// components/rune/RuneFormFooter.tsx
// Footer component for RuneForm

export function RuneFormFooter({
  isEdit,
  saving,
  onCancel,
  onSubmit,
}: {
  isEdit: boolean;
  saving: boolean;
  onCancel?: () => void;
  onSubmit: () => void;
}) {
  const handleSubmit = async () => {
    const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
    if (form?.validateAndSubmit) {
      await form.validateAndSubmit();
    } else {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
      >
        {saving ? "Saving..." : isEdit ? "Update Rune" : "Create Rune"}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

