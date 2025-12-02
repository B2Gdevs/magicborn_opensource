# Video Flicker/Lag Analysis & Solutions

## Why This Is Happening

### Current Issues:

1. **Multiple State Updates Causing Re-renders**
   - `setIsVideoReady(false)` when switching videos causes video to go `opacity-0`
   - React re-render delay causes black screen to show through
   - Multiple event listeners firing simultaneously (loadeddata, canplaythrough, React handlers)

2. **Race Conditions**
   - Both `addEventListener` and React `onLoadedData`/`onCanPlayThrough` handlers fire
   - This causes `setIsVideoReady(true)` to be called multiple times
   - Each call triggers a re-render

3. **Fallback Image Timing**
   - `{!isVideoReady && ...}` condition means image only shows when state is false
   - But React hasn't re-rendered yet when video goes to opacity-0
   - Black background shows through during this gap

4. **Preload Not Working**
   - Preload video element is created but never actually used
   - When switching, browser still needs to load the new video
   - Causes lag even with preload attempt

5. **Opacity Transition**
   - `transition-opacity duration-300` causes visible fade
   - During fade, if video isn't ready, black shows through
   - Multiple transitions stack up causing multiple lags

## Solutions

### Option 1: Dual Video Elements (Crossfade) - RECOMMENDED
**Pros:**
- Zero flicker (one video always visible)
- Smooth crossfade between videos
- No black screens
- Industry standard technique

**Cons:**
- Slightly more complex code
- Uses more memory (2 video elements)

**Implementation:**
- Two video elements, alternate between them
- When one ends, start the other
- Crossfade opacity between them
- Always have one visible

### Option 2: React Player Libraries

#### A. **react-player**
```bash
npm install react-player
```
- Handles buffering and loading states
- Built-in preloading
- Smooth transitions
- Supports multiple formats

#### B. **video.js** (with React wrapper)
```bash
npm install video.js @videojs/react
```
- Professional video player
- Excellent buffering
- Plugin ecosystem
- More features than needed

#### C. **plyr-react**
```bash
npm install plyr-react
```
- Modern, lightweight
- Good performance
- Smooth transitions
- Easy to use

### Option 3: Fix Current Implementation
**Changes needed:**
1. Remove duplicate event handlers (use either addEventListener OR React handlers, not both)
2. Keep fallback image always visible (don't conditionally render)
3. Use CSS z-index to layer properly
4. Remove opacity transition on video (instant switch when ready)
5. Better preloading strategy

### Option 4: CSS-Only Solution
- Use CSS `::before` pseudo-element for fallback
- Video always on top
- No React state for visibility
- Browser handles poster natively

## Recommendation

**Best approach: Dual Video Elements (Crossfade)**

This is the most reliable solution used by professional video sites. It guarantees:
- No black screens (always one video visible)
- Smooth transitions
- No flicker
- Works consistently across browsers

Would you like me to implement the dual video element solution, or try one of the library options?

