import { proxyFetch } from "@/lib/apiProxy";

const API_BASE = "https://apiizaeltec.dev.vilhena.ifro.edu.br/ordens-servico";

// PATCH /ordens/:id/produtos/:itemId — atualiza a quantidade de um produto na OS
// Body: { "quantidade": number }
export async function PATCH(req, { params }) {
  const { id, itemId } = await params;
  const body = await req.json();
  return proxyFetch(`${API_BASE}/${id}/produtos/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body),
  });
}

// DELETE /ordens/:id/produtos/:itemId — remove o vínculo de produto (itemId = id do vínculo)
export async function DELETE(_, { params }) {
  const { id, itemId } = await params;
  return proxyFetch(`${API_BASE}/${id}/produtos/${itemId}`, { method: "DELETE" });
}
