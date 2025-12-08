# Build and Serve Commands

## Development vs Production

### Development Mode (`npm run dev`)
- **Hot reloading** - Changes reflect immediately
- **Source maps** - Easier debugging
- **Slower** - Not optimized
- **Client-side rendering** - Some pages may not be server-rendered
- **Use for:** Active development

### Production Mode (`npm run build` + `npm run start`)
- **Optimized** - Code is minified and optimized
- **Faster** - Better performance
- **Server-side rendering** - All pages are pre-rendered
- **No hot reload** - Must rebuild for changes
- **Use for:** Testing production behavior, SEO verification

## Available Commands

### Development
```bash
npm run dev
```
Starts development server with hot reloading at `http://localhost:3000`

### Build
```bash
npm run build
```
Creates optimized production build in `.next` folder

### Start Production Server
```bash
npm run start
```
Serves the production build (must run `build` first)

### Build and Serve (One Command)
```bash
npm run serve
```
Builds and starts production server in one command

### Production Mode
```bash
npm run serve:prod
```
Builds and starts with `NODE_ENV=production` explicitly set

### Build Analysis
```bash
npm run build:analyze
```
Builds with bundle analysis (requires `ANALYZE=true`)

## Testing Server-Side Rendering

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Start Production Server
```bash
npm run start
```

### Step 3: Test with JavaScript Disabled
1. Open `http://localhost:3000/docs/design/README`
2. Disable JavaScript in DevTools
3. Refresh page
4. Content should still be visible ✅

### Step 4: Verify Page Source
1. Right-click → "View Page Source"
2. Search for your documentation content
3. Should find it in the HTML ✅

## Quick Test Script

```bash
# Build and serve in one command
npm run serve

# In another terminal, test SEO
node scripts/verify-seo.js http://localhost:3000/docs/design/README
```

## Important Notes

### Development Mode Limitations
- In dev mode, Next.js may not fully server-render all pages
- Some content may still load client-side
- **Always test in production build for SEO verification**

### Production Build Benefits
- All server components are fully rendered
- Static pages are pre-generated
- Better performance
- SEO-friendly

### When to Use Each

**Use Development Mode:**
- Active coding/development
- Testing new features
- Debugging

**Use Production Build:**
- SEO verification
- Performance testing
- Pre-deployment testing
- Verifying server-side rendering

## Troubleshooting

### Content Not Showing with JS Disabled
1. Make sure you're using production build (`npm run build`)
2. Check that you're visiting `/docs/[...path]` routes, not old client routes
3. Verify page source contains content

### Build Errors
- Check for TypeScript errors: `npm run build`
- Check for linting errors: `npm run lint`
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Port Already in Use
- Change port in `package.json`: `"start": "next start -p 3001"`
- Or kill process using port: `lsof -ti:3000 | xargs kill`

