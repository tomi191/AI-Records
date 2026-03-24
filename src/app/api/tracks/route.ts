import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client (respects RLS)
function getPublicClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Service role client (bypasses RLS)
function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

// GET /api/tracks — Public endpoint, no auth required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 20 : rawLimit), 50);

    const supabase = getPublicClient();

    let query = supabase
      .from('tracks')
      .select(
        'id, title, artist, style, audio_url, cover_url, lyrics, duration, file_size, is_featured, play_count, download_count, created_at'
      )
      .eq('is_public', true);

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data: tracks, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({ tracks: tracks ?? [] });
  } catch (error) {
    console.error('Tracks GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}

// POST /api/tracks — Increment play or download count
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId, action } = body as { trackId: unknown; action: unknown };

    if (
      typeof trackId !== 'string' ||
      !trackId ||
      (action !== 'play' && action !== 'download')
    ) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { error } = await supabase.rpc('increment_track_count', {
      track_id: trackId,
      count_type: action,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracks POST Error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
