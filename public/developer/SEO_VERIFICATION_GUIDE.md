# SEO & Server-Side Rendering Verification Guide

This guide helps you verify what content is server-rendered (visible to search engines) vs client-side only.

## Quick Verification Methods

### 1. View Page Source (Most Important for SEO)

**What it shows:** The exact HTML that search engines see

**How to use:**
1. Right-click on the page → "View Page Source" (or `Ctrl+U` / `Cmd+Option+U`)
2. Search for your documentation content (e.g., search for a heading from your markdown)
3. If you see the content in the source → ✅ Server-rendered (SEO-friendly)
4. If you only see loading states or empty divs → ❌ Client-side only (not SEO-friendly)

**Example:**
- ✅ Good: `<h1>Design Guide</h1><p>This is the content...</p>` appears in source
- ❌ Bad: Only `<div id="root"></div>` or loading spinners in source

### 2. Disable JavaScript

**What it shows:** What's visible without JavaScript (what some crawlers see)

**How to use:**
1. Open Chrome DevTools (`F12`)
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Disable JavaScript" and select it
4. Refresh the page
5. If content is visible → ✅ Server-rendered
6. If page is blank/broken → ❌ Requires JavaScript

**Alternative:** Use browser extensions like "Disable JavaScript" or "Quick JavaScript Switcher"

### 3. Network Tab Analysis

**What it shows:** What's fetched client-side after page load

**How to use:**
1. Open DevTools → Network tab
2. Refresh the page
3. Look for:
   - **Initial HTML document** - Should contain your content (check Response tab)
   - **API calls** to `/api/docs/*` - These are client-side fetches
   - **Fetch requests** for markdown files - These are client-side loads

**What to check:**
- If you see API calls to load documentation → Some content is client-side
- If initial HTML response contains full content → ✅ Server-rendered

### 4. React DevTools

**What it shows:** Component hydration and state

**How to use:**
1. Install React DevTools browser extension
2. Open DevTools → React tab
3. Check component props:
   - If `initialContent` prop has data → ✅ Server-rendered
   - If component starts with empty state → ❌ Client-side only

### 5. Lighthouse SEO Audit

**What it shows:** SEO score and issues

**How to use:**
1. Open DevTools → Lighthouse tab
2. Select "SEO" category
3. Run audit
4. Check:
   - "Document has a `<title>` element" ✅
   - "Document has a meta description" ✅
   - "Text is readable and not too small" ✅
   - "Crawlable links" ✅

### 6. curl / wget Test

**What it shows:** What a simple HTTP client (like some crawlers) sees

**How to use:**
```bash
# Get the raw HTML
curl https://your-domain.com/docs/design/README > page.html

# Check if content is in the HTML
grep "Your Content Here" page.html

# If found → ✅ Server-rendered
# If not found → ❌ Client-side only
```

### 7. Google Search Console (Production)

**What it shows:** How Google actually sees your pages

**How to use:**
1. Submit your site to Google Search Console
2. Use "URL Inspection" tool
3. Click "Test Live URL"
4. View the "HTML" tab to see what Googlebot sees

## Specific Checks for Documentation Viewer

### Check 1: Initial HTML Contains Content

1. Visit `/docs/design/README` (or any doc page)
2. View page source
3. Search for markdown content (e.g., a heading from your README)
4. ✅ Should find it in the HTML

### Check 2: No Client-Side API Calls for Initial Content

1. Open Network tab
2. Filter by "Fetch/XHR"
3. Refresh page
4. Should NOT see calls to:
   - `/api/docs/list` (for initial content)
   - `/api/docs/metadata` (for initial content)
   - Direct markdown file fetches (for initial content)

Note: These calls are OK for navigation/search, but initial content should be in HTML.

### Check 3: Meta Tags Are Present

1. View page source
2. Search for `<meta` tags
3. Should see:
   - `<meta name="description" content="...">`
   - `<meta property="og:title" content="...">`
   - `<meta property="og:description" content="...">`

### Check 4: Structured Data (JSON-LD)

1. View page source
2. Search for `application/ld+json`
3. Should see:
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "Article",
     ...
   }
   </script>
   ```

## Common Issues

### Issue: Content Not in Page Source

**Symptom:** View page source shows empty divs or loading states

**Cause:** Component is client-side only, using `useEffect` to load content

**Fix:** Ensure you're using the server-rendered route (`/docs/[...path]`) not client-only routes

### Issue: API Calls on Initial Load

**Symptom:** Network tab shows API calls when page first loads

**Cause:** Component is fetching content client-side instead of receiving it as props

**Fix:** Check that `initialContent` prop is being passed from server component

### Issue: Meta Tags Missing

**Symptom:** No meta tags in page source

**Cause:** Not using Next.js `generateMetadata` function

**Fix:** Ensure server component has `generateMetadata` export

## Quick Test Script

Save this as `test-seo.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>SEO Test</title>
</head>
<body>
    <h1>SEO Verification Test</h1>
    <p>Open this page, then:</p>
    <ol>
        <li>View page source (Ctrl+U)</li>
        <li>Check if content is in HTML</li>
        <li>Disable JavaScript and refresh</li>
        <li>Check if content is still visible</li>
    </ol>
    <script>
        // This simulates client-side content
        setTimeout(() => {
            document.body.innerHTML += '<p style="color:red">This is CLIENT-SIDE content (not in source)</p>';
        }, 1000);
    </script>
</body>
</html>
```

## Browser Extensions

- **Disable JavaScript** - Test without JS
- **React DevTools** - Inspect React components
- **SEO META in 1 CLICK** - Quick meta tag checker
- **Lighthouse** - Built into Chrome DevTools

## Automated Testing

You can also use tools like:
- **Puppeteer** / **Playwright** - Automated browser testing
- **Google's Mobile-Friendly Test** - https://search.google.com/test/mobile-friendly
- **Schema Markup Validator** - https://validator.schema.org/

## Summary

✅ **Server-rendered content:**
- Appears in "View Page Source"
- Visible with JavaScript disabled
- In initial HTML response
- Has proper meta tags
- Has structured data

❌ **Client-side only content:**
- Not in page source
- Requires JavaScript
- Loaded via API calls after page load
- Not visible to basic crawlers

