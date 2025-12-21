# Form Component Tests

Comprehensive UI tests for all entity creation forms using React Testing Library and Vitest.

## Test Coverage

### CharacterForm
- ✅ Rendering (create and edit modes)
- ✅ Form validation (required fields)
- ✅ Create functionality
- ✅ Edit/Update functionality
- ✅ User interactions (typing, selecting)
- ✅ Cancel functionality
- ✅ Saving state

### SpellForm
- ✅ Rendering (create and edit modes)
- ✅ Form validation (name, runes, tags, hint)
- ✅ Create functionality
- ✅ Edit/Update functionality
- ✅ User interactions (rune selection, tag selection)
- ✅ Cancel functionality

### RegionForm
- ✅ Rendering (create and edit modes)
- ✅ Form validation (required name)
- ✅ Create functionality
- ✅ Edit/Update functionality
- ✅ Grid cell selection
- ✅ User interactions (type selection, description)
- ✅ Cancel functionality

### ObjectForm
- ✅ Rendering (create and edit modes)
- ✅ Form validation (required name)
- ✅ Create functionality
- ✅ Auto-generated slug from name
- ✅ Edit/Update functionality
- ✅ User interactions (type, rarity, weight, value)
- ✅ Cancel functionality

### LoreForm
- ✅ Rendering (create and edit modes)
- ✅ Form validation (required title)
- ✅ Create functionality
- ✅ Edit/Update functionality
- ✅ User interactions (category selection, content editing)
- ✅ Cancel functionality

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test CharacterForm.test.tsx
```

### Run tests with coverage
```bash
npm test -- --coverage
```

## Test Structure

Each test file follows this structure:

1. **Rendering Tests** - Verify all form fields render correctly
2. **Validation Tests** - Test form validation rules
3. **Create Tests** - Test creating new entities
4. **Edit Tests** - Test editing existing entities
5. **User Interaction Tests** - Test user input and interactions
6. **Cancel Tests** - Test cancel functionality

## Mocking

The tests mock external dependencies:
- `@components/ui/MediaUpload` - Image upload component
- `@components/ui/IdInput` - ID input component
- `@components/ui/CombatStatsEditor` - Combat stats editor
- `@components/ui/RuneSelector` - Rune selection component
- `@components/ui/TagSelector` - Tag selection component
- `@components/ui/GridSelector` - Grid cell selector
- `fetch` API - For loading media URLs

## Adding New Tests

When adding new form fields or functionality:

1. Add a test case in the appropriate section
2. Mock any new UI components
3. Test both create and edit modes
4. Test validation if the field is required
5. Test user interactions

Example:
```typescript
it("allows entering new field", async () => {
  const user = userEvent.setup();
  render(<MyForm onSubmit={mockOnSubmit} />);

  const fieldInput = screen.getByLabelText(/new field/i);
  await user.type(fieldInput, "Test value");

  expect(fieldInput).toHaveValue("Test value");
});
```

