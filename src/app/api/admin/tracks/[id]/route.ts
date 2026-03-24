import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getSupabaseAdmin } from '@/lib/auth';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json(
        { error: 'Нямате права за тази операция' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Allowed updatable fields
    const allowedFields = [
      'title', 'artist', 'style', 'category', 'tags', 'description',
      'lyrics', 'is_featured', 'is_public', 'youtube_url', 'spotify_url',
      'publish_at',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Handle cover image base64 upload
    if (body.cover_image) {
      const base64Data = body.cover_image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const ext = body.cover_image.match(/^data:image\/(\w+);/)?.[1] || 'png';
      const filename = `cover-${id}.${ext}`;
      const contentType = `image/${ext}`;

      // Upload cover to R2 under covers/ folder
      const coverUrl = await uploadToR2(buffer, `covers/${filename}`, contentType);
      updateData.cover_url = coverUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Няма данни за обновяване' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: track, error } = await supabase
      .from('tracks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Грешка при обновяване на песента' },
        { status: 500 }
      );
    }

    if (!track) {
      return NextResponse.json(
        { error: 'Песента не е намерена' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, track });
  } catch (error) {
    console.error('Track update error:', error);
    return NextResponse.json(
      { error: 'Възникна грешка при обновяването' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json(
        { error: 'Нямате права за тази операция' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Get track first to retrieve file URLs
    const { data: track, error: fetchError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !track) {
      return NextResponse.json(
        { error: 'Песента не е намерена' },
        { status: 404 }
      );
    }

    const publicUrl = process.env.R2_PUBLIC_URL || '';

    // Delete audio from R2 if it's an R2 URL
    if (track.audio_url && track.audio_url.startsWith(publicUrl)) {
      try {
        await deleteFromR2(track.audio_url);
      } catch (err) {
        console.error('Error deleting audio from R2:', err);
      }
    }

    // Delete cover from R2 if it's an R2 URL
    if (track.cover_url && track.cover_url.startsWith(publicUrl)) {
      try {
        await deleteFromR2(track.cover_url);
      } catch (err) {
        console.error('Error deleting cover from R2:', err);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('tracks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Грешка при изтриване на песента' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track delete error:', error);
    return NextResponse.json(
      { error: 'Възникна грешка при изтриването' },
      { status: 500 }
    );
  }
}
