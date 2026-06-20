# Base Project Rules & Stack Template

This file establishes the technical patterns and connection wrappers for the project.

---

## 1. Technical Stack Configuration
* **Framework:** Next.js (App Router, React 19). Use React Server Components (RSC) for data fetching and Server Actions for database mutations.
* **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
* **Hosting & Deployment:** Vercel.

---

## 2. Verified Implementation Patterns

### Database Connection (Neon Singleton)
Always use a singleton pattern for the database connection to prevent pool exhaustion during hot-reloads in serverless/dev environments.
* **Location:** `src/lib/db.ts`
```typescript
import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

export function getDB() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url || url.includes('REPLACE_WITH_YOUR')) {
      throw new Error('DATABASE_URL is not set correctly in env');
    }
    sql = neon(url);
  }
  return sql;
}
```

---

## 3. Environment Variables Template (`.env.local`)
Create a `.env.local` containing the database connection:

```env
# Database
DATABASE_URL="postgresql://neondb_owner:..."
```
