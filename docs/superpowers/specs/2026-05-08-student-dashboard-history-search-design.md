# Student Dashboard, Submission History & Problem Search

**Date:** 2026-05-08
**Project:** CodeRunner — Automatic Assessment of Student Code
**Status:** Approved Design

## Overview

Add three student-facing features to the existing CodeRunner Sprint 1 codebase:
1. A personal Dashboard page with statistics and recent submissions
2. A standalone Submission History page with pagination
3. Search and filter functionality on the Problems list page

## 1. Design Principles

All new UI must follow the existing project's established design tokens:

| Token | Value |
|-------|-------|
| Page bg | `bg-gray-50` |
| Card | `bg-white rounded-xl border border-gray-200 p-5` |
| Card hover | `hover:shadow-md hover:border-blue-300 transition-all` |
| Primary | `blue-600` (buttons, links) / `blue-50` (info bg) |
| Heading | `text-2xl font-bold text-gray-900` |
| Subtitle | `text-gray-500` |
| Input | `border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none` |
| Button | `bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50` |
| Success | `text-green-600` / `bg-green-100 text-green-700` |
| Warning | `text-yellow-600` / `bg-yellow-100 text-yellow-700` |
| Error | `text-red-600` / `bg-red-50 text-red-600` |
| Container | `max-w-5xl mx-auto px-4 py-8` |
| Grid gap | `gap-4` |

## 2. Student Dashboard (`/dashboard`)

### 2.1 Layout

```
Navbar: [CodeRunner]  [Dashboard*] [Problems] [Submissions]  [user ▼]
─────────────────────────────────────────────────────────────────────
Dashboard
Welcome back, {name}

┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Total Problems│ │ Solved        │ │ Avg Score     │
│      10       │ │     2/10      │ │     85%       │
│  Published    │ │  Completed    │ │  All time     │
└───────────────┘ └───────────────┘ └───────────────┘

Recent Submissions
┌──────────────────────────────────────────────────────────┐
│ Problem       │ Score │ Status    │ Time                 │
├──────────────────────────────────────────────────────────┤
│ Two Sum       │ 100%  │ Completed │ 2 mins ago     →     │
│ Is Prime      │  50%  │ Completed │ 1 hour ago     →     │
└──────────────────────────────────────────────────────────┘

→ Browse All Submissions  ·  → Browse Problems
```

### 2.2 Components

**StatCard** (`src/components/StatCard.tsx`)
- Props: `{ title: string, value: string | number, subtitle: string, color: 'blue' | 'green' | 'amber' }`
- Container: `bg-white rounded-xl border border-gray-200 p-5`
- Icon circle: 40×40px, left-aligned, colored bg per variant
- Value: `text-3xl font-bold text-gray-900`
- Label: `text-sm text-gray-500`
- No hover effect (non-interactive)

**Dashboard Page** (`src/app/dashboard/page.tsx`)
- 'use client', fetches `GET /api/dashboard`
- 3 StatCards in a `grid grid-cols-1 md:grid-cols-3 gap-4`
- "Recent Submissions" section with heading `text-lg font-semibold text-gray-900`
- Table rows: `flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition`, click → `/submissions/${id}`
- Score colors: 100→`text-green-600`, ≥50→`text-yellow-600`, <50→`text-red-600`
- Empty state: `text-center py-12 text-gray-400` — "No submissions yet"

### 2.3 API

**`GET /api/dashboard`**
- Auth: Bearer token required
- Response:
```json
{
  "stats": {
    "totalProblems": 10,
    "solvedProblems": 2,
    "averageScore": 85,
    "totalSubmissions": 7
  },
  "recentSubmissions": [
    {
      "id": 1,
      "problemId": 2,
      "problemTitle": "Is Prime",
      "score": 100,
      "status": "COMPLETED",
      "createdAt": "2026-05-08T12:00:00Z"
    }
  ],
  "availableProblems": [
    { "id": 1, "title": "Two Sum" },
    { "id": 2, "title": "Is Prime" }
  ]
}
```

## 3. Submission History (`/submissions`)

### 3.1 Layout

```
Navbar: ... [Submissions*]
──────────────────────────────────────────────────────────────────────
Submission History
View all your code submissions

┌── Filter by Problem ──────────┐
│ All Problems               ▼  │
└───────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Problem        │ Score │ Status    │ Language │ Date              │
├───────────────────────────────────────────────────────────────────┤
│ Two Sum        │ 100%  │ Completed │ Python   │ 2 mins ago   →   │
│ Is Prime       │  50%  │ Completed │ Python   │ 1 hour ago   →   │
│ Two Sum        │  60%  │ Completed │ Python   │ 3 hours ago  →   │
└───────────────────────────────────────────────────────────────────┘

← Previous              Page 1 of 3                Next →
```

### 3.2 Components

- Page: `src/app/submissions/page.tsx` (new, 'use client')
- Filter dropdown: `select` element with All Problems + each problem title
  - Populated from dashboard API response's `availableProblems` array
  - Styled as: `border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white`
- Table container: `bg-white rounded-xl border border-gray-200 overflow-hidden`
- Table header: `bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3`
- Data row: `px-5 py-4 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer transition`
  - Click row → `router.push(/submissions/${id})`
- Empty state: identical to problems empty state pattern
- Pagination:
  - Row of buttons at bottom: `flex items-center justify-center gap-2 mt-6`
  - Page button: active→`bg-blue-600 text-white`, inactive→`bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`
  - Prev/Next: `text-sm text-gray-500 hover:text-gray-700 font-medium`

### 3.3 API

**`GET /api/submissions?page=1&limit=20&problemId=`**
- Auth: Bearer token required
- Response:
```json
{
  "submissions": [
    {
      "id": 1,
      "problemId": 2,
      "problemTitle": "Is Prime",
      "score": 100,
      "status": "COMPLETED",
      "language": "python",
      "createdAt": "2026-05-08T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## 4. Problem Search & Filter

### 4.1 Layout

Add a search bar and filter dropdowns above the existing problem card grid:

```
Problems
Select a problem to start coding

┌──────────────────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🔍 Search problems...    │  │ All Diffficulty ▼│ All Language ▼│
└──────────────────────────┘  └──────────────┘  └──────────────┘

[existing card grid unchanged]
```

### 4.2 Changes to Existing Files

**`src/app/problems/page.tsx`** — add filter bar above the grid:
- Search input with magnifier SVG icon, `pl-10` for icon padding
- Two `<select>` dropdowns for difficulty and language
- All three in a `flex flex-col sm:flex-row gap-3 mb-6`
- State: `searchTerm`, `difficultyFilter`, `languageFilter`
- Filter logic: client-side filter on `problems` array before mapping to ProblemCards

### 4.3 API

**`GET /api/problems`** — no change needed. Client-side filtering is sufficient for Sprint 1 scale.

## 5. Navbar Update

Add navigation links to Dashboard and Submissions in `src/components/Navbar.tsx`:

```tsx
<Link href="/dashboard"
  className={`text-sm ${pathname === '/dashboard' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
  Dashboard
</Link>
<Link href="/problems" ...>Problems</Link>
<Link href="/submissions" ...>Submissions</Link>
```

## 6. File Manifest

| Action | File | Description |
|--------|------|-------------|
| NEW | `src/app/dashboard/page.tsx` | Dashboard page |
| NEW | `src/components/StatCard.tsx` | Reusable stat card |
| NEW | `src/app/submissions/page.tsx` | Submission history page |
| NEW | `src/app/api/dashboard/route.ts` | Dashboard stats API |
| NEW | `src/app/api/submissions/route.ts` | Submissions list API |
| EDIT | `src/app/problems/page.tsx` | Add search/filter bar |
| EDIT | `src/components/Navbar.tsx` | Add Dashboard & Submissions links |

## 7. Self-Review Checklist

- [x] No "TBD" or "TODO" placeholders
- [x] Design tokens match existing codebase (verified against layout.tsx, login/page.tsx, problems/page.tsx)
- [x] All three features are focused and independently testable
- [x] API contracts are explicit with request/response shapes
- [x] Empty states defined for all list views
- [ ] Client-side filtering acceptable for current problem count (< 50)
