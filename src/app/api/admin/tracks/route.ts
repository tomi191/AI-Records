import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getSupabaseAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json(
        { error: 'Нямате права за тази операция' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = getSupabaseAdmin();

    // Build query
    let query = supabase.from('tracks').select('*', { count: 'exact' });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      const sanitizedSearch = search.replace(/[%_\\]/g, '');
      if (sanitizedSearch) {
        query = query.or(`title.ilike.%${sanitizedSearch}%,artist.ilike.%${sanitizedSearch}%`);
      }
    }

    // Sort
    const ascending = sort.startsWith('+');
    const sortField = sort.replace(/^[+-]/, '') || 'created_at';
    query = query.order(sortField, { ascending });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tracks, count, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Грешка при зареждане на песните' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tracks: tracks ?? [], total: count ?? 0 });
  } catch (error) {
    console.error('Tracks list error:', error);
    return NextResponse.json(
      { error: 'Възникна грешка' },
      { status: 500 }
    );
  }
}
