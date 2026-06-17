import { proxyFetch } from "@/lib/apiProxy";

const API_BASE = "https://apiizaeltec.dev.vilhena.ifro.edu.br/ordens-servico";

// DELETE /ordens/:id/servicos/:itemId — remove o vínculo de serviço (itemId = id do vínculo)
export async function DELETE(_, { params }) {
  const { id, itemId } = await params;
  return proxyFetch(`${API_BASE}/${id}/servicos/${itemId}`, { method: "DELETE" });
}
