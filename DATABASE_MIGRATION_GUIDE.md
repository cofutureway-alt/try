# Al-Saae Journey — Database Migration Reference

---

## 1. Project Credentials

| Property | Value |
|---|---|
| **Project ID** | `scevazmwmcranvftgcpx` |
| **Project URL** | `https://scevazmwmcranvftgcpx.supabase.co` |
| **Publishable Key** | `sb_publishable_dIZhPxVJI-goyo-583lI9g_GAdrQJx0` |
| **Secret Key** | `<SUPABASE_SECRET_KEY>` |
| **Anon Public JWT** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZXZhem13bWNyYW52ZnRnY3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMDQzOTksImV4cCI6MjEwMTc4MDM5OX0.Ac7n2KPfuAs29qEPrtkweCzvADAyAU5jdEAmVrAViIY` |

---

## 2. Quick Migration Commands

```bash
$env:SUPABASE_ACCESS_TOKEN="<SUPABASE_ACCESS_TOKEN>"

npx supabase link --project-ref scevazmwmcranvftgcpx
npx supabase db push
npx supabase functions deploy
```

---

## 3. Environment Files Updated

| File | Field | Value |
|---|---|---|
| `.env` | `VITE_SUPABASE_PROJECT_ID` | `scevazmwmcranvftgcpx` |
| `.env` | `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_dIZhPxVJI-goyo-583lI9g_GAdrQJx0` |
| `.env` | `VITE_SUPABASE_URL` | `https://scevazmwmcranvftgcpx.supabase.co` |
| `.env` | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `supabase/config.toml` | `project_id` | `scevazmwmcranvftgcpx` |
| `src/lib/whatsapp-api.ts` | `supabaseUrl fallback` | `https://scevazmwmcranvftgcpx.supabase.co` |

---

## 4. Storage Buckets (11 buckets)

| Bucket | Access |
|---|---|
| `thumbnails` | 🌐 Public |
| `avatars` | 🌐 Public |
| `quiz-images` | 🌐 Public |
| `testimonial-images` | 🌐 Public |
| `leaderboard-assets` | 🌐 Public |
| `card-assets` | 🌐 Public |
| `book-assets` | 🌐 Public |
| `lesson-files` | 🌐 Public |
| `assignment-files` | 🌐 Public |
| `payment-proofs` | 🌐 Public |
| `assignment-submissions` | 🔒 Private |

---

## 5. Edge Functions (14 functions deployed)

| Function | File |
|---|---|
| `admin-create-admin` | `supabase/functions/admin-create-admin/index.ts` |
| `admin-create-student` | `supabase/functions/admin-create-student/index.ts` |
| `admin-delete-student` | `supabase/functions/admin-delete-student/index.ts` |
| `fawaterak-initiate` | `supabase/functions/fawaterak-initiate/index.ts` |
| `fawaterak-methods` | `supabase/functions/fawaterak-methods/index.ts` |
| `fawaterak-webhook` | `supabase/functions/fawaterak-webhook/index.ts` |
| `kashier-initiate` | `supabase/functions/kashier-initiate/index.ts` |
| `kashier-refund` | `supabase/functions/kashier-refund/index.ts` |
| `kashier-webhook` | `supabase/functions/kashier-webhook/index.ts` |
| `paymob-initiate` | `supabase/functions/paymob-initiate/index.ts` |
| `paymob-refund` | `supabase/functions/paymob-refund/index.ts` |
| `paymob-webhook` | `supabase/functions/paymob-webhook/index.ts` |
| `rasvio-webhook` | `supabase/functions/rasvio-webhook/index.ts` |
| `send-whatsapp-test` | `supabase/functions/send-whatsapp-test/index.ts` |
