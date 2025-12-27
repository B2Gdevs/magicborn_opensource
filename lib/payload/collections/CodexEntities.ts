// lib/payload/collections/CodexEntities.ts
// Custom entity instances (data conforms to JSON Schema stored in CodexEntityTypes)

import type { CollectionConfig } from "payload/types";
import { isSuperuser, buildProjectWhereClause } from "../access/helpers";

export const CodexEntities: CollectionConfig = {
  slug: "codex-entities",
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
      name: "type",
      type: "relationship",
      relationTo: "codex-entity-types",
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
      name: "data",
      type: "json",
      required: true,
    },
    {
      name: "tags",
      type: "array",
      required: false,
      fields: [{ name: "tag", type: "text" }],
    },
  ],
};


