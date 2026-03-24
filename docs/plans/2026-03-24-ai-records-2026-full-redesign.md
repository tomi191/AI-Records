# AI-Records 2026: Full Platform Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Date:** 2026-03-24
**Status:** Approved
**Decision method:** Three perspectives (Technical, User, Business Owner)
**Identity:** 50/50 Music Label + AI Music Generator

---

## Vision

AI-Records is the FIRST Bulgarian AI music platform — simultaneously a music label showcasing Covers, Remixes, and Originals, AND a full AI music studio powered by Kie.ai (SUNO V5 + Gemini 3.1 Pro). Users come to listen, stay to create.

## Architecture

```
Clerk (Auth) → Kie.ai (SUNO V5 + Gemini 3.1 Pro) → Supabase (DB) → Cloudflare R2 (Audio+Covers)
```

- **Auth:** Clerk (Google + email login)
- **AI Engine:** Kie.ai single API key for ALL AI features
  - SUNO API: 18 endpoints (Generate, Extend, Cover, Mashup, Vocals, Video, etc.)
  - Gemini 3.1 Pro: Lyrics generation (replaces OpenRouter)
- **Database:** Supabase (profiles, tracks, generations, tags, analytics)
- **Storage:** Cloudflare R2 (zero egress, audio + cover images)
- **Deploy:** Vercel (ai-records.eu)

## API Provider: Kie.ai

**API Key:** e16b1f40a270fa27d2ac0083ec69517c
**Base URL:** https://api.kie.ai/v1/

### SUNO Endpoints (18 total)

| Endpoint | AI-Records Feature | Credits |
|----------|-------------------|---------|
| Generate Music | Create song (V3.5-V5) | 5 |
| Extend Music | Extend existing song | 5 |
| Cover Audio | Change style/genre | 5 |
| Mashup | Combine 2+ tracks | 10 |
| Add Vocals | Add vocals to instrumental | 5 |
| Separate Vocals | Extract vocals/instrumental | 4 |
| Add Instrumental | Add backing to vocals | 5 |
| Replace Section | Edit part of song | 3 |
| Create Music Video | Generate MP4 | 2 |
| Generate Lyrics | AI lyrics (via Gemini) | 1 |
| Timestamped Lyrics | Synced lyrics | 2 |
| Sounds | Sound effects | 1 |
| Boost Music Style | Enhance styling | 1 |
| Upload & Extend | Extend uploaded file | 5 |
| Upload & Cover | Transform uploaded file | 5 |
| Generate MIDI | Convert to MIDI | Free |
| Generate Persona | Voice profile | Free |
| Convert to WAV | Format conversion | Free |

### Gemini 3.1 Pro (Lyrics)
- Model: gemini-3.1-pro-openai
- 1M token context window
- Input: ~$0.50/1M tokens, Output: ~$3.50/1M tokens

## Database Schema Updates

```sql
-- Add to tracks table
ALTER TABLE tracks ADD COLUMN category TEXT
  CHECK (category IN ('original','cover','remix','ai_generated')) DEFAULT 'original';
ALTER TABLE tracks ADD COLUMN tags TEXT[] DEFAULT '{}';
ALTER TABLE tracks ADD COLUMN publish_at TIMESTAMPTZ;
ALTER TABLE tracks ADD COLUMN description TEXT;
ALTER TABLE tracks ADD COLUMN youtube_url TEXT;
ALTER TABLE tracks ADD COLUMN spotify_url TEXT;

-- Track analytics (daily aggregation)
CREATE TABLE track_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  plays INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  UNIQUE(track_id, date)
);

-- Update generations for full studio
ALTER TABLE generations ADD COLUMN model_version TEXT DEFAULT 'v5';
ALTER TABLE generations ADD COLUMN generation_type TEXT
  CHECK (generation_type IN ('generate','extend','cover','mashup','vocals','video','lyrics'))
  DEFAULT 'generate';
ALTER TABLE generations ADD COLUMN source_track_id UUID REFERENCES tracks(id);
ALTER TABLE generations ADD COLUMN variations JSONB DEFAULT '[]';
```

## Pricing Model

| Plan | Credits/month | Price | Use cases |
|------|-------------|-------|-----------|
| FREE | 5 | $0 | 1 generation or 5 lyrics |
| STARTER | 30 | $9/mo | ~6 songs |
| PRO | 100 | $29/mo | ~20 songs + premium features |
| UNLIMITED | 500 | $79/mo | Full access |

## Credit Cost Breakdown

| Feature | Credits | Kie.ai cost | Our price | Margin |
|---------|---------|-------------|-----------|--------|
| Generate Music | 5 | $0.06 | $0.30-0.79 | 400-1200% |
| Extend | 5 | $0.06 | $0.30-0.79 | 400-1200% |
| Cover | 5 | $0.06 | $0.30-0.79 | 400-1200% |
| Mashup | 10 | $0.12 | $0.60-1.58 | 400-1200% |
| Lyrics (Gemini) | 1 | ~$0.01 | $0.06-0.16 | 500-1500% |

## Site Structure

### Public Pages
- `/` — Landing (Hero + Featured Music with category tabs + Features + Pricing + CTA)
- `/about` — About AI-Records
- `/pricing` — Plans + FAQ
- `/contact` — Contact form (real email via Resend)
- `/blog` — Music articles, tutorials
- `/privacy`, `/terms` — Legal

### Protected Pages (Clerk auth required)
- `/dashboard` — User stats, recent generations, quick actions
- `/studio` — Hub for all creation tools
- `/studio/lyrics` — Lyrics generator (Gemini 3.1 Pro)
- `/studio/generate` — Music generator (SUNO V5, multiple variations)
- `/studio/extend` — Extend existing song
- `/studio/cover` — Change style/genre
- `/studio/mashup` — Combine tracks
- `/studio/vocals` — Add/separate vocals
- `/studio/video` — Create music video
- `/player` — Full music catalog
- `/my-music` — User's generated songs + publish flow
- `/settings` — Profile, subscription, preferences

### Admin Pages
- `/admin` — Dashboard with real analytics
- `/admin/tracks` — Full CRUD table (edit, delete, reorder, bulk actions)
- `/admin/tracks/[id]/edit` — Edit track (all fields + media)
- `/admin/upload` — Upload new track
- `/admin/users` — User management
- `/admin/analytics` — Detailed analytics (charts)

## Design System: Music-First

### Principles
1. Music is the hero — UI serves the audio
2. Dark theme everywhere — DAW/Studio feel
3. Audio-reactive waveform — the ONLY 3D element
4. Context adaptation — Landing ≠ Studio ≠ Admin

### Color Palette
- Primary: Purple (#7C3AED) → Cyan (#06B6D4) gradient
- Background: Gray-950 (#030712)
- Surface: Gray-900 (#111827) with glassmorphism
- Text: White + Gray-300
- Accent: Amber (#F59E0B) for featured/premium
- Categories: Original=Purple, Cover=Cyan, Remix=Pink, AI Generated=Green

### Components
- Glass Card — backdrop-blur-xl, border-white/10, bg-white/5
- Audio Waveform — Canvas 2D, reactive to playing track
- Track Card — cover image + info + play + download
- Studio Panel — dark bg, subtle borders, tool-like
- Progress Ring — circular progress for generation status

## Implementation Phases

### Phase 0: Critical Fixes (1 hour)
- Fix /register → /sign-up links
- Fix sitemap.xml + robots.txt (correct domain)
- Fix credits loading from API
- Fix player demo tracks (.wav → .mp3)

### Phase 1: Admin CMS (3-4 hours)
- DB migration (category, tags, publish_at, description)
- Edit track API + page
- Delete track API + confirmation
- Cover image upload
- Scheduled publish logic
- Analytics dashboard

### Phase 2: Kie.ai Integration (3-4 hours)
- New src/lib/kieai.ts client
- Replace OpenRouter → Gemini 3.1 Pro
- Replace SunoAPI.org → Kie.ai SUNO
- Generate with model selection (V3.5→V5)
- Multiple variations (2-4 per generation)
- Generation history

### Phase 3: Full Studio (4-5 hours)
- Extend, Cover, Mashup pages + APIs
- Vocals (add/separate) pages + APIs
- Music Video page + API
- "Publish to AI-Records" flow

### Phase 4: Design Upgrade (3-4 hours)
- Music-First design system
- Audio-reactive waveform
- Track cards with cover images
- Category tabs on landing
- Glass card components
- Studio DAW-like interface

### Phase 5: SEO + Content (2-3 hours)
- Schema integration (already created)
- Per-page metadata
- og:image
- llms.txt
- Dynamic sitemap
- Updated suno-bg-hitmaker.md skill
