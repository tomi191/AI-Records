import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/auth';

// GET - Fetch user credits
export async function GET() {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in' },
        { status: 401 }
      );
    }

    const { data: profile, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('credits, subscription_tier')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      credits: profile?.credits || 0,
      tier: profile?.subscription_tier || 'FREE',
    });
  } catch (error) {
    console.error('Credits GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}

// POST - Deduct credits (with optimistic locking to prevent race conditions)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', message: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Atomic check: only select if user has enough credits
    const { data, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .gte('credits', amount)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Optimistic locking: only deduct if credits haven't changed since the SELECT
    const { data: updated, error: updateError } = await getSupabaseAdmin()
      .from('profiles')
      .update({ credits: data.credits - amount })
      .eq('id', userId)
      .eq('credits', data.credits)
      .select('credits')
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: 'Credit deduction failed, please retry' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: updated.credits,
    });
  } catch (error) {
    console.error('Credits POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}
