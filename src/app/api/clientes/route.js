import { proxyFetch } from "@/lib/apiProxy";

const API_BASE = "https://apiizaeltec.dev.vilhena.ifro.edu.br/clientes";

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
