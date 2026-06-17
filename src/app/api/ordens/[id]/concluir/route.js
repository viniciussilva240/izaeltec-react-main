import { proxyFetch } from "@/lib/apiProxy";

const API_BASE = "https://apiizaeltec.dev.vilhena.ifro.edu.br/ordens-servico";

// POST /ordens/:id/concluir — conclui a OS, atualiza estoque e calcula valor total
export async function POST(_, { params }) {
  const { id } = params;
  return proxyFetch(`${API_BASE}/${id}/concluir`, {
    method: "POST",
    headers: { "Accept": "application/json" },
  });
}
