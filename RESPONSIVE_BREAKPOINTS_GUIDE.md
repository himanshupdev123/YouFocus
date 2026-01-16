# Responsive Breakpoints Guide

## Overview

The Focused YouTube Viewer uses a mobile-first responsive design approach with three main breakpoints.

## Breakpoints

### 📱 Mobile (< 768px)

**VideoFeed Grid:**
- 1 column layout
- Full-width video cards
- Stacked filter controls
- Vertical header layout

**Touch Targets:**
- All buttons: minimum 44x44px
- All inputs: minimum 44px height
- Adequate spacing between elements

**Typography:**
- Base font size: 14px
- H1: 1.75rem (28px)
- H2: 1.375rem (22px)
- H3: 1.125rem (18px)

**Layout Changes:**
- Forms stack vertically
- Buttons expand to full width
- Navigation items stack
- Reduced padding (16px)

### 📱 Tablet (768px - 1024px)

**VideoFeed Grid:**
- 2-3 columns (280px minimum per column)
- Responsive grid with auto-fill
- Horizontal filter controls
- Horizontal header layout

**Touch Targets:**
- Maintained at 44x44px minimum
- Comfortable spacing for touch

**Typography:**
- Base font size: 16px (default)
- Standard heading sizes

**Layout:**
- Forms can be horizontal
- Buttons can be inline
- More comfortable spacing

### 🖥️ Desktop (1024px - 1400px)

**VideoFeed Grid:**
- 3-4 columns (320px minimum per column)
- Responsive grid with auto-fill
- Full horizontal layout

**Interaction:**
- Hover effects enabled
- Mouse-optimized interactions
- Keyboard navigation

**Typography:**
- Base font size: 16px
- Full heading sizes

**Layout:**
- Maximum content width: 1400px
- Centered content
- Comfortable padding (20px)

### 🖥️ Large Desktop (> 1400px)

**VideoFeed Grid:**
- 4+ columns (340px minimum per column)
- Maximum content width maintained
- Extra spacing for comfort

## Component-Specific Breakpoints

### VideoFeed Component

```css
/* Desktop (>1400px) */
.video-grid {
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
}

/* Desktop (1024-1400px) */
.video-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

/* Tablet (768-1024px) */
.video-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

/* Mobile (<768px) */
.video-grid {
  grid-template-columns: 1fr;
}
```

### OnboardingScreen Component

```css
/* Mobile (<768px) */
- Container padding: 2rem 1.5rem
- Title: 1.5rem
- Buttons stack vertically
- Channel thumbnails: 40px
```

### ChannelManager Component

```css
/* Mobile (<768px) */
- Form stacks vertically
- Add button: full width
- Channel thumbnails: 48px
- Remove buttons: 44x44px
```

## Testing Checklist

### Mobile Testing (< 768px)
- [ ] VideoFeed shows 1 column
- [ ] All buttons are at least 44x44px
- [ ] No horizontal scrolling
- [ ] Text is readable without zooming
- [ ] Forms stack vertically
- [ ] Touch targets are easy to tap

### Tablet Testing (768px - 1024px)
- [ ] VideoFeed shows 2-3 columns
- [ ] Layout adapts smoothly
- [ ] Touch targets remain adequate
- [ ] Spacing is comfortable

### Desktop Testing (> 1024px)
- [ ] VideoFeed shows 3-4 columns
- [ ] Hover effects work
- [ ] Keyboard navigation works
- [ ] Content is centered with max-width

## Browser DevTools Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test these presets:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1920px)

### Firefox DevTools
1. Open DevTools (F12)
2. Click "Responsive Design Mode" (Ctrl+Shift+M)
3. Test same presets as Chrome

## Common Responsive Patterns Used

### 1. Fluid Grid
```css
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
```

### 2. Flexible Containers
```css
.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
```

### 3. Media Queries
```css
@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
  }
}
```

### 4. Touch-Friendly Sizing
```css
button {
  min-height: var(--touch-target-min); /* 44px */
  padding: 0.75rem 1.5rem;
}
```

### 5. Responsive Typography
```css
@media (max-width: 768px) {
  :root {
    font-size: 14px;
  }
}
```

## Accessibility Considerations

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  :root {
    --color-border: #000000;
  }
}
```

### Focus Visible
```css
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Performance Optimizations

1. **CSS Custom Properties**: Consistent values, easy to maintain
2. **Efficient Selectors**: Class-based, not overly specific
3. **Minimal Media Queries**: Only where necessary
4. **Hardware Acceleration**: Transform and opacity for animations
5. **Lazy Loading**: Images load as they enter viewport

## Future Enhancements

Potential improvements for future iterations:
- Container queries for component-level responsiveness
- Dark mode support
- Additional breakpoints for ultra-wide displays
- Enhanced tablet landscape layouts
- PWA optimizations for mobile devices
