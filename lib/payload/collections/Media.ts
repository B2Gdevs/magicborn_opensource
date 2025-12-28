// lib/payload/collections/Media.ts
import type { CollectionConfig } from "payload";
import { isSuperuser } from "../access/helpers";
import { CharacterFields, Collections } from "../constants";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "video/*", "audio/*"],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (isSuperuser({ req })) return true;
      return { createdBy: { equals: req.user?.id } };
    },
    delete: ({ req }) => {
      if (isSuperuser({ req })) return true;
      return { createdBy: { equals: req.user?.id } };
    },
  },
  fields: [
    {
      name: CharacterFields.Project,
      type: 'relationship',
      relationTo: Collections.Projects,
      required: true,
      index: true,
    },
    {
      name: "alt",
      type: "text",
      required: false,
    },
  ],
};
