import { proxyFetch } from "@/lib/apiProxy";

const API_BASE = "https://apiizaeltec.dev.vilhena.ifro.edu.br/ordens-servico";

// GET /ordens/:id/produtos — lista os produtos vinculados à OS
export async function GET(_, { params }) {
  const { id } = await params;
  return proxyFetch(`${API_BASE}/${id}/produtos`);
}

// POST /ordens/:id/produtos — adiciona um produto à OS aberta
// Body: { "produto_id": number, "quantidade": number }
export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  return proxyFetch(`${API_BASE}/${id}/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body),
  });
}
