import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Demo tracks data (used when Supabase is not configured or for initial data)
const demoTracks = [
  {
    id: 'demo-1',
    title: 'Без посока',
    artist: 'Sarys',
    style: 'Pop',
    audio_url: '/audio/sarys-bez-posoka.wav',
    cover_url: null,
    lyrics: null,
    is_public: true,
    play_count: 1234,
    duration: 204,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Изгубени дни',
    artist: 'Sarys',
    style: 'Ballad',
    audio_url: '/audio/sarys-izgubeni-dni.wav',
    cover_url: null,
    lyrics: null,
    is_public: true,
    play_count: 876,
    duration: 252,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Без посока 2',
    artist: 'Sarys',
    style: 'Pop',
    audio_url: '/audio/sarys-bez-posoka-2.wav',
    cover_url: null,
    lyrics: null,
    is_public: true,
    play_count: 543,
    duration: 198,
    created_at: new Date().toISOString(),
  },
];

// GET - Fetch tracks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'public', 'user', 'all'
    const limit = parseInt(searchParams.get('limit') || '20');

    // Try to get tracks from Supabase
    try {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase.from('tracks').select('*');

      if (type === 'public') {
        query = query.eq('is_public', true);
      } else if (type === 'user' && user) {
        query = query.eq('user_id', user.id);
      } else if (user) {
        // Get both public and user's tracks
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data: tracks, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // If no tracks in DB, return demo tracks
      if (!tracks || tracks.length === 0) {
        return NextResponse.json({ tracks: demoTracks });
      }

      return NextResponse.json({ tracks });
    } catch {
      // If Supabase is not configured or fails, return demo tracks
      return NextResponse.json({ tracks: demoTracks });
    }
  } catch (error) {
    console.error('Tracks GET Error:', error);
    return NextResponse.json({ tracks: demoTracks });
  }
}

// POST - Create a new track
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, audio_url, lyrics, style, is_public } = body;

    if (!title || !audio_url) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Title and audio URL are required' },
        { status: 400 }
      );
    }

    const { data: track, error } = await supabase
      .from('tracks')
      .insert({
        user_id: user.id,
        title,
        artist: user.user_metadata?.name || 'AI-Records',
        audio_url,
        lyrics,
        style,
        is_public: is_public || false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ track });
  } catch (error) {
    console.error('Tracks POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    );
  }
}
