# CodeRunner Homepage — Design Spec

## Overview

Replace the current root page redirect (`/` → `/problems`) with a full marketing landing page for CodeRunner, an automatic code assessment platform for university CS courses. The page lives at `/` (root) and serves as the public-facing entry point for unauthenticated visitors.

## Design Direction

**Style**: Modern & Clean — large whitespace, soft gradient backgrounds, rounded cards, clean typography. Matches existing codebase aesthetic (blue color scheme, Tailwind CSS).

**Target audience**: University CS instructors and students (primary: instructors evaluating the platform).

**Layout**: Single-page scrolling with four content sections:

1. Hero
2. Features (Bento Grid)
3. How It Works (Timeline)
4. Statistics + CTA

## Visual System

### Color Palette
- **Page gradient** (top → bottom): `#1e40af` → `#3b82f6` → `#93c5fd` → `#dbeafe` → `#eef2ff` → `#f8fafc`
- **CTA primary**: `#1e40af` (blue-800)
- **Card background**: `rgba(255,255,255,0.7)` with `backdrop-filter: blur(12px)`
- **Text**: `#111827` (gray-900) on light, white on dark
- **Accent/stat values**: gradient text `#1e40af` → `#3b82f6`
- **Decorations**: blurred color blobs (`#818cf8`, `#f472b6`, `#60a5fa`) as background depth elements

### Typography
- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (existing)
- Hero heading: `2.5rem`, `font-extrabold`, white with text shadow
- Section headings: `1.5rem`, `font-extrabold`
- Body: `0.9rem`–`1.05rem`

### Spacing
- Consistent 3rem vertical padding per section
- 2rem horizontal padding (scales with viewport)
- 2rem bottom CTA padding

## Section Details

### 1. Hero
- Full-width, sits on the deepest-blue part of the page gradient
- Radial glow overlay (`rgba(255,255,255,0.12)` at top center)
- **Headline**: "Code Assessment, Automated." (two lines)
- **Subhead**: "让编程作业评分从数小时缩短到数分钟。高校教师的首选代码测评平台。"
- **CTAs**: "Get Started Free" (white button) + "Watch Demo" (ghost button)
- **Visual element**: Code window mockup — dark terminal card (`rgba(15,23,42,0.9)` with backdrop blur, Mac-style dots, sample Python code: `def solve(nums): return sum(nums)` with a "Passed all test cases" comment)

### 2. Features (Bento Grid)
- **Title**: "Everything you need to teach coding"
- **Subtitle**: "从创建题目到自动评分，一站式完成"
- **Layout**: 3-column asymmetric grid with 5 cards
  - **Automatic Grading** (span-2): Primary feature card — multi-language runtime, test case matrix, instant feedback
  - **Plagiarism Detection**: Code similarity analysis engine
  - **Analytics Dashboard**: Class performance, difficulty distribution, submission trends
  - **Online Code Editor**: Monaco-based, 20+ languages
  - **Flexible Test Cases**: Custom test cases and scoring weights
- Cards: glassmorphism (`rgba(255,255,255,0.7)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(255,255,255,0.3)`)
- Hover: opacity increase + subtle lift (`translateY(-2px)`)

### 3. How It Works (Timeline)
- **Title**: "How It Works"
- **Subtitle**: "三步完成一次完整的编程作业流程"
- Three steps in a horizontal timeline with connecting line:
  1. **Create Problems** — 教师编写题目、设置测试用例和评分标准
  2. **Students Submit** — 学生在线编写代码并一键提交测评
  3. **Instant Feedback** — 系统自动评分、生成详细反馈报告
- Each step: numbered circle (56px, colored border + background) + title + description

### 4. Statistics + CTA
- **Stats row**: Four centered stat items with gradient-colored values:
  - 10,000+ Active Students
  - 500+ Courses Powered
  - 50,000+ Submissions Graded
  - 99.9% Uptime
- **CTA**: "Ready to transform your coding courses?" + subtitle + "Get Started Free →" button (deep blue with shadow)

## Interaction & Animation
- **Card hover**: opacity change + subtle lift
- **Scroll**: standard browser scroll (no parallax, no complex scroll-triggered animations initially)
- **Button hover**: standard Tailwind `hover:` opacity/color transitions

## Technical Implementation

### Framework & Tools
- Next.js 14 (App Router) — same as existing
- Tailwind CSS — same as existing
- No new dependencies required

### Files to Create/Modify
- `src/app/page.tsx` — replace redirect with full landing page (Client Component with 'use client')
- Existing `Navbar.tsx` already handles guest navigation (Logo "CodeRunner" linking to `/problems`, Sign in, Register buttons)
- The Navbar should remain at the top of the page (it's in layout.tsx — verify or adjust)

### Navbar Behavior on Homepage
- The existing Navbar shows "CodeRunner" linking to `/problems` for guests. On the landing page, we might want the logo to be non-clickable or scroll-to-top. TBD during implementation.

### Components (if any)
- Could extract individual sections into components (`HeroSection`, `FeaturesSection`, `WorkflowSection`, `StatsSection`) for maintainability, or keep in a single file if sections are short.

## Future Considerations (Not in Scope)
- Scroll-triggered entrance animations (fade-in on scroll)
- Multi-language support (i18n)
- Video demo embed replacing the code window
- Pricing/packages section
- Integration with testimonials

## Design Rationale

The full-page gradient approach was chosen over section-based backgrounds to create a unified visual journey — the page reads as one canvas rather than stacked blocks. Glassmorphism cards allow feature content to sit legibly on the gradient without introducing hard container boundaries. The deep blue → light gradient represents the journey from "complex problem" (code assessment) to "simple solution" (automated grading).
