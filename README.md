# Alpha Console

A SaaS admin dashboard built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. Features product management, analytics, reports, user profile, and role-based access control.

## Tech Stack

- **Framework**: Next.js 16.2.6 (Turbopack)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with custom CSS variables (cream/beige palette, dark sidebar)
- **Language**: TypeScript (strict mode)
- **Data Source**: [DummyJSON Products API](https://dummyjson.com/products)

## Features

### Role-Based Access
Two roles — **Admin** and **User** — enforced server-side by a proxy middleware and client-side by UI filtering.

| Route | Admin | User |
|---|---|---|
| `/products` | Full CRUD, publish toggle | View published products only |
| `/products/[id]` | Full details | Full details |
| `/overview` | Summary cards | Redirected to `/products` |
| `/analytics` | Charts, metrics, inventory | Redirected to `/products` |
| `/reports` | PDF export, trend charts | Redirected to `/products` |
| `/settings` | Edit profile | Edit profile |

Switch roles via the dropdown in the top navbar. Role is persisted in the `alpha-role` cookie.

### Products Page
- Search with 350ms debounce
- Multi-category filter dropdown
- Sort by name, price, or rating
- Pagination with 10/25/50 rows per page
- Column show/hide and reorder (persisted in URL)
- Admin can toggle publish status per product (stored in `localStorage`)
- Real-time polling every 20 seconds

### Analytics Dashboard
- Metric cards (total products, avg rating, inventory value, categories)
- Inventory trend bar chart
- Category distribution bars
- Rating spectrum SVG line chart
- Conversion bubbles visualization
- Hover tooltips on all chart elements

### Reports Page
- Date range and category filter selects
- Summary cards (revenue, products, inventory)
- Sales/inventory trend SVG chart
- Category performance bars
- Top products table
- PDF export via `/api/reports/pdf`

### Settings / Profile
- Editable photo URL, full name, email, and role
- Changes saved to `localStorage`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/products`.

## Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── analytics/          # Analytics dashboard page
├── api/reports/pdf     # PDF generation endpoint
├── components/
│   ├── admin-sidebar   # Left nav (role-filtered)
│   └── top-navbar      # Top bar with role switcher
├── lib/
│   ├── products.ts     # Product data fetching
│   └── settings-storage.ts  # localStorage helpers
├── overview/           # Overview dashboard page
├── products/
│   ├── [id]/           # Product detail page
│   ├── analytics-panel # Admin analytics component
│   ├── products-screen # Product listing with filters
│   └── page.tsx        # Products route
├── reports/            # Reports page with PDF export
├── settings/           # User profile settings
└── types/              # TypeScript type definitions
proxy.ts                # Route guard middleware
```

## Key Design Decisions

- **Role in cookie**: `alpha-role` cookie lets the proxy middleware enforce routes server-side before any React code runs.
- **Published state in localStorage**: `alpha-published-products` stores which products are visible to non-admin users.
- **Settings in localStorage**: `alpha-settings` stores profile info and preferences.
- **URL-driven state**: All product filters (search, category, sort, pagination, columns) are synced to URL search params, making links shareable.
- **No login page**: Role is toggled directly from the top navbar.

## Environment

No environment variables are required. The app fetches from the public DummyJSON API.
