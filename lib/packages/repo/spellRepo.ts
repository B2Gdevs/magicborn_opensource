// lib/packages/repo/spellLocalRepo.ts
import type { Spell } from "@core/types";

const SPELLS_KEY = "runeCrafter.spells";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParseSpells(raw: string | null): Spell[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Spell[];
  } catch {
    return [];
  }
}

export class SpellLocalRepo {
  private readAll(): Spell[] {
    if (!isBrowser()) return [];
    const raw = window.localStorage.getItem(SPELLS_KEY);
    return safeParseSpells(raw);
  }

  private writeAll(spells: Spell[]) {
    if (!isBrowser()) return;
    window.localStorage.setItem(SPELLS_KEY, JSON.stringify(spells));
  }

  listAll(): Spell[] {
    return this.readAll();
  }

  listForOwner(ownerId: string): Spell[] {
    return this.readAll().filter((s) => s.ownerId === ownerId);
  }

  upsert(spell: Spell) {
    const spells = this.readAll();
    const idx = spells.findIndex((s) => s.id === spell.id);
    if (idx >= 0) {
      spells[idx] = spell;
    } else {
      spells.push(spell);
    }
    this.writeAll(spells);
  }

  upsertMany(list: Spell[]) {
    if (list.length === 0) return;
    const spells = this.readAll();
    const byId = new Map<string, Spell>();
    spells.forEach((s) => byId.set(s.id, s));
    list.forEach((s) => byId.set(s.id, s));
    this.writeAll(Array.from(byId.values()));
  }

  remove(id: string) {
    const spells = this.readAll().filter((s) => s.id !== id);
    this.writeAll(spells);
  }

  removeByOwner(ownerId: string) {
    const spells = this.readAll().filter((s) => s.ownerId !== ownerId);
    this.writeAll(spells);
  }
}
