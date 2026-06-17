"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [form,    setForm]    = useState({ usuario: "", senha: "" });
  const [erro,    setErro]    = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const res  = await fetch("/api/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ usuario: form.usuario, senha: form.senha }),
      });
      const data = await res.json();

      if (data.ok) {
        localStorage.setItem("auth", "true");
        router.push("/");
        return;
      }

      setErro(data.erro || "Usuário ou senha incorretos.");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/img/izc.webp" alt="IzaelTec" className={styles.logoImg} />
        </div>

        <h1 className={styles.title}>Bem-vindo</h1>
        <p className={styles.subtitle}>Faça login para acessar o sistema</p>
        <p className={styles.subtitle}>usuario: admin/ senha: 123456</p>
        
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Usuário</label>
            <input
              className={styles.input}
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              placeholder="Digite seu usuário"
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Senha</label>
            <input
              className={styles.input}
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>

          {erro && <p className={styles.erro}>{erro}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
