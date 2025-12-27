// lib/payload/collections/CodexEntityTypes.ts
// Custom entity type definitions (JSON Schema + optional uiSchema)

import type { CollectionConfig } from "payload/types";
import { isSuperuser, buildProjectWhereClause } from "../access/helpers";

export const CodexEntityTypes: CollectionConfig = {
  slug: "codex-entity-types",
  admin: {
    useAsTitle: "name",
  },
  versions: {
    drafts: true,
  },
  trash: true,
  access: {
    read: async ({ req }) => {
      if (isSuperuser({ req })) return true;
      return await buildProjectWhereClause({ req });
    },
    create: () => true,
    update: async ({ req }) => {
      if (isSuperuser({ req })) return true;
      return await buildProjectWhereClause({ req });
    },
    delete: async ({ req }) => {
      if (isSuperuser({ req })) return true;
      return await buildProjectWhereClause({ req });
    },
  },
  fields: [
    {
      name: "project",
      type: "relationship",
      relationTo: "projects",
      required: true,
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
    },
    {
      name: "icon",
      type: "text",
      required: false,
    },
    {
      name: "schema",
      type: "json",
      required: true,
    },
    {
      name: "uiSchema",
      type: "json",
      required: false,
    },
    {
      name: "version",
      type: "number",
      required: true,
      defaultValue: 1,
    },
    {
      name: "isSystem",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};


