# Crawdale Hotel Web (Next.js)

A Next.js web app for the Crawdale Hotel Management system.  
Current focus: authentication, role-based access, and secure server/database enforcement (RLS).

## Tech Stack
- Next.js (App Router)
- Supabase (Auth + Postgres)
- Row Level Security (RLS) policies for authorization

---

## Current Features
- **Supabase Auth (PKCE) working end-to-end**
  - Auth callback route exchanges code for a session successfully
  - Session stored correctly (no PKCE verifier issues)
- **Role-based route protection (server-side)**
  - `/admin` protected (admin/staff only)
  - `/dashboard` protected (guest/staff/admin)
  - Unauthorized users redirected to a **403 Forbidden** page
- **Profiles table**
  - `profiles` linked to `auth.users`
  - Default role is `guest`
- **Database-level authorization (RLS)**
  - Users can read/update **their own** profile only
  - Staff/admin can read broader data where permitted
  - Role escalation from the client is blocked (admin-only)

---

## Security / Fixes Completed
- Fixed **AuthPKCECodeVerifierMissingError** by aligning SSR/client auth handling and ensuring callback flow is cookie-based.
- Implemented **server-side guards** (`requireUser`, `requireRole`) so the app does not trust client role strings.
- Enabled and tested **Supabase RLS** so authorization is enforced at the database level.
- Removed/avoided **recursive RLS policy patterns** that caused `stack depth limit exceeded` errors.

---

## Pages / Routes
- `/auth/login` – login page
- `/auth/callback` – auth callback (exchanges auth code for session)
- `/dashboard` – protected dashboard (guest/staff/admin)
- `/admin` – protected admin area (staff/admin)
- `/403` – forbidden access page

---

## Future Features (Planned)
- **Admin panel**
  - Manage staff/admin assignments (via secure server actions or service role)
  - View/manage reservations, rooms, customers
- **Full hotel workflow**
  - Reservations CRUD
  - Room inventory / availability
  - Payments and receipts
  - Maintenance requests tracking
- **Audit logging**
  - Staff/admin actions logged to an `audit_events` table
- **Better UX**
  - Toast notifications, loading states, error handling
  - Profile settings page (name, etc.)
- **Deployment**
  - Production environment variables
  - Hosted deployment (Vercel or VPS)

---

## Environment Variables
Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
## Run Locally
```bash
npm install
npm run dev
```
## Notes:
-Authorization is enforced in two layers:
  1. Server-side route guards
  2. Supabase RLS policies

-Client code should never be the source of truth for roles.



