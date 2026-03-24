import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getSupabaseAdmin } from '@/lib/auth';
import { uploadToR2, isR2Configured } from '@/lib/r2';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3'];

export async function POST(request: NextRequest) {
  try {
    // Auth check
    let user;
    try {
      user = await requireAdmin();
    } catch {
      return NextResponse.json(
        { error: 'Нямате права за тази операция' },
        { status: 403 }
      );
    }

    // Check R2 configuration
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: 'Хранилището за файлове не е конфигурирано' },
        { status: 503 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const artist = (formData.get('artist') as string) || 'AI-Records';
    const style = formData.get('style') as string | null;
    const lyrics = formData.get('lyrics') as string | null;
    const isFeatured = formData.get('is_featured') === 'true';

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'Моля, изберете аудио файл' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Моля, въведете заглавие' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Невалиден формат. Позволени са MP3 и WAV файлове.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Файлът е твърде голям. Максимумът е 50MB.' },
        { status: 400 }
      );
    }

    // Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const audioUrl = await uploadToR2(buffer, file.name, file.type);

    // Insert into Supabase
    const { data: track, error: dbError } = await getSupabaseAdmin()
      .from('tracks')
      .insert({
        title: title.trim(),
        artist,
        style: style || null,
        audio_url: audioUrl,
        lyrics: lyrics || null,
        is_featured: isFeatured,
        is_public: true,
        file_size: file.size,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Грешка при запис в базата данни' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, track });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Възникна грешка при качването' },
      { status: 500 }
    );
  }
}
