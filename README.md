# Live Stream Hub

IMPORTANT — READ BEFORE STARTING

DO NOT ENABLE LOVABLE CLOUD.

DO NOT CREATE OR CONNECT ANY LOVABLE-MANAGED DATABASE.

DO NOT SET UP A BACKEND YET.

DO NOT CREATE A SUPABASE PROJECT.

I will connect my OWN Supabase project later during Phase 2.

FOR THIS PHASE, I ONLY WANT YOU TO FOCUS ON BUILDING THE COMPLETE UI/UX AND FRONTEND EXPERIENCE.

Use mock/static data temporarily for visual development only. Structure the frontend cleanly so that mock data can easily be replaced with Supabase data later.

Do not implement authentication functionality yet.

Do not implement payments.

Do not implement backend logic.

This phase is purely about creating a polished, production-quality frontend and user experience.

==================================================

PROJECT OVERVIEW

==================================================

I want to build a premium live sports streaming platform inspired by the two screenshots attached to this prompt.

The screenshots are the main visual and UX references.

The platform will eventually allow users to:

- Register and login

- Watch live sports streams

- Watch HLS/M3U8 streams

- Browse upcoming events

- Browse live events

- Browse sports/leagues

- Select different stream servers

- Watch 24/7 sports channels

There will eventually be an admin panel, authentication system, and Supabase backend.

BUT DO NOT BUILD THE BACKEND YET.

For now, create the complete frontend with realistic mock data.

==================================================

TECH STACK

==================================================

Use:

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui where appropriate

- React Router

- Lucide icons

Keep the architecture clean and component-based.

Use reusable components.

Avoid unnecessary dependencies.

==================================================

DESIGN DIRECTION

==================================================

Use the attached screenshots as the primary design inspiration.

The platform should feel like a:

Premium

Modern

Professional

Sports streaming platform

Visual direction:

- Deep navy/dark blue backgrounds

- Slightly lighter cards

- White primary text

- Muted gray secondary text

- Orange/gold accent colors

- Blue accent colors where appropriate

- Red/pink LIVE indicators

- Subtle borders

- Soft shadows

- Rounded cards

- Professional sports broadcast aesthetic

Avoid excessive:

- Glassmorphism

- Huge typography

- Bright gradients everywhere

- Excessive animations

- Generic AI landing page layouts

- Overly rounded UI

The interface should feel like a real streaming platform.

==================================================

IMPORTANT DESIGN RULE

==================================================

Do not simply create a static landing page.

Build a COMPLETE frontend application with proper routes, reusable components, realistic interactions, loading states, empty states, responsive layouts, and navigation.

Even though the data is mocked for now, structure the application as if it will later receive real API/Supabase data.

For example:

Do NOT scatter mock data inside components.

Instead, organize mock data separately so it can later be replaced by API/database calls.

==================================================

APPLICATION ROUTES

==================================================

Create the following frontend routes:

/

/live

/schedule

/category/:slug

/watch/:slug

/login

/register

/forgot-password

/reset-password

/profile

/admin

/admin/streams

/admin/streams/new

/admin/streams/:id/edit

/admin/categories

/admin/users

/admin/settings

The admin pages can be frontend-only mockups for now.

Do not implement actual authentication or permissions yet.

==================================================

GLOBAL LAYOUT

==================================================

Create a consistent application layout.

Include:

- Header

- Main content area

- Footer

Create reusable layout components.

Examples:

AppLayout

Header

Footer

PageContainer

SectionHeader

The layout should remain consistent throughout the application.

==================================================

HEADER

==================================================

Create a clean premium navigation header inspired by the screenshots.

Left side:

- Platform logo placeholder

- Platform name

Use "PLIVE" as temporary branding.

Navigation:

- Home

- Live

- Schedule

Right side:

For now show:

- Login

- Register

Also create a temporary user state mockup so we can preview how the header looks when logged in.

Logged-in UI should include:

- User avatar

- Profile

- Logout

Admin users should eventually see:

- Admin Dashboard

Do not implement actual authentication yet.

Just build the UI states.

Mobile:

Create a responsive hamburger menu.

==================================================

HOME PAGE

==================================================

The homepage is extremely important.

Use Screenshot #1 as the main reference.

Build the following sections.

==================================================

HERO / FEATURED EVENTS

==================================================

Create a large featured hero carousel.

The hero should feature major sports events.

Each slide should support:

- Large background image

- Dark overlay

- Category badge

- Event title

- Short description

- Live/upcoming status

- CTA button

Examples:

WATCH LIVE

VIEW EVENT

Include:

- Left/right navigation arrows

- Pagination dots

- Smooth transitions

Do not make the hero excessively tall.

It should feel similar in proportions to the attached screenshot.

Use realistic placeholder sports imagery.

Create 3-5 mock featured events.

==================================================

CATEGORY / LEAGUE CAROUSEL

==================================================

Below the hero create a horizontal sports/category navigation.

Inspired by the screenshot.

Examples:

Premier League

La Liga

Serie A

Bundesliga

Ligue 1

Champions League

Boxing

UFC

Formula 1

Each category item should have:

- Icon/logo placeholder

- Category name

- Hover state

- Active state

Desktop:

Display in a horizontal carousel.

Mobile:

Allow horizontal scrolling.

Create reusable component:

CategoryCarousel

==================================================

ONLINE NOW

==================================================

Create an "Online Now" section.

Display currently live events.

Each card should visually communicate:

LIVE

Include:

- Red live indicator

- Event thumbnail

- Event title

- Category

- Optional viewer count placeholder

- Watch button or clickable card

Also create an empty state design.

Example:

No live events right now.

The empty state should look intentional and polished.

==================================================

FEATURED MATCHES

==================================================

Create the Featured Matches section inspired by Screenshot #1.

Group content by sport/category.

Examples:

Football

Combat Sports

Formula 1

Each group should contain a horizontal carousel of event cards.

Create reusable:

EventSection

EventCarousel

StreamCard

Each event card should include:

- Thumbnail

- Date badge

- Event title

- Category

- Start date/time

- Countdown

- LIVE badge if applicable

Examples of events:

Aston Villa vs Arsenal

Barcelona vs Rayo Vallecano

Ipswich Town vs Liverpool

UFC Fight Night

Formula 1 Italian Grand Prix

Use realistic but placeholder/demo content.

Do not rely on copyrighted logos unless placeholders are used.

==================================================

EVENT CARD DESIGN

==================================================

Create a reusable StreamCard component.

The card should support different states:

LIVE

UPCOMING

ENDED

24/7

Card elements:

- Thumbnail

- Status badge

- Category

- Event title

- Date/time

- Countdown

- Optional LIVE indicator

Hover effect:

Subtle image scale or overlay.

Clicking the card should navigate to:

/watch/:slug

==================================================

24/7 LIVE CHANNELS

==================================================

Create a section:

24/7 Live

Inspired by the reference screenshot.

Display permanent/live channels.

Examples:

Sports Main Event

TNT Sports

Sky Sports

ESPN

Use placeholder/demo content.

Cards should include:

- Channel artwork

- LIVE badge

- Channel name

- Category

- Small live indicator

Create reusable:

ChannelCard

==================================================

FOOTER

==================================================

Create a polished footer inspired by the screenshot.

Include:

Platform logo/name

Available Championships / Categories

Examples:

Football

Combat Sports

Formula 1

However, structure this dynamically using mock data for now.

Links:

Home

Live

Schedule

Account:

Login

Register

Bottom:

© 2026 PLive. All rights reserved.

Also include a subtle CTA area:

Interested to create your own website?

Contact us here

Keep the footer clean and spacious.

==================================================

LIVE PAGE

==================================================

Route:

/live

Create a dedicated page showing all currently live streams.

Header:

Live Now

Subtitle explaining available live events.

Include:

- Grid layout

- Filters placeholder

- Category filtering UI

- Search UI

Create multiple mock live events.

If no results:

Show polished empty state.

==================================================

SCHEDULE PAGE

==================================================

Route:

/schedule

Create a complete sports event schedule interface.

Include tabs or filters:

Today

Tomorrow

Upcoming

Also provide category filters.

Each event should show:

- Thumbnail

- Event title

- Category

- Date

- Time

- Status

- Countdown

Design should feel like a sports event schedule rather than a generic blog listing.

==================================================

CATEGORY PAGE

==================================================

Route:

/category/:slug

Create a category detail page.

Example:

Football

Header:

Category icon/logo

Category name

Description

Below:

Live Now

Upcoming Events

24/7 Channels

Use reusable components.

Test multiple category layouts with mock data.

Examples:

Football

Boxing

UFC

Formula 1

==================================================

WATCH PAGE

==================================================

This page should be heavily inspired by Screenshot #2.

Route:

/watch/:slug

This is the main viewing experience.

==================================================

VIDEO PLAYER UI

==================================================

FOR THIS PHASE:

DO NOT IMPLEMENT ACTUAL HLS/M3U8 STREAMING YET.

Create the COMPLETE VIDEO PLAYER UI.

Use a realistic video placeholder/demo image.

The player should look like a professional streaming player.

Create:

VideoPlayer component

Player should include UI controls for:

- Play/pause

- Volume

- Mute

- Fullscreen

- Settings

- Quality selector placeholder

- Live indicator

- Loading state

- Error state

- Reload stream button

The controls do not need actual HLS functionality yet.

However, structure the component so HLS.js can be integrated later without redesigning the UI.

Maintain:

16:9 aspect ratio.

Desktop:

Large centered player.

Mobile:

Responsive full-width player.

==================================================

WATCH PAGE INFORMATION

==================================================

Below the player display:

Event title

Description

Category badges

LIVE status

Example:

SKY SPORTS MAIN EVENT

International Matches live coverage and available match feeds.

Badges:

INTERNATIONAL MATCHES

24/7 LIVE

Status row:

● Live now

Viewer count placeholder

Reload Stream button

Do not use fake huge viewer numbers.

==================================================

CHOOSE A SERVER

==================================================

Create a server selection interface inspired by Screenshot #2.

Title:

Choose a server

Subtitle:

If playback stops, switch to another source.

Create multiple server cards.

Example:

01

Main Stream

Recommended source

Status indicator

02

Stream 2

Backup source

03

Stream 3

Alternative source

Selected server should have:

- Clear border

- Accent color

- Active indicator

Clicking different servers should update the selected UI state.

For now it does NOT need to actually change a video source.

But structure the state so real stream switching can be integrated later.

Create reusable:

ServerSelector

ServerCard

==================================================

RELATED / UPCOMING CONTENT

==================================================

Below the server selector optionally create:

More from this category

or

Upcoming Events

Use StreamCards.

Keep this section subtle and not overly large.

==================================================

AUTHENTICATION PAGES

==================================================

Create polished frontend UI for:

/login

/register

/forgot-password

/reset-password

These are UI ONLY for now.

No backend authentication yet.

==================================================

LOGIN PAGE

==================================================

Include:

Email

Password

Remember me UI

Forgot password link

Login button

Register link

Social login should NOT be implemented yet.

==================================================

REGISTER PAGE

==================================================

Fields:

Display name

Email

Password

Confirm password

Register button

Login link

Include client-side UI validation styling.

==================================================

PROFILE PAGE

==================================================

Create a frontend-only profile page.

Include:

Avatar

Display name

Email

Account information

Optional sections:

Recently watched

Favorite streams

These can be empty/mock states.

Do not implement persistence yet.

==================================================

ADMIN PANEL UI

==================================================

Build the COMPLETE ADMIN PANEL FRONTEND.

Do not implement backend functionality yet.

The purpose is to finalize the CMS/admin UX before connecting Supabase.

==================================================

ADMIN LAYOUT

==================================================

Desktop:

Left sidebar

Top navigation

Main content

Sidebar items:

Dashboard

Streams

Categories

Users

Settings

Frontend:

Responsive admin sidebar should collapse into a drawer on mobile.

==================================================

ADMIN DASHBOARD

==================================================

Route:

/admin

Create dashboard overview cards:

Total Users

Live Streams

Scheduled Streams

Total Streams

Active Categories

Below:

Upcoming streams

Recently created streams

Recent activity

Use realistic mock data.

==================================================

ADMIN STREAM MANAGEMENT

==================================================

Route:

/admin/streams

Create a complete stream management interface.

Include:

Search

Filters

Status filters:

All

Live

Scheduled

Ended

24/7

Table columns:

Thumbnail

Title

Category

Type

Status

Start Time

Featured

Actions

Actions:

Edit

Duplicate

Delete

Buttons can use mock interactions for now.

==================================================

CREATE STREAM PAGE

==================================================

Route:

/admin/streams/new

Create a comprehensive stream creation form.

Sections:

------------------------------------------------

BASIC INFORMATION

Title

Slug

Description

Short description

------------------------------------------------

CATEGORY

Category selector

------------------------------------------------

IMAGES

Thumbnail upload UI

Hero/banner upload UI

------------------------------------------------

STREAM TYPE

Scheduled Event

24/7 Channel

------------------------------------------------

STATUS

Draft

Scheduled

Live

Ended

Offline

------------------------------------------------

VISIBILITY

Public

Registered Users

------------------------------------------------

SCHEDULE

Start date

Start time

End date

End time

------------------------------------------------

OPTIONS

Featured

Active

24/7

------------------------------------------------

STREAM SOURCES

Create a polished multiple stream source interface.

Each source should include:

Source number

Name

Description

Source type

HLS / M3U8

Source URL

Priority

Active toggle

Default source toggle

Allow:

Add source

Remove source

Reorder source UI

For now this is frontend state only.

Do not connect to a database yet.

==================================================

EDIT STREAM PAGE

==================================================

Route:

/admin/streams/:id/edit

Reuse the stream creation form.

Populate with mock stream data.

Structure the form components so they can later be connected to Supabase.

==================================================

ADMIN CATEGORY MANAGEMENT

==================================================

Route:

/admin/categories

Create:

Category table/grid

Search

Create category button

Each category:

Icon/logo

Name

Slug

Description

Sort order

Active status

Actions

Create Category modal/page.

Edit Category.

Delete confirmation modal.

Frontend interactions only for now.

==================================================

ADMIN USER MANAGEMENT

==================================================

Route:

/admin/users

Create user management UI.

Table:

Avatar

Name

Email

Role

Joined Date

Status

Actions

Roles:

User

Admin

Create:

Search

Role filter

Status filter

User details drawer/modal.

Do not implement actual role changes yet.

==================================================

ADMIN SETTINGS

==================================================

Route:

/admin/settings

Create frontend settings UI.

Sections:

GENERAL

Site name

Site description

Timezone

------------------------------------------------

BRANDING

Logo upload

Favicon upload

------------------------------------------------

ACCOUNT

Registration enabled toggle

------------------------------------------------

FOOTER

Copyright text

Footer CTA

These are frontend-only forms for now.

==================================================

LOADING STATES

==================================================

Create polished skeleton loading components.

Use them for:

Hero

Stream cards

Category cards

Watch page

Admin tables

Avoid layout shifting.

==================================================

EMPTY STATES

==================================================

Create reusable EmptyState component.

Examples:

No live events right now

No upcoming streams

No streams found

No categories

No users

No search results

Use appropriate icons.

==================================================

ERROR STATES

==================================================

Create frontend UI states for:

Stream unavailable

Failed to load stream

Page not found

No search results

Unauthorized access

For now these are visual components.

==================================================

404 PAGE

==================================================

Create a polished:

404 — Page Not Found

Include CTA:

Back to Home

==================================================

RESPONSIVE DESIGN

==================================================

The entire application MUST be fully responsive.

Test and design for:

Mobile:

375px

Large Mobile:

430px

Tablet:

768px

Laptop:

1024px

Desktop:

1440px+

Important:

No horizontal overflow.

Cards must resize properly.

Hero must remain visually balanced.

Category carousel should scroll horizontally on mobile.

Admin tables should become usable mobile layouts.

Video player remains 16:9.

Header navigation collapses properly.

Touch targets should be accessible.

==================================================

COMPONENT ARCHITECTURE

==================================================

Create reusable components where appropriate.

Suggested components:

Layout

Header

Footer

MobileMenu

HeroCarousel

HeroSlide

CategoryCarousel

CategoryCard

SectionHeader

StreamCard

ChannelCard

EventCarousel

Countdown

LiveBadge

StatusBadge

VideoPlayer

ServerSelector

ServerCard

EmptyState

LoadingSkeleton

SearchInput

FilterBar

AdminLayout

AdminSidebar

DashboardStats

StreamTable

StreamForm

CategoryForm

UserTable

ConfirmDialog

Do not over-engineer.

But avoid duplicating UI logic unnecessarily.

==================================================

MOCK DATA ARCHITECTURE

==================================================

IMPORTANT:

Do not hardcode data randomly inside UI components.

Create organized mock data files/types.

For example:

types/

data/

mockStreams

mockCategories

mockUsers

mockServers

The frontend should later be easily migrated from:

mockStreams

to:

Supabase queries.

Keep data structures close to what a real backend would return.

==================================================

INTERACTIONS

==================================================

Even though backend is not connected yet, frontend interactions should feel functional.

Examples:

- Hero carousel navigation works

- Category selection works

- Filters work with mock data

- Search works with mock data

- Server selection works visually

- Countdown works

- Mobile menu works

- Admin sidebar works

- Forms validate visually

- Modals work

- Delete confirmation works

However:

Do not create fake backend persistence.

Clearly keep temporary frontend state separate from future backend architecture.

==================================================

ANIMATIONS

==================================================

Use subtle animations only.

Examples:

Card hover

Button hover

Carousel transition

Live indicator pulse

Sidebar transitions

Modal transitions

Avoid excessive motion.

==================================================

FINAL GOAL OF PHASE 1

==================================================

At the end of this phase I want a COMPLETE FRONTEND prototype of the entire streaming platform.

I should be able to navigate through:

- Homepage

- Live page

- Schedule

- Categories

- Watch page

- Login/Register pages

- Profile

- Admin dashboard

- Stream management

- Category management

- User management

- Settings

Everything should look polished and feel interactive using mock data.

DO NOT CONNECT A BACKEND YET.

DO NOT ENABLE LOVABLE CLOUD.

DO NOT CREATE A DATABASE.

Once the entire frontend/UI/UX is complete, STOP and wait for my instructions before proceeding to backend integration.

Start by analyzing the attached screenshots and then build the complete responsive frontend systematically.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1b6739b5-de20-4222-a626-5c39f1b4739e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
