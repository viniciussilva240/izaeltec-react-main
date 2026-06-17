// No longer importing API_BASE_URL from "@/lib/apiProxy" as we use hardcoded URL.
const FALLBACK_USER  = "admin";
const FALLBACK_SENHA = "123456";

export async function POST(req) {
  try {
    const { usuario, senha } = await req.json();

    if (!usuario || !senha) {
      return Response.json({ erro: "Usuário e senha são obrigatórios." }, { status: 400 });
    }

    // Tenta validar na API externa
    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 5000);

      const res = await fetch("https://apiizaeltec.dev.vilhena.ifro.edu.br/senha/1", {
        cache:  "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (usuario === data.user && senha === data.senha) {
          return Response.json({ ok: true });
        }
        return Response.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
      }
    } catch {
      // API externa inacessível — usa fallback
    }

    // Fallback com credenciais locais
    if (usuario === FALLBACK_USER && senha === FALLBACK_SENHA) {
      return Response.json({ ok: true });
    }

    return Response.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
  } catch {
    return Response.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
