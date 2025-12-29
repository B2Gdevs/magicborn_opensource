// systemEntryModals.ts
// Registers system (built-in) entry forms in the EntryModal registry.
// These remain bespoke forms (Character/Region/etc.), but are hosted by EntryModalHost.

import { registerEntryModal } from "./entryModalRegistry";
import { EntryType } from "@/lib/content-editor/constants";
import { CharacterForm, CharacterFormFooter } from "@/components/character/CharacterForm";
import { CreatureForm, CreatureFormFooter } from "@/components/creature/CreatureForm";
import { RuneForm } from "@/components/rune/RuneForm";
import { RuneFormFooter } from "@/components/rune/RuneFormFooter";
import { RegionForm, RegionFormFooter, type RegionFormData } from "@/components/region/RegionForm";
import { ObjectForm, ObjectFormFooter, type ObjectFormData } from "@/components/object/ObjectForm";
import { LoreForm, LoreFormFooter, type LoreFormData } from "@/components/lore/LoreForm";
import { EffectForm, EffectFormFooter } from "@/components/effect/EffectForm";
import { SpellForm, SpellFormFooter } from "@/components/spell/SpellForm";
import type { CharacterDefinition } from "@/lib/data/characters";
import type { CreatureDefinition } from "@/lib/data/creatures";
import type { RuneDef } from "@/lib/packages/runes";
import type { NamedSpellBlueprint } from "@/lib/data/namedSpells";
import type { EffectDefinition } from "@/lib/data/effects";
import {
  payloadToCharacter,
  characterToPayload,
  payloadToRegion,
  regionToPayload,
  payloadToCreature,
  creatureToPayload,
  payloadToRune,
  runeToPayload,
  payloadToObject,
  objectToPayload,
  payloadToLore,
  loreToPayload,
  payloadToSpell,
  spellToPayload,
  payloadToEffect,
  effectToPayload,
} from "@/lib/content-editor/codex/transformers";

// Character
registerEntryModal<CharacterDefinition, unknown>({
  entryType: EntryType.Character,
  displayName: "Character",
  FormComponent: CharacterForm as any,
  FooterComponent: CharacterFormFooter as any,
  payloadToForm: (payload) => payloadToCharacter(payload) as CharacterDefinition,
  formToPayload: (data, projectId) => characterToPayload(data as any, projectId),
  defaultValues: undefined,
});

// Creature
registerEntryModal<CreatureDefinition, unknown>({
  entryType: EntryType.Creature,
  displayName: "Creature",
  FormComponent: CreatureForm as any,
  FooterComponent: CreatureFormFooter as any,
  payloadToForm: (payload) => payloadToCreature(payload),
  formToPayload: (data, projectId) => creatureToPayload(data as any, projectId),
  defaultValues: undefined,
});

// Region (Locations)
registerEntryModal<RegionFormData, unknown>({
  entryType: EntryType.Region,
  displayName: "Region",
  FormComponent: RegionForm as any,
  FooterComponent: RegionFormFooter as any,
  payloadToForm: (payload) => (payloadToRegion(payload as any) || {}) as any,
  formToPayload: (data, projectId) => regionToPayload(data as any, projectId),
  defaultValues: undefined,
});

// Object / Item
registerEntryModal<ObjectFormData, unknown>({
  entryType: EntryType.Object,
  displayName: "Object/Item",
  FormComponent: ObjectForm as any,
  FooterComponent: ObjectFormFooter as any,
  payloadToForm: (payload) => (payloadToObject(payload as any) || {}) as any,
  formToPayload: (data, projectId) => objectToPayload(data as any, projectId),
  defaultValues: undefined,
});

// Book / Story (Lore)
registerEntryModal<LoreFormData, unknown>({
  entryType: EntryType.Story,
  displayName: "Book/Story",
  FormComponent: LoreForm as any,
  FooterComponent: LoreFormFooter as any,
  payloadToForm: (payload) => (payloadToLore(payload as any) || {}) as any,
  formToPayload: (data, projectId) => loreToPayload(data as any, projectId),
  defaultValues: undefined,
});

// Spell
registerEntryModal<NamedSpellBlueprint, unknown>({
  entryType: EntryType.Spell,
  displayName: "Spell",
  FormComponent: SpellForm as any,
  FooterComponent: SpellFormFooter as any,
  payloadToForm: (payload) => (payloadToSpell(payload as any) || {}) as any,
  formToPayload: (data, projectId) => spellToPayload(data as any, projectId),
  defaultValues: undefined,
});

// Rune
registerEntryModal<RuneDef, unknown>({
  entryType: EntryType.Rune,
  displayName: "Rune",
  FormComponent: RuneForm as any,
  FooterComponent: RuneFormFooter as any,
  payloadToForm: (payload) => (payloadToRune(payload as any) || {}) as any,
  formToPayload: (data, projectId) => runeToPayload(data as any, projectId),
  defaultValues: undefined,
});

// Effect
registerEntryModal<(EffectDefinition & { image?: number }), unknown>({
  entryType: EntryType.Effect,
  displayName: "Effect",
  FormComponent: EffectForm as any,
  FooterComponent: EffectFormFooter as any,
  payloadToForm: (payload) => (payloadToEffect(payload as any) || {}) as any,
  formToPayload: (data, projectId) => effectToPayload(data as any, projectId),
  defaultValues: undefined,
});


