import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Server-side admin gate. Verifies the caller's role through the RLS-checked
// user_roles table (via the has_role security-definer function). Never trust
// client-provided role claims.
export async function assertAdmin(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || data !== true) {
    throw new Error("Forbidden: admin access required");
  }
}
