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
  - Blue: `#1779DE` (primary blue)
  - Orange: `#FF811C` (primary orange)
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
  - Implemented grid layout for article cards
  - Added "記事一覧へ" (To article list) button
  - Removed pagination from home page
  - Card layout includes thumbnail, title, and date

### Current Implementation Status
- Home page shows 6 latest articles in card format
- Brand colors applied throughout layout
- Site title changed from database title to "TOBIRACAST"
- Footer includes copyright and branding

### Next Priority Tasks
- ☐ **Notion DB Schema Extension** - Add `IsPremium` and `PremiumContent` properties
- ☐ **Article Detail Page** - Add premium content section with paywall
- ☐ **Responsive Design** - Optimize mobile layout for article cards

### Technical Notes for Development
- Color variables defined in CSS custom properties for easy theming
- Article cards use CSS Grid for responsive layout
- Brand colors accessible via `var(--tobiracast-primary-blue)` and `var(--tobiracast-primary-orange)`
- Site constants centralized in `server-constants.ts` for easy configuration

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