import dns from "dns";
import { promisify } from "util";

const resolve4 = promisify(dns.resolve4);

export async function GET() {
  const diagnostics = {};

  // Teste 1: Resolução de DNS
  try {
    diagnostics.dns_resolve = await resolve4("apiizaeltec.dev.vilhena.ifro.edu.br");
  } catch (err) {
    diagnostics.dns_resolve = `Erro: ${err.message}`;
  }

  // Teste 2: Fetch Direto à API
  try {
    const start = Date.now();
    const res = await fetch("https://apiizaeltec.dev.vilhena.ifro.edu.br/clientes", {
      signal: AbortSignal.timeout(3000)
    });
    diagnostics.direct_fetch = {
      status: res.status,
      time: `${Date.now() - start}ms`
    };
  } catch (err) {
    diagnostics.direct_fetch = `Erro: ${err.message}`;
  }

  // Teste 3: Loopback HTTP (Porta 80) com header Host
  try {
    const start = Date.now();
    const res = await fetch("http://127.0.0.1/clientes", {
      headers: { Host: "apiizaeltec.dev.vilhena.ifro.edu.br" },
      signal: AbortSignal.timeout(3000)
    });
    diagnostics.loopback_http = {
      status: res.status,
      time: `${Date.now() - start}ms`
    };
  } catch (err) {
    diagnostics.loopback_http = `Erro: ${err.message}`;
  }

  // Teste 4: Loopback HTTPS (Porta 443) com header Host
  try {
    const start = Date.now();
    const res = await fetch("https://127.0.0.1/clientes", {
      headers: { Host: "apiizaeltec.dev.vilhena.ifro.edu.br" },
      signal: AbortSignal.timeout(3000)
    });
    diagnostics.loopback_https = {
      status: res.status,
      time: `${Date.now() - start}ms`
    };
  } catch (err) {
    diagnostics.loopback_https = `Erro: ${err.message}`;
  }

  
  const commonPorts = [8000, 8080, 5000, 3000];
  diagnostics.port_scan = {};
  for (const port of commonPorts) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/clientes`, {
        signal: AbortSignal.timeout(1000)
      });
      diagnostics.port_scan[`port_${port}`] = `Ativa (Status ${res.status})`;
    } catch (err) {
      diagnostics.port_scan[`port_${port}`] = err.message;
    }
  }

  return Response.json(diagnostics);
}
