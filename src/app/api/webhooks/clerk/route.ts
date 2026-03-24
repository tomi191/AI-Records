import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { WebhookEvent } from '@clerk/nextjs/server';

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  let evt: WebhookEvent;

  if (process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    // Production: verify webhook signature with @clerk/nextjs/webhooks
    const { verifyWebhook } = await import('@clerk/nextjs/webhooks');
    try {
      evt = await verifyWebhook(request);
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return new Response('Webhook verification failed', { status: 400 });
    }
  } else {
    // Development: skip verification
    const body = await request.json();
    evt = body as WebhookEvent;
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

    const email = email_addresses?.[0]?.email_address ?? null;
    const name = [first_name, last_name].filter(Boolean).join(' ') || null;
    const role = (public_metadata as Record<string, unknown>)?.role as string | undefined;

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('profiles').upsert(
      {
        id,
        email,
        name,
        avatar_url: image_url ?? null,
        ...(role ? { subscription_tier: role as Database['public']['Tables']['profiles']['Row']['subscription_tier'] } : {}),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Supabase upsert error:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (id) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from('profiles').delete().eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        return new Response('Database error', { status: 500 });
      }
    }
  }

  return new Response('OK', { status: 200 });
}
