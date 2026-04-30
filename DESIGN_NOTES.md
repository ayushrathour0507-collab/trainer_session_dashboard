# Design System - Bytes & Beyond

## Design Inspiration
This application is inspired by modern, premium evaluation platforms like TechTalk, with a dark theme optimized for professional environments.

## Color Palette

### Primary Colors
- **Background**: `#0f1419` (Deep dark navy)
- **Card Background**: `#1a1f2e` (Dark slate)
- **Card Hover**: `#2a2f3e` (Lighter slate)
- **Border**: `#2d3748` (Dark border)
- **Accent/Gold**: `#ffd700` (Golden yellow)
- **Accent Hover**: `#ffed4e` (Bright gold)

### Text Colors
- **Primary Text**: `#f8fafc` (Off-white)
- **Secondary Text**: `#cbd5e1` (Light gray)
- **Muted Text**: `#64748b` (Dark gray)
- **Accent Text**: `#ffd700` (Golden)

### Status Colors
- **Success**: `#10b981` / `#059669` (Emerald)
- **Warning**: `#f59e0b` / `#d97706` (Amber)
- **Error**: `#ef4444` / `#dc2626` (Red)

## Typography

### Font Families
- **Headings**: 'Playfair Display' (Serif) - Premium, elegant
- **Body**: 'Inter' (Sans-serif) - Clean, modern

### Font Sizes
- **serif-xl**: `text-5xl md:text-6xl` (Hero headings)
- **serif-lg**: `text-3xl md:text-4xl` (Page titles)
- **serif-md**: `text-2xl` (Section headings)
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Tiny**: `text-xs` (12px)

### Font Weights
- **Body text**: 400 (Regular)
- **Labels & small text**: 500-600 (Medium-Semibold)
- **Headings**: 700-900 (Bold-Black)

## Components

### Cards
```css
.card {
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 8px;
  transition: all 300ms;
  
  &:hover {
    border-color: #ffd700;
    box-shadow: 0 20px 25px rgba(255, 215, 0, 0.1);
  }
}
```

### Buttons
- **Primary**: Gold background (#ffd700), dark text
- **Secondary**: Dark background, gold border, gold text
- **Ghost**: Transparent, text changes to gold on hover

### Stats Boxes
- Large number in gold
- Small uppercase label in gray
- Subtle hover effect with gold border

### Badges
- Inline elements with colored backgrounds
- `badge-success`: Emerald tint
- `badge-pending`: Amber tint
- `badge-gold`: Golden tint

## Spacing System (8px grid)
- `gap-1` = 4px
- `gap-2` = 8px
- `gap-3` = 12px
- `gap-4` = 16px
- `gap-5` = 20px
- `gap-6` = 24px

## Animations

### Fade In Up
Subtle entrance animation for main content
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Glow
Pulsing text glow effect for premium feel
```css
@keyframes glow {
  50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
}
```

## Layout Patterns

### Header
- Fixed sticky header with logo and navigation
- Glass-morphism effect (backdrop-blur)
- User info and logout button right-aligned

### Navigation
- Horizontal tabs under header
- Icons + labels for clarity
- Active state with gold accent bottom border

### Dashboard Grid
- Responsive grid layout
- 1 column mobile, 2-3 columns desktop
- Sessions grouped by month
- Card-based layout for individual sessions

### Monthly Rankings
- Trophy winner highlighted with gold gradient
- Leaderboard format (#1, #2, #3)
- Mini stats for each entry

## Accessibility

### Contrast Ratios
- Gold (#ffd700) on dark (#0f1419): 13.5:1 (AAA)
- Off-white (#f8fafc) on dark (#0f1419): 17.5:1 (AAA)
- Gray (#cbd5e1) on dark (#0f1419): 9.2:1 (AAA)

### Interactive Elements
- All buttons have clear focus states
- Hover states provide visual feedback
- Icons paired with text labels
- Form inputs have clear labels

## Dark Mode
This application uses a dark-first design philosophy:
- Reduces eye strain in low-light environments
- Premium aesthetic suitable for professional use
- Golden accents provide visual hierarchy
- Better for focused work sessions

## Responsive Design
- Mobile: 1 column, smaller text
- Tablet: 2 columns, adjusted spacing
- Desktop: Full grid with 3+ columns
- All touch targets minimum 44px × 44px

---

**Design Philosophy**: Premium, professional, focused. Every element serves a purpose. Golden accents guide attention. Dark background reduces fatigue. Clean typography emphasizes content.
