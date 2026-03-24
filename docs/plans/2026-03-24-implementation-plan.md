# AI-Records: Admin Upload + Public Music + Clerk Auth — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Supabase auth with Clerk, add Cloudflare R2 audio storage, build admin upload panel, show featured music on landing page for free listening and download.

**Architecture:** Clerk for auth (Google + email), Supabase for DB only (profiles, tracks, generations), Cloudflare R2 for MP3 storage (zero egress). Admin uploads via /admin, featured tracks shown publicly on landing.

**Tech Stack:** Next.js 16, Clerk (@clerk/nextjs), Supabase (DB + RLS), Cloudflare R2 (@aws-sdk/client-s3), Tailwind CSS, Zustand, Framer Motion

---

## Task 1: Create Supabase Database Tables + RLS

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql` (reference only, applied via MCP)

**Step 1: Apply migration via Supabase MCP**

Execute this SQL via `mcp__plugin_supabase_supabase__apply_migration`:

```sql
-- Profiles (synced from Clerk)
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE','STARTER','PRO','UNLIMITED')),
  credits INTEGER NOT NULL DEFAULT 10,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tracks (uploaded music)
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'AI-Records',
  style TEXT,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  lyrics TEXT,
  duration INTEGER,
  file_size INTEGER,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  play_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generations (AI generation history)
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lyrics','music')),
  style TEXT,
  mood TEXT,
  topic TEXT,
  lyrics TEXT,
  audio_url TEXT,
  credits_used INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tracks_featured ON public.tracks(is_featured) WHERE is_featured = true;
CREATE INDEX idx_tracks_public ON public.tracks(is_public) WHERE is_public = true;
CREATE INDEX idx_tracks_created ON public.tracks(created_at DESC);
CREATE INDEX idx_generations_user ON public.generations(user_id);
CREATE INDEX idx_generations_created ON public.generations(created_at DESC);
CREATE INDEX idx_profiles_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- RLS: profiles
CREATE POLICY "Anyone can read public profile info" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- RLS: tracks
CREATE POLICY "Anyone can read public tracks" ON public.tracks FOR SELECT USING (is_public = true);
CREATE POLICY "Admin can insert tracks" ON public.tracks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND is_admin = true)
);
CREATE POLICY "Admin can update tracks" ON public.tracks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND is_admin = true)
);
CREATE POLICY "Admin can delete tracks" ON public.tracks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND is_admin = true)
);

-- RLS: generations
CREATE POLICY "Users can read own generations" ON public.generations FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can insert own generations" ON public.generations FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to increment play/download counts
CREATE OR REPLACE FUNCTION public.increment_track_count(track_id UUID, count_type TEXT)
RETURNS void AS $$
BEGIN
  IF count_type = 'play' THEN
    UPDATE public.tracks SET play_count = play_count + 1 WHERE id = track_id;
  ELSIF count_type = 'download' THEN
    UPDATE public.tracks SET download_count = download_count + 1 WHERE id = track_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 2: Verify tables exist**

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```
Expected: `generations`, `profiles`, `tracks`

**Step 3: Verify RLS is enabled**

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```
Expected: All three tables show `rowsecurity = true`

---

## Task 2: Install Dependencies + Configure Environment

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Modify: `.env.example`

**Step 1: Install Clerk and R2 SDK**

```bash
cd Z:/AI-Records && npm install @clerk/nextjs @aws-sdk/client-s3
```

**Step 2: Create .env.local**

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YW11c2VkLWNhdC00My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_p5fMLsm5SIjzCM9FKQ0FClBwdHI5W1hK9BZWFb8vGj
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase (DB only, no auth)
NEXT_PUBLIC_SUPABASE_URL=https://tisfsttvifrkjgxfofgn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpc2ZzdHR2aWZya2pneGZvZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDk0OTEsImV4cCI6MjA4OTg4NTQ5MX0.qQDBcYA5m_sFbLgOBsYLD4fVW6lSplXLoHtB1ifubGI
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase dashboard>

# Cloudflare R2
R2_ACCOUNT_ID=<cloudflare account id>
R2_ACCESS_KEY_ID=<r2 access key>
R2_SECRET_ACCESS_KEY=<r2 secret key>
R2_BUCKET_NAME=ai-records-music
R2_PUBLIC_URL=<r2 public bucket url>

# OpenRouter (lyrics generation)
OPENROUTER_API_KEY=<your key>

# Suno (music generation) - Optional
SUNO_API_KEY=<your key>
SUNO_API_URL=https://api.sunoapi.org/api/v1
```

**Step 3: Update .env.example to match new stack**

Remove Supabase auth references, add Clerk + R2 placeholders.

**Step 4: Verify install**

```bash
npm ls @clerk/nextjs @aws-sdk/client-s3
```
Expected: Both packages listed without errors.

---

## Task 3: Clerk Provider + Middleware (Replace Supabase Auth)

**Files:**
- Modify: `src/app/layout.tsx` — wrap with ClerkProvider
- Create: `middleware.ts` (project root) — Clerk route protection
- Delete: `src/lib/supabase/middleware.ts` — old Supabase auth middleware

**Step 1: Update root layout with ClerkProvider**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { bgBG } from '@clerk/localizations'; // Bulgarian if available, else custom
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI-Records | Създай Българска Музика',
  description: 'Генерирай професионални български текстове и ги превърни в истински песни. Идеално за поп, чалга, рок, фолк и други стилове.',
  keywords: ['българска музика', 'текстове на песни', 'генератор на текстове', 'създаване на музика', 'поп', 'чалга', 'рок', 'фолк'],
  authors: [{ name: 'AI-Records' }],
  openGraph: {
    title: 'AI-Records | Създай Българска Музика',
    description: 'Генерирай професионални български текстове и ги превърни в истински песни.',
    type: 'website',
    siteName: 'AI-Records',
    locale: 'bg_BG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Records | Създай Българска Музика',
    description: 'Генерирай професионални български текстове и ги превърни в истински песни.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="bg" className="dark">
        <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-200`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**Step 2: Create Clerk middleware at project root**

```ts
// middleware.ts (project root, NOT in src/)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/studio(.*)',
  '/player(.*)',
  '/settings(.*)',
  '/admin(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/privacy',
  '/terms',
  '/blog',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/tracks(.*)',       // public track listing
  '/api/webhooks(.*)',     // Clerk webhooks
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**Step 3: Delete old Supabase auth middleware**

Delete `src/lib/supabase/middleware.ts`

**Step 4: Verify build**

```bash
cd Z:/AI-Records && npm run build 2>&1 | head -30
```

Note: Build will likely have errors from components still importing old auth — that's expected at this stage.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: replace Supabase auth with Clerk provider + middleware"
```

---

## Task 4: Auth Pages + Clerk Webhook for Profile Sync

**Files:**
- Create: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Create: `src/app/api/webhooks/clerk/route.ts`
- Delete: `src/app/(auth)/login/page.tsx`
- Delete: `src/app/(auth)/register/page.tsx`
- Delete: `src/components/auth/LoginForm.tsx`
- Delete: `src/components/auth/RegisterForm.tsx`

**Step 1: Create Clerk sign-in page**

```tsx
// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-gray-900 border border-gray-800',
          },
        }}
      />
    </div>
  );
}
```

**Step 2: Create Clerk sign-up page**

```tsx
// src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-gray-900 border border-gray-800',
          },
        }}
      />
    </div>
  );
}
```

**Step 3: Create Clerk webhook for profile sync**

```ts
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    // In development, skip verification
    const payload = await req.json();
    return handleEvent(payload as WebhookEvent);
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Verification failed', { status: 400 });
  }

  return handleEvent(evt);
}

async function handleEvent(evt: WebhookEvent) {
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ') || email?.split('@')[0];
    const isAdmin = (public_metadata as Record<string, unknown>)?.role === 'admin';

    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id,
        email,
        name,
        avatar_url: image_url,
        is_admin: isAdmin,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('Profile sync error:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    await supabaseAdmin.from('profiles').delete().eq('id', id);
  }

  return new Response('OK', { status: 200 });
}
```

**Step 4: Install svix for webhook verification**

```bash
npm install svix
```

**Step 5: Delete old auth files**

```bash
rm src/app/\(auth\)/login/page.tsx
rm src/app/\(auth\)/register/page.tsx
rm src/components/auth/LoginForm.tsx
rm src/components/auth/RegisterForm.tsx
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Clerk auth pages + webhook for Supabase profile sync"
```

---

## Task 5: Cloudflare R2 Upload Utility

**Files:**
- Create: `src/lib/r2.ts`

**Step 1: Create R2 client utility**

```ts
// src/lib/r2.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'ai-records-music';
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string = 'audio/mpeg'
): Promise<string> {
  const key = `tracks/${Date.now()}-${filename}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(url: string): Promise<void> {
  const key = url.replace(`${PUBLIC_URL}/`, '');

  await R2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_PUBLIC_URL
  );
}
```

**Step 2: Commit**

```bash
git add src/lib/r2.ts && git commit -m "feat: add Cloudflare R2 upload/delete utility"
```

---

## Task 6: Admin Upload API Route

**Files:**
- Create: `src/app/api/admin/upload/route.ts`
- Create: `src/lib/auth.ts` — shared auth helpers

**Step 1: Create auth helpers**

```ts
// src/lib/auth.ts
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export { supabaseAdmin };

export async function getAuthUser() {
  const user = await currentUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    isAdmin: (user.publicMetadata as Record<string, unknown>)?.role === 'admin',
  };
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || !user.isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return user;
}
```

**Step 2: Create admin upload API**

```ts
// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '@/lib/auth';
import { uploadToR2, isR2Configured } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!isR2Configured()) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const artist = (formData.get('artist') as string) || 'AI-Records';
    const style = formData.get('style') as string | null;
    const lyrics = formData.get('lyrics') as string | null;
    const isFeatured = formData.get('is_featured') === 'true';

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only MP3 and WAV files are allowed' }, { status: 400 });
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
    }

    // Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const audioUrl = await uploadToR2(buffer, safeName, file.type);

    // Save to database
    const { data: track, error } = await supabaseAdmin
      .from('tracks')
      .insert({
        title,
        artist,
        style,
        lyrics,
        audio_url: audioUrl,
        file_size: file.size,
        is_featured: isFeatured,
        is_public: true,
        uploaded_by: admin.id,
      })
      .select()
      .single();

    if (error) {
      console.error('DB insert error:', error);
      return NextResponse.json({ error: 'Failed to save track' }, { status: 500 });
    }

    return NextResponse.json({ success: true, track });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add src/lib/auth.ts src/app/api/admin/upload/route.ts && git commit -m "feat: add admin upload API with R2 storage + auth helpers"
```

---

## Task 7: Admin Panel Pages (Upload + Manage)

**Files:**
- Rewrite: `src/app/(admin)/layout.tsx` — Clerk-based admin guard
- Rewrite: `src/app/(admin)/admin/page.tsx` — real data dashboard + track management
- Create: `src/app/(admin)/admin/upload/page.tsx` — upload form

**Step 1: Rewrite admin layout with Clerk auth**

```tsx
// src/app/(admin)/layout.tsx
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Upload, Music, ArrowLeft } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  if (!user) redirect('/sign-in');

  const isAdmin = (user.publicMetadata as Record<string, unknown>)?.role === 'admin';
  if (!isAdmin) redirect('/dashboard');

  const navItems = [
    { label: 'Табло', href: '/admin', icon: LayoutDashboard },
    { label: 'Качи Музика', href: '/admin/upload', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white">AI-Records Admin</h2>
          <p className="text-sm text-gray-400">{user.emailAddresses[0]?.emailAddress}</p>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mt-auto">
          <ArrowLeft className="w-4 h-4" /> Към сайта
        </Link>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

**Step 2: Rewrite admin dashboard with real data**

```tsx
// src/app/(admin)/admin/page.tsx
import { supabaseAdmin } from '@/lib/auth';
import Link from 'next/link';
import { Music, Users, Upload, TrendingUp, Play, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [
    { count: trackCount },
    { count: profileCount },
    { data: recentTracks },
    { data: featuredTracks },
  ] = await Promise.all([
    supabaseAdmin.from('tracks').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('tracks').select('*').order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('tracks').select('*').eq('is_featured', true),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Административно Табло</h1>
        <Link
          href="/admin/upload"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" /> Качи Музика
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400">Общо Песни</span>
          </div>
          <p className="text-3xl font-bold text-white">{trackCount || 0}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400">Потребители</span>
          </div>
          <p className="text-3xl font-bold text-white">{profileCount || 0}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-400">Featured</span>
          </div>
          <p className="text-3xl font-bold text-white">{featuredTracks?.length || 0}</p>
        </div>
      </div>

      {/* Recent Tracks Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Последни Песни</h2>
        </div>
        {recentTracks && recentTracks.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4 text-sm text-gray-400">Заглавие</th>
                <th className="text-left p-4 text-sm text-gray-400">Артист</th>
                <th className="text-left p-4 text-sm text-gray-400">Стил</th>
                <th className="text-center p-4 text-sm text-gray-400"><Play className="w-4 h-4 inline" /></th>
                <th className="text-center p-4 text-sm text-gray-400"><Download className="w-4 h-4 inline" /></th>
                <th className="text-center p-4 text-sm text-gray-400">Featured</th>
              </tr>
            </thead>
            <tbody>
              {recentTracks.map((track) => (
                <tr key={track.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="p-4 text-white">{track.title}</td>
                  <td className="p-4 text-gray-400">{track.artist}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">{track.style || '—'}</span></td>
                  <td className="p-4 text-center text-gray-400">{track.play_count}</td>
                  <td className="p-4 text-center text-gray-400">{track.download_count}</td>
                  <td className="p-4 text-center">{track.is_featured ? '⭐' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Няма качени песни</p>
            <Link href="/admin/upload" className="text-purple-400 hover:underline mt-2 inline-block">Качи първата песен</Link>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Create admin upload page**

```tsx
// src/app/(admin)/admin/upload/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Music, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const STYLES = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'rnb', label: 'R&B' },
  { value: 'chalga', label: 'Чалга' },
  { value: 'folk', label: 'Фолк' },
  { value: 'ballad', label: 'Балада' },
];

export default function AdminUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('Sarys');
  const [style, setStyle] = useState('pop');
  const [lyrics, setLyrics] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      // Auto-fill title from filename
      if (!title) {
        const name = selected.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setStatus('uploading');
    setProgress(30);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('style', style);
    formData.append('lyrics', lyrics);
    formData.append('is_featured', String(isFeatured));

    try {
      setProgress(60);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setProgress(100);
      setStatus('success');

      // Reset after 2 seconds and redirect
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Качи Музика</h1>

      {status === 'success' ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Песента е качена!</h2>
          <p className="text-gray-400">Пренасочване към таблото...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div className="relative">
            <label className="block border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <Music className="w-8 h-8 text-purple-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300">Избери MP3 или WAV файл</p>
                  <p className="text-gray-500 text-sm mt-1">Макс. 50MB</p>
                </div>
              )}
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Заглавие *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Без посока"
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Artist */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Артист</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Sarys"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Стил</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              {STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Lyrics (optional) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Текст (незадължително)</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={4}
              placeholder="Текстът на песента..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Featured checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-gray-300">Покажи на началната страница (Featured)</span>
          </label>

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress bar */}
          {status === 'uploading' && (
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!file || !title || status === 'uploading'}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'uploading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Качване...</>
            ) : (
              <><Upload className="w-5 h-5" /> Качи Песен</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add admin panel with real data dashboard + upload page"
```

---

## Task 8: Public Tracks API (Featured + All)

**Files:**
- Rewrite: `src/app/api/tracks/route.ts`

**Step 1: Rewrite tracks API**

```ts
// src/app/api/tracks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/tracks — public endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  let query = supabase
    .from('tracks')
    .select('id, title, artist, style, audio_url, cover_url, lyrics, duration, file_size, is_featured, play_count, download_count, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (featured === 'true') {
    query = query.eq('is_featured', true);
  }

  const { data: tracks, error } = await query;

  if (error) {
    console.error('Tracks fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }

  return NextResponse.json({ tracks: tracks || [] });
}

// POST /api/tracks/:id/play — increment play count
export async function POST(request: NextRequest) {
  const { trackId, action } = await request.json();

  if (!trackId || !['play', 'download'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAdmin.rpc('increment_track_count', {
    track_id: trackId,
    count_type: action,
  });

  return NextResponse.json({ success: true });
}
```

**Step 2: Commit**

```bash
git add src/app/api/tracks/route.ts && git commit -m "feat: public tracks API with featured filter + play/download counters"
```

---

## Task 9: Landing Page — Featured Music Section

**Files:**
- Create: `src/components/landing/FeaturedMusic.tsx`
- Modify: `src/app/page.tsx` — add FeaturedMusic, replace DemoPlayer
- Modify: `src/components/landing/index.ts` — export FeaturedMusic

**Step 1: Create FeaturedMusic component**

```tsx
// src/components/landing/FeaturedMusic.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Music, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Track {
  id: string;
  title: string;
  artist: string;
  style: string | null;
  audio_url: string;
  play_count: number;
  download_count: number;
}

export default function FeaturedMusic() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch('/api/tracks?featured=true')
      .then((r) => r.json())
      .then((data) => setTracks(data.tracks || []))
      .catch(console.error);
  }, []);

  const currentTrack = tracks[currentIndex];

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      // Track play count
      fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: currentTrack.id, action: 'play' }),
      }).catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % tracks.length);
    setIsPlaying(false);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(false);
    setProgress(0);
  };

  const handleDownload = async () => {
    if (!currentTrack) return;
    // Track download count
    fetch('/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId: currentTrack.id, action: 'download' }),
    }).catch(() => {});

    // Trigger download
    const a = document.createElement('a');
    a.href = currentTrack.audio_url;
    a.download = `${currentTrack.artist} - ${currentTrack.title}.mp3`;
    a.click();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (tracks.length === 0) return null;

  return (
    <section id="music" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Слушай Нашата Музика
          </h2>
          <p className="text-gray-400">Създадена с AI, вдъхновена от България</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8"
        >
          {/* Current Track Info */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center">
              <Music className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">{currentTrack.title}</h3>
            <p className="text-gray-400">{currentTrack.artist}</p>
            {currentTrack.style && (
              <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {currentTrack.style}
              </span>
            )}
          </div>

          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={currentTrack.audio_url}
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={handleNext}
          />

          {/* Progress Bar */}
          <div className="mb-6">
            <div
              className="w-full h-2 bg-gray-800 rounded-full cursor-pointer"
              onClick={(e) => {
                if (!audioRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pct * duration;
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
                style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <button onClick={handlePrev} className="text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
            </button>
            <button onClick={handleNext} className="text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Download + Stats */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {currentTrack.play_count}</span>
              <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {currentTrack.download_count}</span>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" /> Свали MP3
            </button>
          </div>

          {/* Track List */}
          {tracks.length > 1 && (
            <div className="mt-6 border-t border-gray-800 pt-6 space-y-2">
              {tracks.map((track, i) => (
                <button
                  key={track.id}
                  onClick={() => { setCurrentIndex(i); setIsPlaying(false); setProgress(0); }}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors text-left ${
                    i === currentIndex ? 'bg-purple-500/10 text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <span className="w-6 text-center text-sm">{i === currentIndex && isPlaying ? '♪' : i + 1}</span>
                  <span className="flex-1 font-medium">{track.title}</span>
                  <span className="text-sm">{track.artist}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Update landing page exports and page**

Update `src/components/landing/index.ts` to export FeaturedMusic.

Replace DemoPlayer import in `src/app/page.tsx` with FeaturedMusic.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add FeaturedMusic component on landing with real audio playback + download"
```

---

## Task 10: Update Navbar with Clerk UserButton

**Files:**
- Modify: `src/components/layout/Navbar.tsx` — replace manual auth UI with Clerk

Replace all `useUserStore` auth logic with Clerk's `useUser()` hook and `<UserButton/>` component. Replace login/register links with `<SignInButton/>` and `<SignUpButton/>`.

**Step 1: Rewrite Navbar auth section**

Key changes:
- Import `{ useUser, UserButton, SignInButton, SignUpButton }` from `@clerk/nextjs`
- Replace `isAuthenticated` checks with `isSignedIn` from `useUser()`
- Replace profile dropdown with `<UserButton />`
- Replace login/register buttons with Clerk components
- Keep credits display by fetching from Supabase profile

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: update Navbar with Clerk UserButton + auth components"
```

---

## Task 11: Update Dashboard + Studio + Player Layouts

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx` — use Clerk auth
- Modify: `src/app/(dashboard)/dashboard/page.tsx` — use Clerk user
- Keep studio and player pages mostly as-is (they use stores)

**Step 1: Update dashboard layout**

Replace `useUserStore` auth check with Clerk's `currentUser()` server component.

**Step 2: Update userStore**

Keep `userStore` for credits/client state but remove auth persistence. On mount, sync from Clerk user + Supabase profile.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: update dashboard layout + user sync with Clerk"
```

---

## Task 12: Cleanup + Auth on API Routes

**Files:**
- Modify: `src/app/api/generate/route.ts` — add Clerk auth
- Modify: `src/app/api/credits/route.ts` — add Clerk auth + transaction fix
- Modify: `src/app/api/suno/generate/route.ts` — add Clerk auth
- Modify: `src/app/api/suno/status/route.ts` — add Clerk auth
- Delete: `src/lib/supabase/middleware.ts` (if not already done)

**Step 1: Add auth to all API routes**

Use `auth()` from `@clerk/nextjs/server` at the top of each route:

```ts
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

**Step 2: Fix credits race condition**

In `/api/credits/route.ts`, use Supabase RPC or a single atomic UPDATE:

```sql
UPDATE profiles SET credits = credits - $amount WHERE id = $userId AND credits >= $amount RETURNING credits;
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add Clerk auth to all API routes + fix credits race condition"
```

---

## Task 13: Final Verification

**Step 1: Build check**

```bash
npm run build
```

**Step 2: Verify all routes**

- Landing page loads with FeaturedMusic (empty until tracks uploaded)
- /sign-in shows Clerk login
- /sign-up shows Clerk register
- /admin requires admin role
- /admin/upload works (after R2 configured)
- /dashboard requires auth
- /studio requires auth
- /api/tracks returns public tracks
- /api/generate requires auth

**Step 3: Final commit**

```bash
git add -A && git commit -m "chore: final cleanup and verification"
```

---

## Dependencies Summary

```
Task 1 (DB) → no dependencies
Task 2 (Install) → no dependencies
Task 3 (Clerk provider) → Task 2
Task 4 (Auth pages + webhook) → Task 1, Task 3
Task 5 (R2 utility) → Task 2
Task 6 (Upload API) → Task 1, Task 5
Task 7 (Admin pages) → Task 4, Task 6
Task 8 (Tracks API) → Task 1
Task 9 (Landing FeaturedMusic) → Task 8
Task 10 (Navbar) → Task 3
Task 11 (Dashboard) → Task 4
Task 12 (API auth + cleanup) → Task 4
Task 13 (Verify) → all
```

**Parallel execution possible:**
- Task 1 + Task 2 + Task 5 (all independent)
- Task 3 + Task 8 (after Task 1+2)
- Task 7 + Task 9 + Task 10 (after their deps)
