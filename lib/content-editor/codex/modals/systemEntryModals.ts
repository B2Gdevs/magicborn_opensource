// systemEntryModals.ts
// Registers system (built-in) entry forms in the EntryModal registry.
// These remain bespoke forms (Character/Region/etc.), but are hosted by EntryModalHost.

import { registerEntryModal } from "./entryModalRegistry";
import { EntryType } from "@/lib/content-editor/constants";
import { CharacterForm, CharacterFormFooter } from "@/components/character/CharacterForm";
import { RegionForm, RegionFormFooter, type RegionFormData } from "@/components/region/RegionForm";
import type { CharacterDefinition } from "@/lib/data/characters";
import { payloadToCharacter, characterToPayload, payloadToRegion, regionToPayload } from "@/lib/content-editor/codex/transformers";

// Character
registerEntryModal<CharacterDefinition, unknown>({
  entryType: EntryType.Character,
  displayName: "Character",
  FormComponent: CharacterForm as any,
  FooterComponent: CharacterFormFooter as any,
  payloadToForm: (payload) => payloadToCharacter(payload),
  formToPayload: (data, projectId) => characterToPayload(data as any, projectId),
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


