# AI-Records: Admin Upload + Public Music + Clerk Auth

**Date:** 2026-03-24
**Status:** Approved
**Decision method:** Three perspectives (Technical, User, Business Owner)

## Architecture

```
Clerk (Auth) ─── Supabase (DB) ─── Cloudflare R2 (Audio Storage)
     │                │                      │
     └────────── Next.js App ────────────────┘
```

- **Clerk**: Google OAuth + email login, admin role via publicMetadata
- **Supabase**: DB only (profiles, tracks, generations) — NO auth, NO storage
- **Cloudflare R2**: Audio files (MP3 320kbps), 10GB free, zero egress

## Database Schema

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | Clerk user_id |
| email | TEXT | From Clerk |
| name | TEXT | From Clerk |
| avatar_url | TEXT | From Clerk |
| subscription | TEXT | FREE/STARTER/PRO |
| credits | INT | Default 10 |
| is_admin | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | Default now() |

### tracks
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| title | TEXT NOT NULL | Song title |
| artist | TEXT NOT NULL | Default 'AI-Records' |
| style | TEXT | pop, chalga, rock, etc. |
| audio_url | TEXT NOT NULL | Cloudflare R2 URL |
| cover_url | TEXT | Optional cover image |
| lyrics | TEXT | Optional |
| duration | INT | Seconds |
| file_size | INT | Bytes |
| is_featured | BOOLEAN | Show on landing page |
| is_public | BOOLEAN | Default true |
| play_count | INT | Default 0 |
| download_count | INT | Default 0 |
| uploaded_by | TEXT FK | References profiles(id) |
| created_at | TIMESTAMPTZ | Default now() |

### generations
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| user_id | TEXT FK | References profiles(id) |
| type | TEXT | 'lyrics' or 'music' |
| style | TEXT | Music style |
| mood | TEXT | Mood |
| topic | TEXT | User input |
| lyrics | TEXT | Generated lyrics |
| audio_url | TEXT | Generated audio URL |
| credits_used | INT | Default 1 |
| status | TEXT | pending/processing/completed/failed |
| created_at | TIMESTAMPTZ | Default now() |

## RLS Policies
- profiles: Users read own profile, admin reads all
- tracks: Everyone reads public tracks, admin writes
- generations: Users read own, admin reads all

## Key Flows

### Admin Upload
1. Admin goes to /admin/upload
2. Selects MP3 file, fills metadata (title, artist, style)
3. Checks "Featured" if desired
4. File uploads to R2 via /api/admin/upload
5. Metadata saved to Supabase tracks table
6. Track appears on landing page (if featured) or /music

### Public Visitor
1. Lands on homepage → sees featured tracks
2. Clicks Play → hears real music via R2 URL
3. Clicks Download → gets MP3 directly from R2
4. Wants more → clicks "Sign in with Google" (Clerk)
5. After auth → full player, catalog, AI generation studio

### Clerk → Supabase Sync
- Webhook on user.created → POST /api/webhooks/clerk
- Creates profile row in Supabase with Clerk user_id
- Admin flag set via Clerk dashboard publicMetadata

## File Storage Decision
- **Cloudflare R2** chosen over Google Cloud Storage and Supabase Storage
- Reason: Zero egress fees, 10GB free, S3-compatible API
- Audio format: MP3 320kbps (WAV masters kept locally in For-Uploads/)

## Auth Migration
- Remove: Supabase auth, LoginForm, RegisterForm, custom middleware
- Add: Clerk provider, Clerk middleware, SignIn/SignUp components, UserButton
- Clerk keys: Already in .env.local (test environment)
