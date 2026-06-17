import { proxyFetch, API_BASE_URL } from "@/lib/apiProxy";

const API_BASE = `${API_BASE_URL}/tipos-equipamento`;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const url = q ? `${API_BASE}?q=${encodeURIComponent(q)}` : API_BASE;
  return proxyFetch(url);
}

export async function POST(req) {
  const body = await req.json();
  return proxyFetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body),
  });
}
