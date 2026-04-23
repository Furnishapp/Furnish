import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Singleton browser client — safe to import in any Client Component.
// For Server Components, use createServerClient() from @/lib/supabase/server.
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);