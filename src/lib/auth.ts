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
