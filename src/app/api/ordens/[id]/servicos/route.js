import { proxyFetch } from "@/lib/apiProxy";

const API_BASE = "https://apiizaeltec.dev.vilhena.ifro.edu.br/ordens-servico";

// GET /ordens/:id/servicos — lista os serviços vinculados à OS
export async function GET(_, { params }) {
  const { id } = await params;
  return proxyFetch(`${API_BASE}/${id}/servicos`);
}

// POST /ordens/:id/servicos — adiciona um serviço à OS aberta
// Body: { "tipo_servico_id": number }
export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  return proxyFetch(`${API_BASE}/${id}/servicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body),
  });
}
