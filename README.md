# Founders Directory

A premium, developer-focused directory of companies backed by top venture capital firms. Built with modern web technologies, it features real-time data scraping, authentication, and an AI-powered custom cold DM generator.

## Features

- **Company Directory:** Browse and filter companies by industry, employee count, and more.
- **Premium UI:** Designed with a minimalistic, "less is more" philosophy using Tailwind CSS, shadcn/ui, and custom fonts (Inter, Instrument Serif, Geist Mono).
- **Smooth UX:** Includes dark mode by default, Lenis smooth scrolling, and seamless transitions.
- **AI Cold DM Generator:** Connects to the Gemini API to analyze user resumes and founder profiles, generating personalized cold outreach messages.
- **Automated Data:** Uses Playwright and Cheerio to scrape and update company data from sources like YCombinator.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router, Server Components)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Client & Admin SDKs)
- **AI Integration:** [@google/genai](https://github.com/google/generative-ai-js) (Gemini API)
- **Scraping:** [Playwright](https://playwright.dev/) & [Cheerio](https://cheerio.js.org/)
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics)

## Getting Started

### Prerequisites

You need Node.js installed on your machine.

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` or `.env.local` file in the root directory and add the required Firebase, Next.js, and Gemini API keys.

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

- `src/app/`: Next.js App Router pages and API routes.
- `src/components/`: Reusable UI components (shadcn/ui, layout components).
- `src/context/`: React context providers (e.g., AuthContext).
- `src/lib/`: Firebase configuration, utilities, and TypeScript types.
- `scripts/scraper/`: Web scraping scripts (e.g., `yc.ts`) for data population.

## Design Philosophy

The interface is built to feel like a premium developer tool (inspired by Linear, Vercel, Raycast). It focuses on:
- Minimalist UI with purposeful elements.
- Typography-driven hierarchy over excessive decoration.
- Consistent, generous spacing and muted color palettes.
See `design.md` for full design guidelines.

## Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/). Ensure all environment variables are configured in your Vercel project settings.
