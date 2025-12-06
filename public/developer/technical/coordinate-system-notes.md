# Coordinate System Architecture

## 🎯 Core Principle

**Unreal Units = Source of Truth**

All systems use Unreal units directly:
- ✅ Map Editor converts pixels → Unreal units (one-time conversion)
- ✅ Database stores Unreal units
- ✅ Three.js uses Unreal units directly (no conversion)
- ✅ Unreal Engine uses Unreal units directly (no conversion)

---

## 📐 Coordinate Flow

```
2D Map Image (pixels)
  ↓ pixelToUnreal()
Unreal Units (stored in database)
  ↓ (direct use - no conversion)
Three.js Scene (Unreal units)
  ↓ (direct use - no conversion)
Unreal Engine (Unreal units)
```

---

## 🔄 Conversion Points

### Only Conversion: Pixel → Unreal
- **When:** User clicks on 2D map image
- **Function:** `pixelToUnreal(pixel, config)`
- **Result:** Unreal units stored in database

### No Conversions Needed:
- **Three.js:** Reads Unreal units, uses directly
- **Unreal Engine:** Reads Unreal units, uses directly
- **Export:** Contains Unreal units only

---

## 📊 Example

### Map Configuration
- Image: 1000x1000 pixels
- Unreal Size: 12km x 12km = 12000 x 12000 Unreal units
- Scale: 1 pixel = 12 Unreal units

### User Clicks at Pixel (500, 300)
```typescript
const pixel = { x: 500, y: 300 };
const unreal = pixelToUnreal(pixel, config);
// Result: { x: 6000, y: 3600 } (Unreal units)
```

### Stored in Database
```json
{
  "position": { "x": 6000, "y": 3600, "z": 0 }
}
```

### Used in Three.js (No Conversion)
```typescript
const position = new THREE.Vector3(
  6000,  // Unreal units - direct use
  0,     // Y is up in Unreal, Z is up in Three.js (may need axis swap)
  3600   // Unreal units - direct use
);
```

### Used in Unreal Engine (No Conversion)
```cpp
FVector Position(6000, 3600, 0); // Unreal units - direct use
```

---

## ⚠️ Important Notes

1. **Axis Convention:**
   - Unreal: X (forward), Y (right), Z (up)
   - Three.js: X (right), Y (up), Z (forward)
   - May need axis swap helper for Three.js

2. **Precision:**
   - All calculations use Unreal units
   - No pixel coordinates in exports
   - Database stores Unreal units only

3. **Validation:**
   - Coordinate system utils always output Unreal units
   - Exports validated to contain only Unreal units
   - Three.js/Unreal use Unreal units directly

---

## 🧪 Testing Requirements

- [ ] `pixelToUnreal()` outputs correct Unreal units
- [ ] Database stores Unreal units (not pixels)
- [ ] Exports contain Unreal units only
- [ ] Three.js can use Unreal units directly
- [ ] Unreal Engine can use Unreal units directly

