// lib/payload/utils/slugGeneration.ts
// Utility functions for auto-generating slugs from names

/**
 * Converts a name to a URL-friendly slug
 */
export function nameToSlug(name: string): string {
  if (!name || !name.trim()) {
    return '';
  }
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Hook to auto-generate slug from name field if slug is empty
 * Use in beforeChange or beforeValidate hooks
 */
export function autoGenerateSlugHook(
  slugFieldName: string = 'slug',
  nameFieldName: string = 'name'
) {
  return async ({ data, operation, req }: any) => {
    // Only auto-generate on create, or if slug is empty on update
    if (operation === 'create' || !data[slugFieldName] || !data[slugFieldName].trim()) {
      const name = data[nameFieldName];
      if (name && name.trim()) {
        data[slugFieldName] = nameToSlug(name);
      }
    }
    return data;
  };
}

