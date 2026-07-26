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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        ...(init.headers ?? {})
      },
      cache: "no-store"
    });
  } finally {
    clearTimeout(timeout);
  }

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Supabase ${table} request failed: ${response.status} ${raw}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  if (!raw || raw.trim() === "") {
    return [] as T;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`Failed to parse Supabase ${table} response JSON: ${String(err)}`);
  }
}
