# RestroPOS

A full-featured restaurant POS and management system built with Next.js 16, Prisma 7, Neon DB, and Tailwind CSS.

## Features

- POS / Billing with KOT support
- Table management with section layout
- Menu management (categories, items, variants, veg/non-veg)
- Inventory tracking with low-stock alerts
- Online orders (Zomato, Swiggy, Website, Phone)
- Customer CRM with loyalty points
- Reports & Analytics (revenue, top items, payment breakdown)
- Multi-role auth (Owner, Manager, Cashier, Captain)
- GST-ready invoicing
- Offline-resilient design

## Setup

### 1. Neon DB

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string (pooled URL)

### 2. Environment Variables

Update `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret: `openssl rand -base64 32`

### 3. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Start Dev Server

```bash
npm run dev
```

### 5. Create Your Restaurant

Go to `http://localhost:3000/setup` to create your restaurant and owner account.

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `DATABASE_URL` — Neon pooled connection string
   - `NEXTAUTH_SECRET` — random secret
   - `NEXTAUTH_URL` — your Vercel deployment URL
4. Set build command: `prisma generate && next build`

## Tech Stack

- Next.js 16 (App Router)
- Prisma 7 + Neon serverless adapter
- NextAuth.js v5
- Tailwind CSS
- Radix UI
- Recharts
