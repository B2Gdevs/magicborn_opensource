// lib/utils/image-validation.ts
// Magic number validation for image files
// Checks file signatures to verify actual file type, not just extension

/**
 * Validates that a file is actually an image by checking its magic numbers (file signature)
 * @param file - The file to validate
 * @returns true if file is a valid image, false otherwise
 */
export async function isValidImageFile(file: File): Promise<boolean> {
  // Read first 12 bytes (enough to identify all common image formats)
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }

  // GIF: 47 49 46 38 (GIF89a or GIF87a)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return true;
  }

  // WebP: 52 49 46 46 (RIFF) followed by 57 45 42 50 (WEBP)
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // RIFF
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // WEBP
  ) {
    return true;
  }

  // BMP: 42 4D
  if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
    return true;
  }

  // SVG: Check if it starts with XML-like content (SVG files are text-based)
  // Read more bytes for SVG since it's text
  if (bytes.length >= 4) {
    const textDecoder = new TextDecoder();
    const text = textDecoder.decode(bytes.slice(0, Math.min(100, file.size)));
    if (text.trim().startsWith('<?xml') || text.trim().startsWith('<svg')) {
      return true;
    }
  }

  return false;
}

