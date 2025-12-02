# Public Assets

This folder contains static assets served at the root URL.

## Image Guidelines

### Supported Formats
- **WebP** - Recommended for modern browsers (excellent compression)
- **PNG** - For images requiring transparency
- **JPG/JPEG** - For photos without transparency needs
- **SVG** - For icons and simple graphics

### Next.js Image Optimization
Next.js automatically optimizes images in the `public` folder when using the `next/image` component:
- Automatic WebP conversion for supported browsers
- Responsive image sizing
- Lazy loading by default
- Blur placeholder support

### Usage Example
```tsx
import Image from 'next/image'

<Image
  src="/images/hero.webp"
  alt="Magicborn hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
/>
```

### Folder Structure
```
public/
├── images/
│   ├── hero.webp
│   ├── runes/
│   └── spells/
├── stories/
│   └── (story assets)
└── icons/
```

## WebP Support

**Yes, WebP is fully supported!** Next.js handles WebP images natively:
- Automatic format detection
- Fallback to original format for older browsers
- Optimal compression and quality
- No additional configuration needed

Use WebP for all new images to get the best performance.

