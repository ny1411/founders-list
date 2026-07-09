# Project Plan: VC Portfolio Scraper & Directory

## 1. Architecture & Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** SQLite (local development) / PostgreSQL (production) via Prisma ORM
- **Scraping:** Playwright / Cheerio (Node.js scripts)
- **State Management:** React hooks + URL search params (for shareable filters)

## 2. Database Schema (Prisma)
- **Company Model:** `id`, `slug`, `name`, `description`, `logoUrl`, `vcBacker` (Enum/String), `industry`, `employees` (Range/String), `location`, `foundedYear`, `stage`, `seedRound`, `raised` (String), `amountRaised` (Float), `website`, `twitterUrl`, `linkedinUrl`
- **Founder Model:** `id`, `companyId`, `name`, `role`, `email`, `phone`, `avatarUrl`, `twitterUrl`, `linkedinUrl`, `bio`

## 3. Implementation Checklist

### Phase 1: Setup & Database
- [x] Initialize Prisma and set up SQLite/PostgreSQL database.
- [x] Define `Company` and `Founder` schema in `schema.prisma`.
- [x] Generate Prisma client and create a database seed script.

### Phase 2: Scraping Infrastructure
- [x] Set up a `scripts/scraper` directory.
- [x] Install scraping dependencies (`playwright`, `cheerio`).
- [x] Create YCombinator scraper (`yc.ts`).
- [x] Create a16z scraper (`a16z.ts`).
- [x] Create 406 Ventures scraper (`406ventures.ts`).
- [x] Create Gruhas scraper (`gruhas.ts`).
- [x] Create a unified script to run all scrapers and insert/upsert data into the database.

### Phase 3: UI/UX & Layout Setup
- [x] Add required shadcn components (`npx shadcn@latest add card input select badge button skeleton`).
- [x] Create a responsive main layout (`src/app/layout.tsx`) with a top navigation bar and theme toggle (Dark/Light mode).
- [x] Design a cohesive color palette matching modern directories (like grindmap).

### Phase 4: Main Directory Page (Home)
- [ ] **UI Components:**
  - [ ] Search Bar (Search by name or description).
  - [ ] Filter Sidebar / Topbar (VC Backer, Industry, Employees, Seed Rounds, Raised).
  - [ ] Sort Dropdown (A-Z default).
- [ ] **Data Fetching:**
  - [ ] Create a Server Component to fetch companies from the database.
  - [ ] Implement URL parameter-based filtering (e.g., `?vc=a16z&industry=tech`).
- [ ] **Grid Layout:**
  - [ ] Build a responsive grid of Company Cards.
  - [ ] Each card shows Logo, Name, VC Backer badge, and a short description.

### Phase 5: Company Detail Page
- [ ] Create dynamic route `src/app/company/[slug]/page.tsx`.
- [ ] Fetch specific company details and associated founders from the database.
- [ ] **Page Layout:**
  - [ ] Header: Logo, Name, Website link, Raised amount, Industry.
  - [ ] Description Section: Full company description.
  - [ ] Founders Section: Cards for each founder displaying Name, Email, Phone, Social links.
  - [ ] Meta Section: Employee count, Seed rounds, VC Backers.

### Phase 6: Polish & Performance
- [ ] Add loading skeletons for the grid and detail pages.
- [ ] Implement pagination or infinite scroll for the home page.
- [ ] Add SEO metadata for all pages.
- [ ] Ensure mobile responsiveness across all filters and grids.
- [ ] Implement Lenis for smooth scrolling.

## 4. UI/UX Flow
1. **User Landing:** User lands on `/`. They see a masonry/grid layout of all companies, sorted A-Z.
2. **Filtering:** User clicks on "a16z" in the VC filter. The page instantly updates (using React transitions or Next.js server components) to show only a16z companies.
3. **Searching:** User types "health" in the search bar. The grid filters to companies with "health" in their name or description.
4. **Details:** User clicks on a company card. They are navigated to `/company/doordash`.
5. **Deep Dive:** On the detail page, the user can read about the company, see the founders, and click their social links or copy their contact info. They can use the browser back button to return to their preserved filtered state.
