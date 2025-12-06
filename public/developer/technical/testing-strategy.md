# Testing Strategy for Map Editor

## 🎯 Critical Requirements

**What MUST be tested:**
1. ✅ **Coordinate calculations** - Data integrity is CRITICAL (game content placement)
2. ✅ **Grid rendering** - Grid lines appear correctly on images
3. ✅ **Zoom behavior** - Zoom in/out works, grid adjusts correctly
4. ✅ **Click precision** - Clicking at different zoom levels selects correct cells
5. ✅ **Nested map navigation** - Clicking landmarks opens nested maps
6. ✅ **Data persistence** - Placements save/load correctly

---

## 🧪 Testing Tools & What They Can Do

### 1. **Vitest (Unit Tests)** ✅ Already Installed
**What it CAN do:**
- ✅ Test coordinate math functions (pixel ↔ Unreal, cell ↔ zone)
- ✅ Test precision calculations
- ✅ Test data transformations
- ✅ Test repositories (database operations)
- ✅ Test API routes

**What it CANNOT do:**
- ❌ Test visual rendering (no browser)
- ❌ Test canvas/konva rendering
- ❌ Test actual zoom/pan behavior
- ❌ Test click precision visually

**Use for:** Core math, data integrity, business logic

---

### 2. **React Testing Library** ⚠️ Limited for Canvas
**What it CAN do:**
- ✅ Test component rendering (HTML elements)
- ✅ Test user interactions (clicks, inputs on HTML)
- ✅ Test state changes
- ✅ Test props/event handlers
- ✅ Mock canvas/konva (but not real rendering)

**What it CANNOT do:**
- ❌ Actually render canvas/konva (jsdom doesn't support canvas)
- ❌ Test visual grid rendering on images
- ❌ Test actual zoom/pan behavior
- ❌ Test click precision on canvas elements

**Use for:** Component logic, form interactions, non-canvas UI

---

### 3. **Playwright** ✅ NEEDED for Visual/Integration Testing
**What it CAN do:**
- ✅ Real browser rendering (Chrome, Firefox, Safari)
- ✅ Actual canvas/konva rendering
- ✅ Visual testing (screenshots, visual comparisons)
- ✅ Real mouse interactions (clicks, drags, zoom)
- ✅ Test actual zoom/pan behavior
- ✅ Test click precision at different zoom levels
- ✅ Test full user flows (create map → place item → save → load)
- ✅ Test nested map navigation

**What it CANNOT do:**
- ❌ Test pure math functions (use Vitest for that)
- ❌ Fast unit tests (slower than Vitest)

**Use for:** Visual rendering, canvas interactions, integration tests, E2E flows

---

## 🎯 Recommended Testing Strategy

### **Layer 1: Unit Tests (Vitest)** - CRITICAL FIRST
**Priority: HIGHEST**

Test coordinate math to ensure data integrity:
```typescript
// lib/utils/__tests__/coordinateSystem.test.ts
- Test pixelToUnreal() with various map sizes
- Test cell calculations at different zoom levels
- Test precision size calculations
- Test edge cases (boundaries, negative values)
- Test data integrity (no rounding errors)
```

**Why first:** If coordinate math is wrong, everything else fails. This is the foundation.

---

### **Layer 2: Component Tests (React Testing Library)** - Good to Have
**Priority: MEDIUM**

Test component logic (non-canvas):
```typescript
// components/environment/__tests__/PrecisionSelector.test.tsx
- Test precision selector dropdown
- Test coordinate display component
- Test prop library interactions
- Test form components
```

**Why:** Ensures components work, but limited for canvas components.

---

### **Layer 3: Visual/Integration Tests (Playwright)** - NEEDED for Canvas
**Priority: HIGH (for canvas features)**

Test actual canvas rendering and interactions:
```typescript
// tests/map-editor.spec.ts
- Test grid renders correctly on image
- Test zoom in/out (visual verification)
- Test click precision at different zoom levels
- Test placement appears at correct coordinates
- Test nested map navigation (click landmark → open nested map)
- Test save/load flow
```

**Why:** Canvas/konva needs real browser. This is the ONLY way to test:
- Grid rendering on images
- Zoom behavior
- Click precision
- Visual correctness

---

## 📋 Updated Testing Checklist

### Phase 1: Unit Tests (Vitest) - START HERE
- [ ] Install React Testing Library (for component tests later)
- [ ] Write `coordinateSystem.test.ts` - CRITICAL
  - [ ] Test pixel ↔ Unreal conversion
  - [ ] Test cell ↔ zone conversion
  - [ ] Test precision size calculations
  - [ ] Test edge cases (boundaries, negative values)
  - [ ] Test with different map sizes (12km, 1km, etc.)
  - [ ] Test zoom level calculations
- [ ] Write repository tests
  - [ ] Test environment CRUD
  - [ ] Test map CRUD
  - [ ] Test placement CRUD
- [ ] Write API route tests
  - [ ] Test environment endpoints
  - [ ] Test map endpoints
  - [ ] Test placement endpoints

### Phase 2: Component Tests (React Testing Library)
- [ ] Update vitest config for jsdom environment
- [ ] Write component tests for:
  - [ ] PrecisionSelector
  - [ ] CoordinateDisplay
  - [ ] PropLibrary
  - [ ] EnvironmentForm
  - [ ] MapToolbar

### Phase 3: Visual/Integration Tests (Playwright) - For Canvas
- [ ] Install Playwright
- [ ] Configure Playwright for Next.js
- [ ] Write visual tests:
  - [ ] Grid renders correctly on map image
  - [ ] Zoom in/out works (visual verification)
  - [ ] Grid adjusts with zoom
  - [ ] Click places item at correct cell
  - [ ] Click precision at different zoom levels
  - [ ] Nested map navigation (click landmark → nested map opens)
  - [ ] Save/load flow (create → save → reload → verify)

---

## 🚀 Implementation Order

### **Step 1: Unit Tests (Vitest)** - DO THIS FIRST
**Why:** Fastest, most critical, ensures data integrity

1. Write coordinate system tests
2. Run tests, fix any issues
3. Ensure 100% coverage of coordinate math

### **Step 2: Component Tests (React Testing Library)** - DO THIS SECOND
**Why:** Ensures components work, but limited for canvas

1. Set up React Testing Library
2. Test non-canvas components
3. Mock canvas components (can't actually test them)

### **Step 3: Visual Tests (Playwright)** - DO THIS THIRD
**Why:** Only way to test canvas rendering and interactions

1. Install Playwright
2. Write visual/integration tests
3. Test full user flows

---

## 💡 Key Insight

**For your critical requirements:**
- ✅ **Coordinate math** → Vitest (unit tests) - CRITICAL
- ⚠️ **Component logic** → React Testing Library - Good but limited
- ✅ **Canvas/Grid/Zoom/Clicks** → Playwright - ONLY way to test this

**You need BOTH Vitest AND Playwright:**
- Vitest = Data integrity (coordinate math)
- Playwright = Visual correctness (grid, zoom, clicks)

---

## 🎯 Recommendation

**Start with:**
1. ✅ Unit tests for coordinate system (Vitest) - CRITICAL
2. ✅ Install React Testing Library (for component tests)
3. ⏭️ Install Playwright later (when canvas components are built)

**Why this order:**
- Unit tests are fastest and most critical
- React Testing Library is easy to set up
- Playwright can wait until we have canvas components to test

---

## 📦 Installation Commands

```bash
# React Testing Library (for component tests)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Playwright (for visual/integration tests - install later)
npm install --save-dev @playwright/test
npx playwright install
```

---

## ✅ Final Answer

**For your use case (coordinate precision, grid rendering, zoom, clicks):**

1. **Vitest** - Test coordinate math (CRITICAL - do first)
2. **React Testing Library** - Test component logic (good to have)
3. **Playwright** - Test canvas/visual (NEEDED - install when ready)

**You need all three, but start with Vitest unit tests.**

