"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isLogin  = pathname === "/login";

  // "idle" enquanto não verificou, "ok" autenticado, "redirect" vai redirecionar
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    try {
      const auth = localStorage.getItem("auth");
      if (!auth && !isLogin) {
        setStatus("redirect");
        router.replace("/login");
      } else {
        setStatus("ok");
      }
    } catch {
      // localStorage inacessível (SSR ou modo privado restrito)
      if (!isLogin) {
        setStatus("redirect");
        router.replace("/login");
      } else {
        setStatus("ok");
      }
    }
  }, [pathname]);

  // Página de login: renderiza sem header e sem esperar verificação
  if (isLogin) return <>{children}</>;

  // Aguarda verificação — evita flash de conteúdo protegido
  if (status !== "ok") return null;

  return (
    <>
      <Header />
      {children}
    </>
  );
}
