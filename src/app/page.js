"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) =>
  `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function fmtData(dataStr) {
  if (!dataStr) return "—";
  return new Date(dataStr).toLocaleDateString("pt-BR");
}

function getMesAtual() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getMesAno(dataStr) {
  if (!dataStr) return null;
  const d = new Date(dataStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4M12 15h4M8 11h.01M8 15h.01" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconDollar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ─── Cores preset para status (igual à página de ordens) ─────────────────────
const CORES_PRESET = [
  { bg: "#fff0f3", text: "#b1002f", dot: "#b1002f" },
  { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
  { bg: "#fefce8", text: "#854d0e", dot: "#eab308" },
  { bg: "#faf5ff", text: "#6b21a8", dot: "#a855f7" },
  { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
  { bg: "#f0f9ff", text: "#0c4a6e", dot: "#0ea5e9" },
  { bg: "#fdf2f8", text: "#86198f", dot: "#d946ef" },
];

function StatusBadge({ nome, corIndex }) {
  const cor = CORES_PRESET[corIndex ?? 0] ?? CORES_PRESET[0];
  return (
    <span className={styles.badge} style={{ background: cor.bg, color: cor.text }}>
      <span className={styles.badgeDot} style={{ background: cor.dot }} />
      {nome ?? "—"}
    </span>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [ordens,    setOrdens]    = useState([]);
  const [clientes,  setClientes]  = useState([]);
  const [statusList,setStatusList]= useState([]);
  const [garantias, setGarantias] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(null);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const [resO, resC, resS, resG] = await Promise.all([
        fetch("/api/ordens"),
        fetch("/api/clientes"),
        fetch("/api/status-servico"),
        fetch("/api/garantias?dias=15"),
      ]);
      const [dataO, dataC, dataS, dataG] = await Promise.all([
        resO.json(), resC.json(), resS.json(), resG.json(),
      ]);

      setOrdens(Array.isArray(dataO) ? dataO : (dataO.value ?? []));
      setClientes(Array.isArray(dataC) ? dataC : (dataC.value ?? []));
      setStatusList(
        (Array.isArray(dataS) ? dataS : (dataS.value ?? [])).map((s) => ({
          id: s.id,
          nome: s.nome,
          corIndex: s.corIndex ?? 0,
        }))
      );
      setGarantias(Array.isArray(dataG) ? dataG : (dataG.value ?? []));
    } catch (e) {
      setErro("Não foi possível carregar os dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  // ── Derivações ───────────────────────────────────────────────────────────────
  const mesAtual = getMesAtual();

  // Status: detecta "aberto" e "em andamento" pelo nome (case-insensitive)
  const getStatusObj = (id) => statusList.find((s) => s.id === Number(id));

  const abertas     = ordens.filter((o) => {
    const s = getStatusObj(o.status_id);
    return s?.nome?.toLowerCase().includes("aberto") || s?.nome?.toLowerCase().includes("aberta");
  });
  const emAndamento = ordens.filter((o) => {
    const s = getStatusObj(o.status_id);
    return s?.nome?.toLowerCase().includes("andamento") || s?.nome?.toLowerCase().includes("progresso");
  });
  const finalizadas = ordens.filter((o) => !!o.data_conclusao);

  const faturamentoMensal = ordens
    .filter((o) => getMesAno(o.data_conclusao) === mesAtual)
    .reduce((s, o) => s + Number(o.valor_total || 0), 0);

  // Contagem de status para o painel de distribuição
  const statusContagem = statusList.map((s) => ({
    ...s,
    count: ordens.filter((o) => Number(o.status_id) === s.id).length,
  })).filter((s) => s.count > 0);

  const getNomeCliente = (id) => {
    const c = clientes.find((c) => c.id === Number(id));
    return c?.nome ?? `Cliente #${id}`;
  };

  // ── Cards de estatísticas ────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Ordens Abertas",
      value: loading ? "..." : String(abertas.length),
      icon: <IconClipboard />,
      iconBg: "#fff7ed",
      iconColor: "#f97316",
    },
    {
      label: "Em Andamento",
      value: loading ? "..." : String(emAndamento.length),
      icon: <IconClock />,
      iconBg: "#fff7ed",
      iconColor: "#f97316",
    },
    {
      label: "Finalizadas",
      value: loading ? "..." : String(finalizadas.length),
      icon: <IconCheck />,
      iconBg: "#f0fdf4",
      iconColor: "#22c55e",
    },
    {
      label: "Garantias a Vencer (15d)",
      value: loading ? "..." : String(garantias.length),
      icon: <IconClock />,
      iconBg: "#fefce8",
      iconColor: "#eab308",
    },
    {
      label: "Total de Clientes",
      value: loading ? "..." : String(clientes.length),
      icon: <IconUsers />,
      iconBg: "#eff6ff",
      iconColor: "#3b82f6",
    },
    {
      label: "Faturamento Mensal",
      value: loading ? "..." : fmt(faturamentoMensal),
      sub: mesAtual,
      icon: <IconDollar />,
      iconBg: "#faf5ff",
      iconColor: "#a855f7",
      large: true,
    },
    {
      label: "Total de OS",
      value: loading ? "..." : String(ordens.length),
      icon: <IconBox />,
      iconBg: "#fff1f2",
      iconColor: "#f43f5e",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Visão geral do seu negócio</p>
        </div>
        <button
          className={styles.btnRecarregar}
          onClick={carregar}
          disabled={loading}
          title="Recarregar"
        >
          <IconRefresh /> Atualizar
        </button>
      </div>

      {erro && <div className={styles.erroBox}>{erro}</div>}

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((card, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>{card.label}</span>
              <span
                className={styles.statIcon}
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </span>
            </div>
            <div>
              <div
                className={`${styles.statValue} ${card.large ? styles.statValueLarge : ""}`}
              >
                {card.value}
              </div>
              {card.sub && <div className={styles.statSub}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.bottomGrid}>

        {/* Garantias a Vencer */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Garantias Quase Expirando</h2>
          {loading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
            </div>
          ) : garantias.length === 0 ? (
            <p className={styles.emptyText}>Nenhuma garantia próxima do vencimento.</p>
          ) : (
            <div>
              {garantias.slice(0, 8).map((g, i) => {
                return (
                  <div
                    key={g.id}
                    className={`${styles.orderRow} ${
                      i < garantias.length - 1 ? styles.orderRowBorder : ""
                    }`}
                  >
                    <div className={styles.orderInfo}>
                      <div className={styles.orderTop}>
                        <span className={styles.orderId}>
                          OS #{String(g.id).padStart(5, "0")}
                        </span>
                        <span style={{ background:"#fefce8", color:"#eab308", padding:"2px 8px", borderRadius:4, fontSize:12, fontWeight:600 }}>
                          Vence em {g.dias_restantes} dias
                        </span>
                      </div>
                      <div className={styles.orderDevice}>
                        <span className={styles.orderClient}>
                          {g.cliente_nome} — {g.equipamento_modelo}
                        </span>
                      </div>
                      <div className={styles.orderDate}>
                        Vencimento: {fmtData(g.data_garantia_fim)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
