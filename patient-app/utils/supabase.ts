import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getConfig(): { url: string; key: string } {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in .env.local'
    );
  }
  return { url, key };
}

// No Supabase Auth sessions here. Clerk is the only auth (patient-app only),
// handed to Supabase per request via accessToken. Session persistence is off
// so no native storage module is needed, which keeps Expo Go working.
// Third-party Clerk integration is configured in the Supabase dashboard.
// Local CLI equivalent:
// [auth.third_party.clerk]
// enabled = true
// domain = "<clerk-frontend-api>"
const authOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
} as const;

// No-auth client for public reads. Website uses the same open RLS phase.
// Patient screens should prefer createClerkSupabaseClient with the Clerk session token.
export const supabase: SupabaseClient = (() => {
  const { url, key } = getConfig();
  return createClient(url, key, { auth: { ...authOptions } });
})();

// Pass useAuth().getToken from @clerk/clerk-expo.
export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>
): SupabaseClient {
  const { url, key } = getConfig();
  return createClient(url, key, {
    auth: { ...authOptions },
    accessToken: async () => (await getToken()) ?? '',
  });
}
