# PLive

A premium live sports streaming platform with real-time HLS video playback, event scheduling, and a full admin panel.

## Features

- **Live Streaming** — HLS/M3U8 stream playback with quality switching, multiple server sources, and error recovery
- **Event Discovery** — Browse live events, upcoming fixtures, and 24/7 sports channels by category
- **Authentication** — Sign up, log in, password reset, and session management via Supabase Auth
- **User Profiles** — Watch history tracking and favorite streams
- **Admin Panel** — Full CRUD for streams, categories, users, and site settings with real-time dashboard analytics
- **Responsive Design** — Mobile-first UI that works across all screen sizes

## Tech Stack

- **Framework:** React 19, TanStack Router & Start
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **Video:** HLS.js for adaptive bitrate streaming
- **State:** TanStack React Query
- **Build:** Vite 8
- **Language:** TypeScript

## Getting Started

```sh
git clone https://github.com/ookayiztall/plive.git
cd plive
npm install
```

Create a `.env` file with your Supabase credentials:

```
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Run the development server:

```sh
npm run dev
```

## Deployment

Connect the repository to [Vercel](https://vercel.com) and set the environment variables in the Vercel dashboard.
