function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  }

  return { url, key };
}

export function hasSupabaseConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function supabaseRequest<T>(
  table: string,
  init: RequestInit & { query?: string } = {}
): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const query = init.query ? `?${init.query}` : "";
  const endpoint = `${url}/rest/v1/${table}${query}`;

  const response = await fetch(endpoint, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${table} request failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}
