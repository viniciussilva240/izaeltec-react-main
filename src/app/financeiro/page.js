"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function getMesAno(dataStr) {
  if (!dataStr) return null;
  const d = new Date(dataStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getMesAtual() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// Gera lista dos últimos N meses (mais antigo → mais recente)
function ultimos6Meses() {
  const meses = [];
  const hoje = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push(`${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`);
  }
  return meses;
}

function formatData(dataStr) {
  if (!dataStr) return "—";
  return new Date(dataStr).toLocaleDateString("pt-BR");
}

const IconDollar  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconTrend   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconCard    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconRefresh = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

// ─── Gráfico de barras simples ────────────────────────────────────────────────
function BarChart({ dados }) {
  // dados = [{ mes, valor }]
  const max = Math.max(...dados.map(d => d.valor), 1);
  return (
    <div className={styles.barChart}>
      {dados.map((d, i) => {
        const pct = (d.valor / max) * 100;
        const isCurrent = d.mes === getMesAtual();
        return (
          <div key={i} className={styles.barCol}>
            <div className={styles.barTooltip}>{fmt(d.valor)}</div>
            <div className={styles.barWrapper}>
              <div
                className={styles.bar}
                style={{
                  height: `${Math.max(pct, d.valor > 0 ? 4 : 0)}%`,
                  background: isCurrent
                    ? "linear-gradient(180deg,#b1002f,#c2006f)"
                    : "linear-gradient(180deg,#e2e8f0,#cbd5e1)",
                }}
              />
            </div>
            <span className={styles.barLabel}>{d.mes.slice(0, 2)}/{d.mes.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function FinanceiroPage() {
  const [ordens,    setOrdens]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(null);
  const [mesFiltro, setMesFiltro] = useState("Todos");
  const isMobile = useIsMobile();

  async function carregar() {
    setLoading(true); setErro(null);
    try {
      const res  = await fetch("/api/ordens");
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      const data = await res.json();
      setOrdens(Array.isArray(data) ? data : (data.value ?? []));
    } catch {
      setErro("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const mesAtual = getMesAtual();

  // Campos da API real
  const getDataFim   = o => o.dataFinalizacaoServicos ?? o.data_conclusao;
  const getDataEnt   = o => o.dataEntradaServicos ?? o.data_entrada;
  const getValor     = o => Number(o.valorAlternativoOrdemServicos ?? o.valor_total ?? 0);
  const getId        = o => o.idServicos ?? o.id;
  const getRelato    = o => o.relatoClienteServicos ?? o.descricao_problema ?? "";

  const concluidas    = ordens.filter(o => !!getDataFim(o));
  const receitaTotal  = concluidas.reduce((s, o) => s + getValor(o), 0);
  const receitaMensal = concluidas
    .filter(o => getMesAno(getDataFim(o)) === mesAtual)
    .reduce((s, o) => s + getValor(o), 0);

  // Últimos 6 meses para o gráfico
  const meses6 = ultimos6Meses();
  const dadosGrafico = meses6.map(mes => ({
    mes,
    valor: concluidas
      .filter(o => getMesAno(getDataFim(o)) === mes)
      .reduce((s, o) => s + getValor(o), 0),
  }));

  // Meses para filtro da tabela
  const mesesDisponiveis = [...new Set(
    ordens.map(o => getMesAno(getDataEnt(o))).filter(Boolean)
  )].sort().reverse();

  const filtered = ordens.filter(o => {
    if (mesFiltro === "Todos") return true;
    return getMesAno(getDataEnt(o)) === mesFiltro;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Controle Financeiro</h1>
          <p className={styles.subtitle}>Dados baseados nas ordens de serviço</p>
        </div>
        <button className={styles.btnRecarregar} onClick={carregar} disabled={loading}>
          <IconRefresh /> Recarregar
        </button>
      </div>

      {erro && <div className={styles.erroBox}>{erro}</div>}

      {/* Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statLabel}>Receita Total</span><span className={styles.statIcon} style={{ background:"#f0fdf4",color:"#22c55e" }}><IconDollar /></span></div>
          <div className={styles.statValue}>{loading ? "..." : fmt(receitaTotal)}</div>
          <div className={styles.statSub}>Ordens concluídas</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statLabel}>Receita Mensal</span><span className={styles.statIcon} style={{ background:"#fff0f3",color:"#b1002f" }}><IconTrend /></span></div>
          <div className={styles.statValue}>{loading ? "..." : fmt(receitaMensal)}</div>
          <div className={styles.statSub}>{mesAtual}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statLabel}>Total de Ordens</span><span className={styles.statIcon} style={{ background:"#faf5ff",color:"#a855f7" }}><IconCard /></span></div>
          <div className={styles.statValue}>{loading ? "..." : ordens.length}</div>
          <div className={styles.statSub}>{concluidas.length} concluídas</div>
        </div>
      </div>

      {/* Gráfico Receita Mensal */}
      <div className={styles.tableCard} style={{ marginBottom:20 }}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Histórico de Receita Mensal</h2>
          <span style={{ fontSize:12,color:"#94a3b8" }}>Últimos 6 meses</span>
        </div>
        {loading ? (
          <div className={styles.loadingBox}><div className={styles.spinner} /></div>
        ) : (
          <div style={{ padding:"16px 24px 24px" }}>
            <BarChart dados={dadosGrafico} />
          </div>
        )}
      </div>

      {/* Tabela histórico */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Histórico de Ordens</h2>
          <div className={styles.filtros}>
            <select className={styles.filtroSelect} value={mesFiltro} onChange={e=>setMesFiltro(e.target.value)}>
              <option value="Todos">Todos os meses</option>
              {mesesDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}><div className={styles.spinner} /><span>Carregando...</span></div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>Nenhuma ordem encontrada.</div>
        ) : isMobile ? (
          <div className={styles.cardList}>
            {filtered.map(o => {
              const concluida = !!getDataFim(o);
              return (
                <div key={getId(o)} className={styles.ordemCard}>
                  <div className={styles.ordemCardTop}>
                    <span className={styles.osId}>#{String(getId(o)).padStart(5,"0")}</span>
                    <span className={concluida ? styles.valorPago : styles.valorPendente}>{fmt(getValor(o))}</span>
                  </div>
                  <div className={styles.ordemCardBody}>
                    <div className={styles.ordemCardRow}><span className={styles.ordemCardLabel}>Entrada</span><span>{formatData(getDataEnt(o))}</span></div>
                    <div className={styles.ordemCardRow}><span className={styles.ordemCardLabel}>Finalização</span><span>{formatData(getDataFim(o))}</span></div>
                    {getRelato(o) && <div className={styles.ordemCardRelato}>{getRelato(o)}</div>}
                  </div>
                  {!concluida && <div className={styles.badgePendente}><span className={styles.dot}/>Pendente</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>OS #</th><th>Entrada</th><th>Finalização</th><th>Relato</th><th>Valor</th></tr></thead>
              <tbody>
                {filtered.map(o => {
                  const concluida = !!getDataFim(o);
                  return (
                    <tr key={getId(o)} className={styles.row}>
                      <td><span className={styles.osId}>#{String(getId(o)).padStart(5,"0")}</span></td>
                      <td>{formatData(getDataEnt(o))}</td>
                      <td>{formatData(getDataFim(o))}</td>
                      <td className={styles.relato}>{getRelato(o) || "—"}</td>
                      <td className={concluida ? styles.valorPago : styles.valorPendente}>{fmt(getValor(o))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
