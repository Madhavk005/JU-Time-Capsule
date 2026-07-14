# JECRC Time Capsule 2026

A premium, emotionally driven digital memory vault where newly admitted JECRC students write a message to their future selves during Orientation.

## Architecture & Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + custom CSS variable theming
- **UI Components**: shadcn/ui + standard HTML/Tailwind for layout
- **Forms & Validation**: React Hook Form + Zod for structured, client-side validated inputs.
- **Motion**: Framer Motion for micro-interactions and smooth page transitions.
- **State Management**: LocalStorage for draft autosaving (to handle browser crashes/refreshes).
- **Backend (MVP Simulated)**: Ready to be hooked into Supabase or Google Sheets + Apps Script. For the current production-ready code, the API simulates a delay to show loading states and succeeds.
- **Fonts**: Inter (Sans-serif, clean UI) + Playfair Display (Serif, elegant/cinematic feel).

## Project Structure

```text
src/
├── app/
│   ├── about/        # How it works page
│   ├── admin/        # Admin dashboard MVP
│   ├── capsule/      # Main multi-step form page
│   ├── success/      # Post-submission emotional payoff
│   ├── layout.tsx    # Root layout with fonts & theming
│   ├── page.tsx      # Landing page Hero
│   └── globals.css   # Global styles and oklch color overrides
├── components/
│   ├── ui/           # Reusable shadcn components (Buttons, Inputs, etc.)
│   └── capsule-form.tsx # Core multi-step logic
└── lib/
    ├── constants.ts  # Academic data, Zod schemas, File limits
    └── utils.ts      # Tailwind class merger
```

## Core UX Principles Implemented

1. **Mobile-First & Responsive**: Uses Tailwind's fluid responsive modifiers (`md:`, `sm:`).
2. **Minimal & Elegant**: Replaced standard high-contrast dark mode with a cinematic, warm palette (using `amber` and `zinc` tones).
3. **Smooth Micro-interactions**: Framer Motion used in the form steps for smooth transitioning, scale effects on the success screen.
4. **Accessible**: Proper label associations, clear focus rings on inputs, ARIA support via Radix primitives.
5. **Autosave**: Utilizing `localStorage` to save user input on the fly during the capsule creation process.

## Future Deployment Steps

1. Connect to **Supabase** or **Google Apps Script**: Replace the mock `onSubmit` in `capsule-form.tsx` with a standard `fetch` call to your backend.
2. Ensure environment variables are set in Vercel (`NEXT_PUBLIC_API_URL`, etc.).
3. Deploy via Vercel for continuous integration.
