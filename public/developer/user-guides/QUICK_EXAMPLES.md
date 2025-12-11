# Map Editor: Quick Examples 🎮

## 🎯 5-Minute Examples

Quick, real-world examples showing how the Map Editor works.

---

## Example 1: Cold Mountain → Warm Building

### **The Setup:**

**World Map:**
- Player starts here
- Huge area (12km × 12km)

**Frozen Loom Region:**
- Cells: (50,30) to (65,45) on World Map
- Properties: Mountain, Cold, Danger 3
- When player enters → Frozen Loom Map loads

**Frozen Loom Map:**
- Detailed view of the mountain area
- Inherits: Mountain, Cold, Danger 3
- Player sees detailed mountain terrain

**Warm Inn Region:**
- Cells: (20,15) to (25,20) on Frozen Loom Map
- Properties: Interior, Warm, Danger 0 (overrides Cold!)
- When player enters → Warm Inn Map loads

**Warm Inn Map:**
- Interior view of the inn
- Inherits: Interior, Warm, Danger 0
- Player is now warm and safe (fire inside!)

**The Journey:**
```
World Map (neutral)
  → Enter Frozen Loom region
    → Frozen Loom Map (Cold, Dangerous)
      → Enter Warm Inn region
        → Warm Inn Map (Warm, Safe)
```

**Properties Changed:**
- Cold → Warm ✅
- Dangerous → Safe ✅
- Mountain → Interior ✅

---

## Example 2: Safe Forest → Dangerous Dungeon

### **The Setup:**

**World Map:**
- Player exploring

**Xingdom Huld Region:**
- Cells: (100,50) to (120,70)
- Properties: Forest, Temperate, Danger 1 (safe)
- When player enters → Xingdom Huld Map loads

**Xingdom Huld Map:**
- Beautiful forest area
- Inherits: Forest, Temperate, Danger 1
- Player feels safe, can gather resources

**Ancient Dungeon Region:**
- Cells: (30,40) to (40,50) on Xingdom Huld Map
- Properties: Dungeon, Dark, Danger 5 (very dangerous!)
- When player enters → Ancient Dungeon Map loads

**Ancient Dungeon Map:**
- Dark, dangerous dungeon
- Inherits: Dungeon, Dark, Danger 5
- Player takes damage over time, monsters spawn

**The Journey:**
```
World Map (neutral)
  → Enter Xingdom Huld region
    → Xingdom Huld Map (Safe Forest)
      → Enter Ancient Dungeon region
        → Ancient Dungeon Map (Very Dangerous!)
```

**Properties Changed:**
- Safe → Very Dangerous ✅
- Forest → Dungeon ✅
- Temperate → Dark ✅

---

## Example 3: Town with Multiple Buildings

### **The Setup:**

**World Map:**
- Player starts here

**Lilaran Town Region:**
- Cells: (200,100) to (220,120)
- Properties: Town, Temperate, Danger 1
- When player enters → Lilaran Town Map loads

**Lilaran Town Map:**
- Town square, shops, NPCs
- Inherits: Town, Temperate, Danger 1
- Player can shop, talk to NPCs

**Blacksmith Shop Region:**
- Cells: (10,10) to (15,15) on Lilaran Town Map
- Properties: Interior, Warm, Danger 0
- When player enters → Blacksmith Shop Map loads

**Blacksmith Shop Map:**
- Interior of shop
- Inherits: Interior, Warm, Danger 0
- Player can buy/sell weapons

**Tavern Region:**
- Cells: (20,20) to (25,25) on Lilaran Town Map
- Properties: Interior, Warm, Danger 0
- When player enters → Tavern Map loads

**Tavern Map:**
- Interior of tavern
- Inherits: Interior, Warm, Danger 0
- Player can rest, get quests

**The Journey:**
```
World Map
  → Enter Lilaran Town region
    → Lilaran Town Map (Town, Safe)
      → Enter Blacksmith Shop region
        → Blacksmith Shop Map (Interior, Warm)
      → Exit, Enter Tavern region
        → Tavern Map (Interior, Warm)
```

**Multiple Buildings:**
- One town map
- Multiple regions (buildings)
- Each building = different nested map
- All share town properties but can override

---

## Example 4: Swamp with Hidden Treasure

### **The Setup:**

**World Map:**
- Player exploring

**Mire of Echoes Region:**
- Cells: (30,80) to (45,95)
- Properties: Swamp, Humid, Danger 5 (very dangerous!)
- When player enters → Mire of Echoes Map loads

**Mire of Echoes Map:**
- Dangerous swamp
- Inherits: Swamp, Humid, Danger 5
- Player takes poison damage, reduced movement

**Hidden Cave Region:**
- Cells: (15,20) to (18,23) on Mire of Echoes Map
- Properties: Cave, Dry, Danger 2 (safer inside!)
- When player enters → Hidden Cave Map loads

**Hidden Cave Map:**
- Secret cave with treasure
- Inherits: Cave, Dry, Danger 2
- Player is safer (no poison), can find treasure

**The Journey:**
```
World Map
  → Enter Mire of Echoes region
    → Mire of Echoes Map (Swamp, Very Dangerous)
      → Enter Hidden Cave region
        → Hidden Cave Map (Cave, Safer)
```

**Properties Changed:**
- Very Dangerous → Safer ✅
- Swamp → Cave ✅
- Humid → Dry ✅

---

## Example 5: Multi-Level Dungeon

### **The Setup:**

**World Map:**
- Player starts here

**Dungeon Entrance Region:**
- Cells: (150,200) to (160,210)
- Properties: Dungeon, Dark, Danger 3
- When player enters → Dungeon Level 1 Map loads

**Dungeon Level 1 Map:**
- First level of dungeon
- Inherits: Dungeon, Dark, Danger 3
- Player fights weak monsters

**Dungeon Level 2 Region:**
- Cells: (50,50) to (60,60) on Level 1 Map
- Properties: Dungeon, Dark, Danger 4 (harder!)
- When player enters → Dungeon Level 2 Map loads

**Dungeon Level 2 Map:**
- Second level, harder
- Inherits: Dungeon, Dark, Danger 4
- Player fights stronger monsters

**Boss Room Region:**
- Cells: (80,80) to (85,85) on Level 2 Map
- Properties: Dungeon, Dark, Danger 5 (boss!)
- When player enters → Boss Room Map loads

**Boss Room Map:**
- Final boss room
- Inherits: Dungeon, Dark, Danger 5
- Player fights boss

**The Journey:**
```
World Map
  → Enter Dungeon Entrance region
    → Dungeon Level 1 Map (Danger 3)
      → Enter Dungeon Level 2 region
        → Dungeon Level 2 Map (Danger 4)
          → Enter Boss Room region
            → Boss Room Map (Danger 5)
```

**Progressive Difficulty:**
- Level 1: Danger 3 ✅
- Level 2: Danger 4 ✅
- Boss Room: Danger 5 ✅

---

## 🎯 Pattern Recognition

### **Common Patterns:**

1. **Safe → Dangerous**
   - Forest → Dungeon
   - Town → Cave

2. **Dangerous → Safe**
   - Swamp → Cave
   - Mountain → Building

3. **Multiple Buildings**
   - Town → Shop, Tavern, Inn
   - All share town properties

4. **Progressive Difficulty**
   - Dungeon Level 1 → Level 2 → Boss Room
   - Each level harder

5. **Climate Changes**
   - Cold → Warm (mountain to building)
   - Humid → Dry (swamp to cave)

---

## 💡 Key Takeaways

1. **Start with World Map** - This is your foundation
2. **Create Regions** - Define areas with different properties
3. **Nested Maps** - Show detailed views of regions
4. **Properties Inherit** - But can be overridden
5. **Multiple Levels** - Can nest as deep as needed

---

## 🎮 Try It Yourself!

1. Create World Map
2. Select cells for "Frozen Loom" region
3. Set properties: Mountain, Cold, Danger 3
4. Create nested map
5. On nested map, select cells for "Warm Inn"
6. Set properties: Interior, Warm, Danger 0
7. Create nested map
8. Test navigation!

---

**Remember:** Regions define properties, nested maps show detail. Simple! 🎯


