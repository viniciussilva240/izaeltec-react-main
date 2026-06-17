import { proxyFetch } from "@/lib/apiProxy";

const API_BASE = "https://apiizaeltec.dev.vilhena.ifro.edu.br/ordens-servico";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q        = searchParams.get("q");
  const statusId = searchParams.get("statusId");

  let url = API_BASE;
  const params = new URLSearchParams();
  if (q)        params.set("q", q);
  if (statusId) params.set("statusId", statusId);
  if (params.toString()) url = `${API_BASE}?${params.toString()}`;

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
