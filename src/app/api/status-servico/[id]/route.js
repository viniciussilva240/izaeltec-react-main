import { proxyFetch } from "@/lib/apiProxy";

const API_BASE = "https://apiizaeltec.dev.vilhena.ifro.edu.br/status-servico";

export async function GET(_, { params }) {
  const { id } = await params;
  return proxyFetch(`${API_BASE}/id/${id}`);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  return proxyFetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function DELETE(_, { params }) {
  const { id } = await params;
  return proxyFetch(`${API_BASE}/${id}`, { method: "DELETE" });
}
