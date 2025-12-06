# Eshaal Store E-Commerce Design Guidelines

## Design Approach
Premium e-commerce platform drawing inspiration from Shopify's clean layouts and Stripe's sophisticated aesthetic, elevated with modern glassmorphism treatments. Focus on conversion optimization while maintaining visual luxury.

**Core Principles:**
- Visual hierarchy through layered glass effects and depth
- Trust-building through professional polish and Pakistani payment integration
- Product-first layouts with strategic whitespace
- Smooth micro-interactions enhancing premium feel

## Typography System
**Primary Font:** Inter (Google Fonts CDN)

**Hierarchy:**
- Hero Headlines: 48-56px, font-weight 700, tight letter-spacing (-0.02em)
- Section Headers: 32-40px, font-weight 600
- Product Titles: 18-20px, font-weight 500
- Body Text: 16px, font-weight 400, line-height 1.6
- Small Text/Prices: 14px, font-weight 500
- CTAs: 16px, font-weight 600, uppercase tracking

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Section padding: py-16 to py-24 (desktop), py-12 (mobile)
- Card padding: p-6 to p-8
- Element gaps: gap-4 to gap-8
- Container: max-w-7xl with px-6

**Grid Strategy:**
- Product grids: 4 columns (lg), 2 columns (md), 1 column (mobile)
- Category showcase: 3 columns (lg), 2 columns (md)
- Feature sections: 2-3 columns max
- Checkout: 2-column split (form + order summary)

## Core Components

**Navigation Bar:**
Glassmorphic sticky header with backdrop blur, logo left, search center, cart/account icons right, mega-menu for categories with product preview cards

**Product Cards:**
Elevated design with subtle shadow, rounded corners (12px), product image with aspect ratio 4:3, overlay gradient on hover revealing quick-view/add-to-cart, price with strikethrough for discounts, rating stars, glassmorphic badge for "Sale/New"

**Category Cards:**
Large format with gradient overlay on image, bold white category name, product count subtitle, hover effect lifting card with increased shadow

**Call-to-Action Buttons:**
Primary (blue gradient): px-8 py-3.5, rounded-lg, shadow-lg, scale transform on hover
Secondary (outlined): border-2, transparent background with blur when on images
Icons: Heroicons via CDN

**Payment Trust Section:**
Horizontal row of Pakistani payment logos (EasyPaisa, JazzCash, HBL) with glassmorphic containers, subtle pulse animation on page load

**Cart/Wishlist:**
Floating badge indicator, slide-out panel with glassmorphic background, product thumbnails with quantity controls, sticky checkout summary

## Images Section

**Hero Image:**
Full-width banner (1920x800px) featuring Pakistani lifestyle/shopping scene or product showcase. Place prominent search bar and category pills overlaid with glassmorphic blur backgrounds. Hero text uses gradient text treatment.

**Product Images:**
Square format (800x800px) minimum, white/neutral backgrounds for consistency, lifestyle shots for featured collections

**Category Banners:**
Rectangular (600x400px) showcasing category products in lifestyle context

**Trust Badges:**
Payment provider logos, secure checkout icons, delivery partner logos

**Placement Strategy:**
Hero occupies 70-80vh, product grids below with 4-up layout, category showcase uses full-width cards in 3-column grid, testimonials section includes customer photos in circular frames

## Visual Effects & Treatments

**Glassmorphism Implementation:**
- Navigation, cards, overlays: backdrop-filter blur(12px), semi-transparent white background (rgba opacity 0.1-0.2), subtle border (1px rgba white 0.18)
- Layering: z-index hierarchy for depth perception
- Shadows: multi-layered soft shadows (0 8px 32px rgba)

**Gradient Backgrounds:**
- Page background: Subtle blue-to-green radial gradient
- Hero section: Diagonal gradient overlay on image
- CTAs: Blue-to-darker-blue horizontal gradient
- Card hovers: Gradient border reveal effect

**Animations (Subtle):**
- Page load: Fade-in with slight upward translation (200ms delay between sections)
- Product cards: Scale 1.02 on hover, shadow increase
- Add-to-cart: Brief scale pulse feedback
- Scroll: Parallax effect on hero background (0.5 speed)

## Key Page Sections

**Homepage Structure:**
1. Hero with search + category quick links (80vh)
2. Featured categories (3-column grid, py-20)
3. Trending products (4-column grid, py-16)
4. Promotional banner (full-width glassmorphic card)
5. New arrivals (4-column grid, py-16)
6. Payment trust section (centered logos, py-12)
7. Footer (4-column: Categories, Support, Company, Newsletter signup with glassmorphic input)

**Product Listing:**
Sidebar filters (glassmorphic sticky panel), 4-column product grid, load-more pagination

**Product Detail:**
2-column: Image gallery left (with thumbnails), details right (title, price, variants selector with glassmorphic chips, quantity, add-to-cart), tabs below for description/reviews

**Checkout:**
Multi-step progress bar (glassmorphic), 2-column: Form left (shipping, payment method selector with EasyPaisa/JazzCash/HBL cards), order summary right (sticky, glassmorphic card)