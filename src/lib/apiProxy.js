const TIMEOUT_MS = 8000;

export const API_BASE_URL = "https://apiizaeltec.dev.vilhena.ifro.edu.br";

// Ignora erros de certificado SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function proxyFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return Response.json(data, { status: res.status });
  } catch (e) {
    clearTimeout(timer);
    const isTimeout = e.name === "AbortError";
    return Response.json(
      { erro: isTimeout ? "Tempo limite excedido ao conectar com a API." : e.message },
      { status: 502 }
    );
  }
}
