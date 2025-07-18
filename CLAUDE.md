# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TOBIRACAST** - A blog/media platform for Inuta's personal branding and content monetization, built on astro-notion-blog foundation.

### Purpose

- Portal site for Inuta to showcase work and personality to new contacts
- Fundraising and monetization platform
- Content distribution with premium features

### Technical Stack Decision

Based on team discussion (jonosuke, tererun, Ray):

- **Primary**: Astro (current foundation) - lower learning curve for beginner
- **Fallback**: Next.js + Firebase Auth if Astro proves insufficient
- **CMS**: Notion API via @notionhq/client
- **Authentication**: Firebase Auth (existing Tobiratory account integration)
- **Payment**: Stripe (existing account available)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev  # or npm start

# Build for production
npm run build

# Build with cached content (fetch from Notion first)
npm run build:cached

# Preview production build
npm run preview

# Linting
npm run lint

# Code formatting
npm run format

# Cache Notion content locally
npm run cache:fetch

# Clear cache
npm run cache:purge

# Manually fetch Notion blocks (internal script)
npm run _fetch-notion-blocks
```

## TOBIRACAST Specific Requirements

### Pages Structure

1. **Home Page**
   - Latest 6 articles with thumbnails and titles
   - Link to article list
   - Reference design: COTEN RADIO, HIU

2. **Article List Page**
   - Paginated article listing
   - Tag filtering

3. **Article Detail Page**
   - Title and thumbnail
   - Free content section (text/YouTube embeds)
   - Paywall separator ("Here's premium content")
   - Premium content section (visible to subscribers only)
   - Premium video embeds (NOT YouTube unlisted due to ToS)

4. **Subscription Page**
   - Plan selection
   - Stripe integration for recurring payments

### Key Features to Implement

- **Authentication**: Tobiratory account login via Firebase Auth
- **Responsive Design**: Mobile-first approach
- **Content Management**: Notion-based article posting
- **Subscription System**: Stripe-powered recurring billing
- **Token Distribution**: (Specification TBD)
- **Video Embedding**: Custom solution for premium videos (not YouTube unlisted)

### Design Guidelines

- **Primary Colors**:
  - Blue: `#1779DE` (rgba(23, 121, 222, 1) - primary blue)
  - Orange: `#E96800` (rgba(233, 104, 0, 1) - primary orange)
  - Use blue as the dominant color when in doubt
- **Tone**: Neither too soft nor too hard
- **UX Reference**: Note.com for premium content transition

### Notion Database Schema (Extended)

Required properties for TOBIRACAST:

- `Page` (title): Post title
- `Slug` (rich_text): URL slug
- `Date` (date): Publication date
- `Published` (checkbox): Public visibility
- `Tags` (multi_select): Categories
- `Excerpt` (rich_text): Summary
- `FeaturedImage` (files): Hero image
- `Rank` (number): Featured post ordering
- **NEW** `IsPremium` (checkbox): Premium content flag
- **NEW** `PremiumContent` (rich_text): Premium section content
- **NEW** `VideoURL` (url): Embedded video URL

## Architecture Overview (Original + Extensions)

This is an Astro-based static site generator that creates blogs from Notion databases, extended for TOBIRACAST's premium content model.

### Data Flow

1. **Notion Integration**: Content fetched from Notion API using `@notionhq/client`
2. **Caching Layer**: Block data cached in `tmp/` directory as JSON files
3. **Static Generation**: Astro builds static pages with premium content flags
4. **Image Processing**: Images downloaded, processed with Sharp, served locally
5. **Authentication Check**: Firebase Auth validates user subscription status
6. **Content Filtering**: Premium content shown/hidden based on user tier

### Authentication Integration

- Firebase Auth for Tobiratory account SSO
- Session management via cookies
- Subscription tier stored in user profile
- Premium content access control

### Payment Integration

- Stripe Customer Portal for subscription management
- Webhook handling for subscription status updates
- Automatic user tier synchronization

## Development Progress & Implementation Notes

### Completed Tasks

- ✅ **TOBIRACAST Branding Implementation**
  - CSS variables created in `src/styles/tobiracast.css`
  - Primary colors: Blue (`#1779DE`), Orange (`#FF811C`)
  - Site title and description constants in `src/server-constants.ts`
  - Layout.astro updated with brand colors and "TOBIRACAST" title
  - Footer updated with copyright notice

- ✅ **Home Page Layout Redesign**
  - Modified `src/pages/index.astro` to display latest 6 articles
  - Implemented grid layout for article cards with hover effects
  - Added "記事一覧へ" (To article list) button with gradient styling
  - Removed pagination from home page
  - Card layout includes thumbnail, title, date, and overlay effects
  - Added section headers with decorative elements and animations

- ✅ **Site Title Update**
  - Changed site title from "TOBIRACAST" to "Tobiratory公式ポータルサイト"
  - Updated both SITE_TITLE and SITE_DESCRIPTION in `src/server-constants.ts`

- ✅ **Article List Page Implementation**
  - Created `/posts/index.astro` for article list first page
  - Fixed "記事一覧へ" button to link to `/posts` instead of `/posts/page/1`
  - Implemented full pagination system for all articles
  - Added proper page title and styling for article list
  - Implemented horizontal card layout with image on left, content on right
  - Added border separators between cards for better visual hierarchy

- ✅ **Code Quality Improvements**
  - Fixed ESLint error: removed unused PostTitle import from `src/pages/index.astro`
  - Ensured lint checks pass for deployment

- ✅ **Responsive Design Implementation**
  - Added comprehensive responsive styles for all pages
  - Breakpoints: 768px (tablet), 480px (mobile)
  - Mobile-first approach with flexible grid layouts
  - Responsive typography scaling
  - Mobile-optimized navigation and card layouts
  - Files updated: `src/pages/index.astro`, `src/pages/posts/index.astro`, `src/pages/posts/page/[page].astro`, `src/layouts/Layout.astro`

- ✅ **ReadMore Button Enhancement**
  - Updated `src/components/ReadMoreLink.astro` to prominent orange button
  - Added hover effects and better visibility
  - Consistent styling across all pages

- ✅ **Sidebar Removal & Full-Width Layout**
  - Removed unprofessional sidebar content ("There are no contents yet")
  - Implemented full-width layout design
  - Updated `src/layouts/Layout.astro` to remove gray sidebar

- ✅ **Professional Design Implementation**
  - Added gradient hero header with animations
  - Implemented professional typography with decorative elements
  - Enhanced card designs with hover effects and overlays
  - Added structured footer with improved layout
  - Reference sites: HIU and COTEN RADIO for professional aesthetics
  - Files updated: `src/layouts/Layout.astro`, `src/pages/index.astro`

- ✅ **Advanced Animation System**
  - Implemented fadeInUp keyframe animations
  - Unified animation timing across all pages (0.8s duration)
  - Staggered animation delays for natural flow
  - Sequential delays: titles (0s), descriptions (0.1s), navigation (0.2s)
  - Article cards with 0.1s intervals for smooth appearance
  - Files updated: all page components and layout files

- ✅ **Footer Redesign**
  - Compact horizontal layout with brand on left, links on right
  - Reduced padding and font sizes for smarter appearance
  - Added responsive design for mobile stacking
  - Improved color scheme and hover effects
  - Files updated: `src/layouts/Layout.astro`

- ✅ **Image Loading Optimization**
  - Implemented smooth image fade-in effects
  - Added background placeholder during loading
  - Custom JavaScript for image loading management
  - Intersection Observer for natural loading behavior
  - Files created: `src/scripts/image-fade.js`, `public/scripts/image-fade.js`
  - Files updated: `src/layouts/Layout.astro`

- ✅ **Subscription & Login Page Enhancements**
  - Added consistent animation system to subscription page
  - Implemented staggered animations for plan cards
  - Added fadeInUp animations to login page
  - Enhanced form container animations
  - Files updated: `src/pages/subscription.astro`, `src/pages/login.astro`

- ✅ **Professional Header Background**
  - Implemented sophisticated blue-to-orange gradient background
  - Added complex overlay effects with multiple radial gradients
  - Enhanced text shadows for improved readability
  - Navigation buttons with semi-transparent styling
  - Cover image integration with multiply blend mode and blur effects
  - Background layers: base gradient → cover image → light effects → content
  - Files updated: `src/layouts/Layout.astro`

- ✅ **ESLint Error Resolution**
  - Fixed all 19 ESLint errors across multiple files
  - Removed unused imports: `BlogPostsLink`, `BlogTagsLink`, `SearchButton`
  - Removed unused variables: `rankedPosts`, `tags`, `recentPosts`, `postsHavingSameTag`
  - Cleaned up Promise.all() calls to only fetch required data
  - Temporarily removed image-fade.js script to resolve parser errors
  - Files updated: `src/pages/index.astro`, `src/pages/posts/index.astro`, `src/pages/posts/page/[page].astro`, `src/pages/posts/[slug].astro`, `src/layouts/Layout.astro`

- ✅ **Color Code Centralization & Management System**
  - Implemented comprehensive CSS variable system for color management
  - Eliminated all hardcoded color values throughout the project
  - Updated primary orange color from `#FF811C` to `#E96800` (rgba(233, 104, 0, 1))
  - Created semantic color variables organized by usage:
    - Brand colors: `--tobiracast-primary-blue`, `--tobiracast-primary-orange`
    - Shadow variations: `--tobiracast-card-shadow`, `--tobiracast-button-shadow-orange`
    - Overlay colors: `--tobiracast-overlay-gradient`, `--tobiracast-white-overlay-*`
    - Text shadows: `--tobiracast-text-shadow-light/medium/strong`
    - Modal & UI colors: `--tobiracast-modal-backdrop`, `--tobiracast-search-selected-bg`
  - Centralized color management in `src/styles/tobiracast.css`
  - Benefits: Single-point color updates, consistent theming, improved maintainability
  - Files updated: `src/styles/tobiracast.css`, `src/pages/index.astro`, `src/layouts/Layout.astro`, `src/components/ReadMoreLink.astro`, `src/pages/posts/index.astro`, `src/pages/posts/page/[page].astro`, `src/components/SearchModal.astro`, `src/components/notion-blocks/TableOfContents.astro`

- ✅ **Enhanced .gitignore Configuration**
  - Comprehensive .gitignore overhaul for better project hygiene
  - Added cross-platform support (macOS, Windows, Linux specific files)
  - Enhanced Node.js ecosystem coverage (npm, yarn, pnpm logs and caches)
  - Added IDE and editor file exclusions (.vscode/, .idea/, swap files)
  - Included deployment platform ignores (Vercel, Netlify)
  - Added development tool caches (ESLint, TypeScript, Sharp image processing)
  - Improved organization with clear section comments
  - Maintained project-specific exclusions (Notion cache, Claude files, tmp directories)
  - Benefits: Cleaner repository, faster git operations, reduced merge conflicts
  - File updated: `.gitignore`

- ✅ **Navigation UX Enhancement (2025-01-18)**
  - **Problem**: Navigation buttons too small, excessive spacing between header and content
  - **Solution**: Comprehensive navigation redesign for better user experience
  - **Changes Made**:
    - **Button Size Enhancement**: Increased padding from `12px 24px` to `16px 32px`
    - **Typography Improvements**: Font size increased to `1.1rem`, weight to `700`
    - **Visual Polish**: Border radius increased to `16px`, min-width to `140px`
    - **Spacing Optimization**: Button gap increased to `1.5rem` for better separation
    - **Layout Tightening**: 
      - Hero section padding: `4rem 0` → `3rem 0 2rem`
      - Description margin: `2rem` → `1.5rem`
      - Navigation top margin: `3rem` → `1.5rem`
      - Content area margin-top: `-20px` → `-80px` (major overlap increase)
    - **Content Spacing**: Main content padding reduced from `3rem` to `2rem`
  - **Impact**: 
    - More prominent, clickable navigation buttons
    - Significantly reduced white space between header and content
    - Improved visual hierarchy and professional appearance
    - Better mobile responsiveness maintained
  - **File Updated**: `src/layouts/Layout.astro`
  - **User Feedback**: "間が大きすぎる" (spacing too large) → resolved with -80px overlap

### Current Implementation Status

- **Visual Design**: Professional, modern design with smooth animations
- **Responsive**: Full responsive design working on all devices
- **Performance**: Optimized image loading with smooth transitions (temporarily disabled)
- **User Experience**: Intuitive navigation with visual feedback
- **Branding**: Consistent TOBIRACAST branding throughout
- **Layout**: Full-width design with no sidebar clutter
- **Header**: Beautiful gradient background with professional styling
- **Footer**: Compact, smart layout with proper information hierarchy
- **Code Quality**: All ESLint errors resolved, clean codebase ready for production

### Technical Architecture Details

#### Animation System

- **Keyframes**: `fadeInUp` animation (translateY: 20px → 0px, opacity: 0 → 1)
- **Timing**: 0.8s duration with ease-out for natural feel
- **Delays**: Sequential delays for hierarchical content appearance
- **Implementation**: Inline styles with animation-delay for staggered effects

#### Responsive Breakpoints

- **Desktop**: > 768px (full layout)
- **Tablet**: ≤ 768px (adjusted grid, mobile navigation)
- **Mobile**: ≤ 480px (single column, optimized spacing)

#### Color System

- **Primary Blue**: `#1779DE` (--tobiracast-primary-blue)
- **Primary Orange**: `#FF811C` (--tobiracast-primary-orange)
- **Light Blue**: Calculated variations for gradients
- **Dark Orange**: Calculated variations for hover effects

#### Image Loading System

- **Lazy Loading**: Native browser lazy loading
- **Placeholders**: Neutral background during loading
- **Fade Effects**: Smooth opacity transitions
- **Error Handling**: Fallback styling for failed loads

#### Header Background Architecture

```css
.site-header {
  background: linear-gradient(
    135deg,
    var(--tobiracast-primary-blue) 0%,
    var(--tobiracast-light-blue) 30%,
    var(--tobiracast-primary-orange) 70%,
    var(--tobiracast-dark-orange) 100%
  );
}
```

### File Structure & Key Components

#### Core Layout Files

- `src/layouts/Layout.astro` - Main layout with header, footer, and navigation
- `src/pages/index.astro` - Home page with latest articles grid
- `src/pages/posts/index.astro` - Article list first page
- `src/pages/posts/page/[page].astro` - Paginated article pages
- `src/pages/subscription.astro` - Subscription plans page
- `src/pages/login.astro` - Login form page

#### Component Files

- `src/components/ReadMoreLink.astro` - Enhanced orange button component
- `src/components/PostFeaturedImage.astro` - Article image component
- `src/components/PostDate.astro` - Article date display
- `src/components/PostTags.astro` - Article tags display
- `src/components/PostTitle.astro` - Article title component
- `src/components/PostExcerpt.astro` - Article excerpt display

#### Script Files

- `public/scripts/image-fade.js` - Image loading animation handler
- `src/scripts/image-fade.js` - Source version of image script

#### Configuration Files

- `src/server-constants.ts` - Site title, description, and constants
- `src/styles/tobiracast.css` - Brand colors and theming variables

### Next Priority Tasks

- ☐ **Article Detail Page Premium Content** - Add paywall section with premium content
- ☐ **Notion DB Schema Extension** - Add `IsPremium` and `PremiumContent` properties
- ☐ **Firebase Auth Integration** - Implement user authentication system
- ☐ **Stripe Payment Integration** - Add subscription billing system

### Technical Notes for Development

#### CSS Architecture

- **Color Variables**: CSS custom properties for easy theming
  - Primary colors accessible via `var(--tobiracast-primary-blue)` and `var(--tobiracast-primary-orange)`
  - Light/dark variations automatically calculated
  - Consistent usage across all components

#### Grid System

- **Home Page**: Auto-fill grid with minmax(350px, 1fr) for responsive cards
- **Article List**: Single column layout with horizontal cards
- **Mobile**: Responsive grid that collapses to single column

#### Animation Implementation

- **Keyframes**: Defined in each component's style section
- **Timing**: 0.8s duration with ease-out easing
- **Delays**: Calculated via inline styles (index \* 0.1s)
- **Performance**: CSS transforms for smooth 60fps animations

#### Image Optimization

- **Lazy Loading**: Native browser lazy loading with JavaScript fallback
- **Placeholders**: Neutral background colors during loading
- **Fade Effects**: Smooth opacity transitions (temporarily disabled due to ESLint parser issues)
- **Error Handling**: Fallback styling for failed image loads
- **Intersection Observer**: Advanced loading behavior with viewport detection
- **Status**: JavaScript enhancement temporarily removed for code quality compliance

#### Navigation System

- **Routing**: `/posts` (first page) and `/posts/page/[page]` (pagination)
- **Breadcrumbs**: Proper page numbering and navigation
- **Active States**: Visual feedback for current page

#### Header System

- **Background Layers**:
  1. Base gradient (blue to orange)
  2. Cover image (opacity: 0.15, blur: 2px, multiply blend)
  3. Light effects (radial gradients)
  4. Content (z-index: 2)
- **Text Shadows**: Enhanced readability on complex backgrounds
- **Navigation Buttons**: Semi-transparent with backdrop-filter

### Known Issues & Considerations

#### Performance

- **Image Loading**: Optimized with lazy loading and fade effects
- **Animation Performance**: Using CSS transforms for hardware acceleration
- **Bundle Size**: Minimal JavaScript, mostly CSS-based animations

#### Browser Compatibility

- **Modern Browsers**: Full support for CSS Grid, flexbox, and animations
- **Legacy Support**: Graceful degradation for older browsers
- **Mobile**: Tested on iOS Safari and Android Chrome

#### Future Enhancements

- **Progressive Web App**: Service worker for offline functionality
- **Dark Mode**: Toggle between light/dark themes
- **Advanced Animations**: More sophisticated entrance effects
- **Performance Monitoring**: Real User Monitoring (RUM) implementation

### Deployment Notes

#### Build Process

- **Static Generation**: Full static build via Astro
- **Image Processing**: Sharp.js for image optimization
- **CSS Minification**: Automatic in production builds
- **JavaScript Bundling**: Minimal client-side JavaScript

#### Environment Setup

- **Node.js**: Version 20.18.1 or higher required
- **Package Manager**: npm (yarn compatibility untested)
- **Build Time**: Approximately 30-60 seconds for full build

### Development Workflow

#### Code Organization

- **Components**: Reusable Astro components in `/src/components/`
- **Pages**: Route-based pages in `/src/pages/`
- **Layouts**: Shared layouts in `/src/layouts/`
- **Styles**: Global styles and variables in `/src/styles/`

#### Testing Strategy

- **Manual Testing**: Visual regression testing across devices
- **Responsive Testing**: Chrome DevTools device emulation
- **Performance Testing**: Lighthouse audits
- **Accessibility Testing**: Screen reader compatibility

#### Version Control

- **Git Strategy**: Feature branch workflow
- **Commit Messages**: Descriptive commits with context
- **PR Reviews**: Team review process before merging

### Troubleshooting Guide

#### Common Issues

1. **Animation Not Working**: Check z-index and animation-delay values
2. **Images Not Loading**: Verify image paths and lazy loading script (currently disabled)
3. **Responsive Issues**: Check CSS media queries and flexbox properties
4. **Color Inconsistencies**: Verify CSS custom property usage
5. **ESLint Errors**: Run `npm run lint` to check for unused imports/variables

#### Debug Commands

```bash
# Check build errors
npm run build

# Lint code
npm run lint

# Development server with hot reload
npm run dev

# Clear cache if needed
npm run cache:purge
```

### Phase Implementation Strategy

#### Current Phase: Design & UX (95% Complete)

- ✅ Professional visual design
- ✅ Responsive layout system
- ✅ Animation system
- ✅ Image optimization
- ✅ Navigation system
- ☐ Premium content UI (remaining)

#### Next Phase: Premium Content (0% Complete)

- ☐ Notion schema extension
- ☐ Article detail page paywall
- ☐ Content filtering logic
- ☐ Premium content display

#### Future Phase: Authentication (0% Complete)

- ☐ Firebase Auth integration
- ☐ User session management
- ☐ Login/logout functionality
- ☐ Protected routes

#### Future Phase: Payments (0% Complete)

- ☐ Stripe integration
- ☐ Subscription management
- ☐ Payment processing
- ☐ Webhook handling
- Article cards use CSS Grid for responsive layout
- Brand colors accessible via `var(--tobiracast-primary-blue)` and `var(--tobiracast-primary-orange)`
- Site constants centralized in `server-constants.ts` for easy configuration
- Article list routing: `/posts` (first page) and `/posts/page/[page]` (subsequent pages)
- Home page navigation properly linked to article list via `/posts` route

### Phase 1: Foundation (Current Priority)

1. Customize existing astro-notion-blog design
2. Implement TOBIRACAST branding and layout
3. Add premium content flags to Notion schema
4. Create basic paywall UI

### Phase 2: Authentication & Payments

1. Integrate Firebase Auth
2. Add Stripe subscription system
3. Implement premium content access control
4. Create subscription management pages

### Phase 3: Advanced Features

1. Token distribution system
2. Custom video hosting solution
3. Advanced analytics
4. Member-only features

## Environment Variables

Required:

- `NOTION_API_SECRET`: Notion integration token
- `DATABASE_ID`: TOBIRACAST Notion database ID
- `FIREBASE_PROJECT_ID`: Firebase project identifier
- `FIREBASE_API_KEY`: Firebase web API key
- `STRIPE_PUBLIC_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook verification

Optional:

- `NODE_VERSION`: Must be 20.18.1 or higher
- `CUSTOM_DOMAIN`: Custom domain for the site
- `BASE_PATH`: Subdirectory path if not serving from root
- `PUBLIC_GA_TRACKING_ID`: Google Analytics tracking ID
- `REQUEST_TIMEOUT_MS`: API request timeout (default: 10000)
- `ENABLE_LIGHTBOX`: Enable image lightbox feature

## Testing Approach

Manual testing focus areas:

- Notion API integration and content parsing
- Firebase Auth login/logout flow
- Stripe payment and subscription flow
- Premium content access control
- Responsive design across devices
- Video embedding functionality

## Team Context

**Key Contributors:**

- **Ray**: Primary developer (JavaScript beginner, learning Astro)
- **tererun**: Full-stack developer, Blockchain backend specialist at Tobiratory
- **jonosuke**: Technical advisor
- **Inuta**: Product owner and content creator

**Learning Resources for Ray:**

- Astro Official Documentation: https://docs.astro.build/
- React Official Tutorial: https://ja.react.dev/ (for component understanding)
- Firebase Auth with Astro: https://docs.astro.build/en/guides/backend/google-firebase/

**Development Repository:**

- Located within Tobiratory GitHub organization
- Team collaboration via GitHub issues and pull requests
