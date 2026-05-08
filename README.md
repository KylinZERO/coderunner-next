# CodeRunner — Automatic Assessment of Student Code

A standalone web-based platform for automatic code assessment. Built with Next.js 14, TypeScript, Prisma, and SQLite.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database and seed data
npm run setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Student | student@test.com   | password123 |

## Features (Sprint 1)

### For Students
- **Sign Up / Sign In** — Create an account or log in securely
- **Problems List** — Browse available programming problems
- **Problem Detail** — Read problem descriptions with sample test cases
- **Code Editor** — Write code in the built-in Monaco editor
- **Run** — Execute code against sample test cases (non-persistent)
- **Submit** — Submit code for official scoring (persistent, includes hidden tests)
- **Submission Results** — View per-test-case results and overall score

### For Teachers (Future Sprints)
- Problem management (create/edit/archive)
- Test case management (sample & hidden)
- Grade management and export
- Analytics dashboard

## Tech Stack

- **Frontend & Backend:** Next.js 14 (App Router) + TypeScript
- **Database:** SQLite via Prisma ORM
- **Styling:** Tailwind CSS
- **Code Editor:** Monaco Editor
- **Authentication:** JWT (bcryptjs hashed passwords)
- **Code Execution:** Child process with timeout (Docker sandbox planned for Sprint 2)

## Project Structure

```
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data script
├── src/
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── login/       # Login page
│   │   ├── register/    # Register page
│   │   ├── problems/    # Problems list & detail pages
│   │   └── submissions/ # Submission results page
│   ├── components/      # Reusable components
│   └── lib/             # Utilities (prisma, auth, code execution)
├── task_plan.md         # Project plan
├── findings.md          # Research findings
├── progress.md          # Progress tracking
└── README.md
```

## API Endpoints

| Method | Path                         | Auth | Description                  |
|--------|------------------------------|------|------------------------------|
| POST   | /api/auth/register           | No   | Create new account           |
| POST   | /api/auth/login              | No   | Sign in                      |
| GET    | /api/auth/me                 | Yes  | Get current user             |
| GET    | /api/problems                | Yes  | List published problems      |
| GET    | /api/problems/:id            | Yes  | Get problem with sample tests|
| POST   | /api/problems/:id/run        | Yes  | Run code against all tests   |
| POST   | /api/problems/:id/submit     | Yes  | Submit code for scoring      |
| GET    | /api/submissions/:id         | Yes  | Get submission with results  |

## Demo Walkthrough

1. Open http://localhost:3000 (redirects to /login)
2. Sign in with `student@test.com` / `password123`
3. Browse the problems list
4. Click on "Two Sum" or "Is Prime"
5. Read the problem description and sample test cases
6. Write your solution in the code editor
7. Click **Run** to test against sample cases
8. Click **Submit** to get your official score
9. View per-test-case results

## Development

```bash
# Database management
npm run db:push     # Push schema changes to database
npm run db:seed     # Re-seed the database

# Build for production
npm run build
npm start
```

## Notes

- Code execution uses Node.js child_process with timeouts. No Docker sandbox in Sprint 1.
- Database is SQLite (`prisma/dev.db`). For production, migrate to PostgreSQL.
- JWT secret in `.env.local` is for development only. Change before production deployment.
