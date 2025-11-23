# Hot Takes Arena 🔥

[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/) [![React 19](https://img.shields.io/badge/React-19-149ECA?style=flat&logo=react&logoColor=white)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/) [![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=react-query&logoColor=white)](https://tanstack.com/query) [![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat)](https://opensource.org/licenses/MIT)

**Hot Takes Arena** is an anonymous voting platform where users share controversial opinions and vote on others' takes. Built with Next.js 15 and Supabase, it features controversy scoring, real-time updates, device fingerprinting for anonymous user tracking, and a mobile-first design. No authentication required—just drop your hottest take and watch the arena vote!

> Fostering open discourse through anonymous, judgment-free opinion sharing and democratic voting.

---

## ✨ Highlights

- **🔥 Controversy Scoring**: Algorithm ranks takes by how divisive they are using `min(agree, disagree) / total * 100`
- **👤 Anonymous Posting**: No sign-up required—device fingerprinting tracks users without authentication
- **⚡ Real-Time Voting**: Instant feedback with optimistic UI updates powered by TanStack Query
- **📊 Multiple Sort Options**: Controversial, Fresh, Trending, Top Agreed, Top Disagreed
- **🎯 Category Filters**: Tech & Gaming, Food & Drinks, Relationships, Sports, and more
- **🚨 Content Moderation**: Profanity filtering and user reporting system
- **⏱️ Rate Limiting**: Smart throttling (3 posts/hour, 100 votes/hour) prevents spam
- **📱 Mobile-First Design**: Touch-optimized with responsive layouts and smooth animations
- **🔒 Privacy-Focused**: IP addresses hashed, no personal data stored

---

## 🎯 Features

### Core Functionality

#### 📝 Post Your Take
- Write controversial opinions (280 characters max)
- Choose from 8+ categories
- Automatic profanity filtering
- Rate-limited to prevent spam (3 posts/hour)

#### 🗳️ Vote on Takes
- Simple Agree/Disagree buttons
- Vote percentages revealed after voting
- Heat meter visualization shows vote distribution
- Optimistic UI updates for instant feedback
- One vote per take per device (enforced via fingerprinting)

#### 🔥 Controversy Algorithm
```
Controversy Score = (min(agree_count, disagree_count) / total_votes) * 100

Examples:
- 50 agree, 50 disagree → 50.0 (maximum controversy)
- 90 agree, 10 disagree → 10.0 (low controversy)
- 100 agree, 0 disagree → 0.0 (no controversy - consensus)
```

**Why This Works**: Takes with ~50/50 splits rank highest, encouraging polarizing content while penalizing one-sided takes.

#### 🎭 Anonymous User Tracking
- **Device Fingerprinting**: Canvas + WebGL + browser properties
- **IP Hashing**: SHA-256 hashed IP addresses (never store plain IPs)
- **No Authentication**: Completely frictionless experience
- **~95% Accuracy**: Reliably identifies returning users across sessions

### Sorting & Filtering

| Sort Option | Description | Use Case |
|------------|-------------|----------|
| **Controversial** | Highest controversy score first | Find most divisive takes |
| **Fresh** | Newest takes first | See latest opinions |
| **Trending** | `total_votes / age_hours` | Discover hot topics |
| **Top Agreed** | Most agrees | Find popular consensus |
| **Top Disagreed** | Most disagrees | Find unpopular opinions |

### Performance Features

- **Infinite Scroll**: Smooth pagination with 20 takes per page
- **Batch Vote Checking**: Single query checks vote status for all visible takes
- **Smart Caching**: TanStack Query caches data with configurable freshness
- **Optimistic Updates**: UI updates instantly, rolls back on error
- **Query Invalidation**: Automatic refetch after mutations

---

## 🏗️ Architecture

### Tech Stack

<div align="center">

| Category | Technology |
|----------|------------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwind-css&logoColor=white) |
| **State** | ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=react-query&logoColor=white) • ![Zustand](https://img.shields.io/badge/Zustand-5-8B5CF6?logo=react&logoColor=white) |
| **Animation** | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-7C3AED?logo=framer&logoColor=white) |
| **Forms** | ![Zod](https://img.shields.io/badge/Zod-3-3DDC84?logoColor=white) |
| **Database** | ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white) |
| **UI Components** | ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Radix-000000?logo=radixui&logoColor=white) |
| **Notifications** | ![sonner](https://img.shields.io/badge/sonner-2-FF6B6B?logoColor=white) |

</div>

### Request Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. User Action (Vote, Post, Report)                             │
└────────────┬─────────────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. Client-Side Processing                                        │
│    • Generate device fingerprint (canvas + WebGL + browser)      │
│    • Hash IP address (SHA-256)                                   │
│    • Validate input with Zod                                     │
└────────────┬─────────────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. Server Action (Next.js 15 Pattern)                           │
│    • lib/actions/votes.ts → createVote()                         │
│    • lib/actions/takes.ts → createTake()                         │
│    • lib/actions/reports.ts → createReport()                     │
└────────────┬─────────────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. Rate Limit Check (In-Memory Sliding Window)                  │
│    • Key: ${action}:${fingerprint}:${ipHash}                     │
│    • Limits: 3 posts/hr, 100 votes/hr, 10 reports/hr            │
└────────────┬─────────────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. Database Operation (Supabase PostgreSQL)                     │
│    • Insert vote → increment counts → recalculate controversy    │
│    • Check unique constraint (one vote per device per take)      │
└────────────┬─────────────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. TanStack Query Cache Update                                  │
│    • Invalidate ['takes'] query → refetch feed                   │
│    • Invalidate ['user-votes'] query → update vote status        │
└────────────┬─────────────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. UI Update                                                     │
│    • Optimistic local state update                               │
│    • Show toast notification                                     │
│    • Reveal vote percentages and heat meter                      │
└──────────────────────────────────────────────────────────────────┘
```


---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (free tier sufficient)
- **Git** for version control

### 1. Clone & Install

```bash
git clone https://github.com/akshadjaiswal/hot-takes-arena.git
cd hot-takes-arena/frontend
npm install
```

### 2. Environment Setup

Create `.env.local` in the frontend directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL (for production deployment)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
### 3. Database Setup

(Instructions for setting up the database schema will be added here)


### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

### Additional Commands

```bash
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   └── page.tsx                   # Homepage with feed + filters
│
├── components/
│   ├── filters/
│   │   ├── CategoryFilter.tsx     # Category selection chips
│   │   └── SortSelector.tsx       # Sort dropdown
│   ├── layout/
│   │   ├── Header.tsx             # Navigation bar
│   │   └── FloatingActionButton.tsx # Post button (fixed position)
│   ├── takes/
│   │   ├── TakeFeed.tsx           # Infinite scroll feed
│   │   ├── TakeCard.tsx           # Individual take display
│   │   ├── VoteButton.tsx         # Agree/Disagree buttons
│   │   ├── HeatMeter.tsx          # Vote distribution bar
│   │   ├── ControversyBadge.tsx   # Fire emoji with score
│   │   ├── PostTakeModal.tsx      # Create take modal
│   │   └── ReportModal.tsx        # Report take modal
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── textarea.tsx
│       └── ...
│
├── lib/
│   ├── actions/                   # Server actions (Next.js 15)
│   │   ├── categories.ts          # getCategories()
│   │   ├── takes.ts               # getTakes(), createTake(), getHashedClientIP()
│   │   ├── votes.ts               # createVote(), checkUserVotes()
│   │   └── reports.ts             # createReport()
│   ├── schemas/
│   │   └── api.schemas.ts         # Zod validation schemas
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   └── server.ts              # Server client
│   ├── types/
│   │   └── database.types.ts      # TypeScript interfaces
│   ├── utils/
│   │   ├── controversy.ts         # Controversy calculation
│   │   ├── date.ts                # Relative time formatting
│   │   ├── fingerprint.ts         # Device fingerprinting
│   │   ├── ip-hash.ts             # IP hashing
│   │   ├── profanity-filter.ts    # Content validation
│   │   └── rate-limit.ts          # Rate limiting logic
│   ├── env.ts                     # Environment validation
│   ├── query-provider.tsx         # TanStack Query setup
│   └── utils.ts                   # Utility functions (cn, etc.)
│
├── my_docs/
│   └── claude.md                  # Technical context for AI
│
├── tailwind.config.ts             # Tailwind configuration
├── next.config.js                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--stone-50: #fafaf9
--stone-100: #f5f5f4
--stone-200: #e7e5e4
--stone-300: #d6d3d1
--stone-900: #1c1917

/* Accent Colors */
--amber-500: #f59e0b    /* Agree button */
--emerald-500: #10b981  /* Success states */
--red-500: #ef4444      /* Disagree button */
--orange-500: #f97316   /* Controversy badge */
```

### Typography

- **Font**: Geist (Next.js default)
- **Headings**: Bold, stone-900
- **Body**: Regular, stone-700
- **Secondary**: Regular, stone-500

### Components

Built with **shadcn/ui** + **Radix UI** primitives:
- Fully accessible (ARIA labels, keyboard navigation)
- Customizable with Tailwind
- Consistent variants (default, outline, ghost, destructive)

---

## 📊 How It Works

### User Flow

1. **Landing**: User arrives at homepage with feed of takes
2. **Filter**: Select category (e.g., "Food & Drinks") and sort (e.g., "Controversial")
3. **Browse**: Scroll through takes with infinite loading
4. **Vote**: Click "Agree" or "Disagree" on a take
   - Vote percentages revealed immediately
   - Heat meter shows distribution
   - Cannot vote twice (enforced by fingerprint)
5. **Post**: Click floating + button to create new take
   - Choose category
   - Write opinion (max 280 chars)
   - Profanity filter validates content
   - Rate limit prevents spam
6. **Report**: Flag inappropriate content
   - Select reason (spam, offensive, etc.)
   - Add optional details

### Vote Detection Flow

```
1. Page Loads
   ↓
2. Device Fingerprint Generates (~500ms)
   ↓
3. Takes Load (20 per page)
   ↓
4. Batch Vote Check (single query for all take IDs + fingerprint)
   ↓
5. Merge Vote Data with Takes
   ↓
6. Render Cards:
   - If voted: Show percentages + heat meter
   - If not voted: Show vote buttons
```



## 🤝 Contributing

Contributions are welcome! To get started:

### Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Follow existing code patterns (TypeScript, App Router, Server Actions)
4. Run `npm run lint` before committing
5. Test thoroughly on mobile and desktop

### Guidelines

**Code Style**:
- Use TypeScript (no `any` types)
- Follow Next.js 15 App Router patterns
- Use Server Actions instead of API routes
- Component names in PascalCase
- File names in kebab-case
- Add JSDoc comments for complex functions

**Commits**:
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Keep commits atomic (one logical change per commit)
- Write clear commit messages

**Pull Requests**:
- Link to related issue (if applicable)
- Describe changes and rationale
- Include screenshots for UI changes
- List impacted files
- Provide testing steps

### Reporting Issues

Include:
- **Expected behavior** vs **actual behavior**
- **Reproduction steps** (1, 2, 3...)
- **Environment**: Browser, OS, device
- **Screenshots** or **logs**
- **Supabase dashboard** errors (if relevant)

---

## 🗺️ Roadmap

### ✅ Completed (Nov 2025)

- ✅ Core voting functionality
- ✅ Device fingerprinting for anonymous users
- ✅ Controversy scoring algorithm
- ✅ Multiple sort options (controversial, fresh, trending)
- ✅ Category filtering
- ✅ Infinite scroll with TanStack Query
- ✅ Rate limiting (posts, votes, reports)
- ✅ Profanity filtering
- ✅ Content moderation (reporting system)
- ✅ Optimistic UI updates
- ✅ Mobile-first responsive design
- ✅ Toast notifications
- ✅ Batch vote checking for performance

### 🚧 In Progress

- [ ] **Dark Mode**: Full theme support
- [ ] **Admin Dashboard**: Content moderation UI
- [ ] **Analytics**: Track most controversial takes, voting patterns

### 📋 Planned

**Phase 1: Enhanced UX**
- [ ] Loading skeletons during data fetch
- [ ] Error boundaries for graceful failures
- [ ] Progressive image loading
- [ ] Share takes to social media
- [ ] Copy link to clipboard

**Phase 2: Community Features**
- [ ] Optional user accounts (with profiles)
- [ ] Follow categories for personalized feed
- [ ] Comment on takes (threaded discussions)
- [ ] Bookmark favorite takes
- [ ] User reputation system

**Phase 3: Advanced Features**
- [ ] AI-powered content moderation (OpenAI Moderation API)
- [ ] Trending hashtags
- [ ] Weekly "Most Controversial Take" awards
- [ ] Export analytics (CSV, PDF)
- [ ] API for third-party integrations

**Phase 4: Scalability**
- [ ] Redis for distributed rate limiting
- [ ] CDN for static assets
- [ ] Database read replicas
- [ ] Monitoring (Sentry, LogRocket)
- [ ] E2E tests with Playwright

---



## 👨‍💻 Maintainer

**Akshad Jaiswal**
- GitHub: [@akshadjaiswal](https://github.com/akshadjaiswal)
- Email: akshadsantoshjaiswal@gmail.com
- LinkedIn: [Akshad Jaiswal](https://www.linkedin.com/in/akshadsantoshjaiswal/)
- Twitter: [@akshadjaiswal](https://twitter.com/akshad_999)

---

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful component primitives
- **Supabase** for excellent PostgreSQL hosting
- **Vercel** for seamless Next.js deployment
- **TanStack Query** for powerful data fetching
- **Framer Motion** for smooth animations

---

## 📝 Changelog

### v1.0.0 (November 2025)

**Initial Release**:
- Core voting functionality
- Anonymous user tracking
- Controversy scoring
- Content moderation
- Mobile-first design
- Real-time updates

**Recent Fixes**:
- Fixed vote status not loading on page refresh
- Reduced duplicate API calls from 4 to 1-2
- Added comprehensive debug logging
- Improved query key stability

---

**Built with ❤️ by Akshad Jaiswal**

*Empowering open discourse through anonymous, democratic opinion sharing.*
