import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Publishable-key client for public read-only server work. No session, RLS as anon.
export function createPublicClient(): SupabaseClient<Database> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase env not configured");

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );
        new Headers(init?.headers).forEach((v, k) => h.set(k, v));
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// Product/red-carpet photos may be stored as public paths (/images/...), absolute
// URLs, or storage object paths inside a private bucket. Resolve storage paths to
// short-lived signed URLs.
export async function signImageUrls(
  client: SupabaseClient<Database>,
  bucket: string,
  rows: { image_url: string | null }[],
): Promise<void> {
  await Promise.all(
    rows.map(async (row) => {
      const url = row.image_url;
      if (!url || url.startsWith("/") || url.startsWith("http")) return;
      const { data } = await client.storage.from(bucket).createSignedUrl(url, 60 * 60);
      if (data?.signedUrl) row.image_url = data.signedUrl;
    }),
  );
}
