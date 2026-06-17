"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

// ─── APIs ─────────────────────────────────────────────────────────────────────
const API_STATUS   = "/api/status-servico";
const API_MARCAS   = "/api/marcas";
const API_TIPOS_SV = "/api/tipo-servicos";

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

// ─── Cores preset ─────────────────────────────────────────────────────────────
const CORES_PRESET = [
  { bg: "#fff0f3", text: "#b1002f", border: "#fecdd3" },
  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  { bg: "#fefce8", text: "#854d0e", border: "#fde68a" },
  { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
  { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
  { bg: "#f0f9ff", text: "#0c4a6e", border: "#bae6fd" },
  { bg: "#fdf2f8", text: "#86198f", border: "#f5d0fe" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconTagPlus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8-8a1 1 0 0 0 0-1.42L12 2z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>;
const IconTags    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} strokeLinecap="round"/></svg>;
const IconTag     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={12} height={12}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} strokeLinecap="round"/></svg>;
const IconTrash   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconEdit    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconPlus    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={15} height={15}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconBrand   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconWrench  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IconMonitor = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;const IconRefresh = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IconX       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function TagChip({ nome, corIndex }) {
  const cor = CORES_PRESET[corIndex] ?? CORES_PRESET[0];
  return (
    <span className={styles.tagChip} style={{ background: cor.bg, color: cor.text, border: `1px solid ${cor.border}` }}>
      <IconTag /> {nome}
    </span>
  );
}

// ─── Loading / Erro inline ────────────────────────────────────────────────────
function StatusBox({ loading, erro, onDismiss }) {
  if (loading) return (
    <div className={styles.loadingBox}>
      <div className={styles.spinner} /> <span>Carregando...</span>
    </div>
  );
  if (erro) return (
    <div className={styles.erroBox}>
      {erro}
      <button className={styles.btnErroFechar} onClick={onDismiss}><IconX /></button>
    </div>
  );
  return null;
}

// ─── Resolve corIndex a partir do hex salvo na API ───────────────────────────
function resolveCorIndex(item) {
  if (item.corIndex != null) return item.corIndex;
  if (item.cor) {
    const idx = CORES_PRESET.findIndex(
      c => c.text === item.cor || c.dot === item.cor || c.bg === item.cor
    );
    if (idx !== -1) return idx;
  }
  return 0;
}

// ─── Seção Status ─────────────────────────────────────────────────────────────
function SecaoStatus() {
  const [itens,    setItens]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [nome,     setNome]     = useState("");
  const [corIndex, setCorIndex] = useState(0);
  const [search,   setSearch]   = useState("");
  const [editId,   setEditId]   = useState(null);

  async function carregar() {
    setLoading(true); setErro(null);
    try {
      const res  = await fetch(API_STATUS);
      const data = await res.json();
      setItens(Array.isArray(data) ? data : (data.value ?? []));
    } catch (e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(); }, []);

  async function handleAdicionar() {
    if (!nome.trim()) return;
    setSalvando(true); setErro(null);
    try {
      const cor = CORES_PRESET[corIndex]?.text ?? "#b1002f";
      const url = editId ? `${API_STATUS}/${editId}` : API_STATUS;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), cor, corIndex }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setNome(""); setCorIndex(0); setEditId(null);
      await carregar();
    } catch (e) { setErro(`Erro ao salvar: ${e.message}`); }
    finally { setSalvando(false); }
  }

  function iniciarEdicao(item) {
    setEditId(item.id);
    setNome(item.nome || "");
    setCorIndex(resolveCorIndex(item));
  }

  function cancelarEdicao() {
    setEditId(null);
    setNome("");
    setCorIndex(0);
  }

  async function handleRemover(id) {
    setErro(null);
    try {
      const res = await fetch(`${API_STATUS}/${id}`, { method: "DELETE" });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      await carregar();
    } catch (e) { setErro(`Erro ao remover: ${e.message}`); }
  }

  const filtered = itens.filter((i) =>
    (i.nome ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.secao}>
      <div className={styles.secaoHeader}>
        <span className={styles.secaoIcone}><IconTagPlus /></span>
        <div>
          <h2 className={styles.secaoTitulo}>Status</h2>
          <p className={styles.secaoSubtitulo}>Status usados nas ordens de serviço</p>
        </div>
      </div>
      <div className={styles.layout}>
        {/* Form */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><IconPlus /><span>{editId ? "Editar Status" : "Adicionar Status"}</span></div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome</label>
            <input className={styles.input} placeholder="Ex: Urgente, Normal..." value={nome}
              onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdicionar()} disabled={salvando} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Cor</label>
            <div className={styles.coresGrid}>
              {CORES_PRESET.map((cor, i) => (
                <button key={i} className={`${styles.corBtn} ${corIndex === i ? styles.corBtnActive : ""}`}
                  style={{ background: cor.bg, borderColor: corIndex === i ? cor.text : cor.border }}
                  onClick={() => setCorIndex(i)}>
                  <span className={styles.corDot} style={{ background: cor.text }} />
                </button>
              ))}
            </div>
          </div>
          {nome.trim() && (
            <div className={styles.preview}>
              <span className={styles.previewLabel}>Prévia</span>
              <TagChip nome={nome} corIndex={corIndex} />
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button className={styles.btnAdicionar} onClick={handleAdicionar} disabled={salvando || !nome.trim()} style={{ flex: 1 }}>
              <IconPlus /> {salvando ? "Salvando..." : editId ? "Atualizar" : "Adicionar"}
            </button>
            {editId && (
              <button className={styles.btnRemover} onClick={cancelarEdicao} disabled={salvando} style={{ padding: "0 15px", background: "#f1f5f9", color: "#64748b" }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        {/* Lista */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><IconTags /><span>Cadastrados ({itens.length})</span></div>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className={styles.searchInput} placeholder="Buscar status..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <StatusBox loading={loading} erro={erro} onDismiss={() => setErro(null)} />
          {!loading && (
            <div className={styles.lista}>
              {filtered.length === 0 && <p className={styles.empty}>{search ? "Nenhum resultado." : "Nenhum status cadastrado."}</p>}
              {filtered.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemLeft}>
                    <TagChip nome={item.nome} corIndex={resolveCorIndex(item)} />
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button className={styles.btnRemover} onClick={() => iniciarEdicao(item)} title="Editar" style={{ color: "#3b82f6", background: "#eff6ff" }}><IconEdit /></button>
                    <button className={styles.btnRemover} onClick={() => handleRemover(item.id)} title="Remover"><IconTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Seção Marcas ─────────────────────────────────────────────────────────────
function SecaoMarcas() {
  const [itens,    setItens]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [nome,     setNome]     = useState("");
  const [search,   setSearch]   = useState("");
  const [editId,   setEditId]   = useState(null);

  async function carregar() {
    setLoading(true); setErro(null);
    try {
      const res  = await fetch(API_MARCAS);
      const data = await res.json();
      setItens(Array.isArray(data) ? data : (data.value ?? []));
    } catch (e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(); }, []);

  async function handleAdicionar() {
    if (!nome.trim()) return;
    setSalvando(true); setErro(null);
    try {
      const url = editId ? `${API_MARCAS}/${editId}` : API_MARCAS;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim() }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setNome(""); setEditId(null);
      await carregar();
    } catch (e) { setErro(`Erro ao salvar: ${e.message}`); }
    finally { setSalvando(false); }
  }

  function iniciarEdicao(item) {
    setEditId(item.id);
    setNome(item.nome || "");
  }

  function cancelarEdicao() {
    setEditId(null);
    setNome("");
  }

  async function handleRemover(id) {
    setErro(null);
    try {
      const res = await fetch(`${API_MARCAS}/${id}`, { method: "DELETE" });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      await carregar();
    } catch (e) { setErro(`Erro ao remover: ${e.message}`); }
  }

  const filtered = itens.filter((i) =>
    (i.nome ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.secao}>
      <div className={styles.secaoHeader}>
        <span className={styles.secaoIcone}><IconBrand /></span>
        <div>
          <h2 className={styles.secaoTitulo}>Marcas</h2>
          <p className={styles.secaoSubtitulo}>Marcas dos equipamentos e produtos</p>
        </div>
      </div>
      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.cardTitle}><IconPlus /><span>{editId ? "Editar Marca" : "Adicionar Marca"}</span></div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome</label>
            <input className={styles.input} placeholder="Ex: Apple, Samsung..." value={nome}
              onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdicionar()} disabled={salvando} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className={styles.btnAdicionar} onClick={handleAdicionar} disabled={salvando || !nome.trim()} style={{ flex: 1 }}>
              <IconPlus /> {salvando ? "Salvando..." : editId ? "Atualizar" : "Adicionar"}
            </button>
            {editId && (
              <button className={styles.btnRemover} onClick={cancelarEdicao} disabled={salvando} style={{ padding: "0 15px", background: "#f1f5f9", color: "#64748b" }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}><IconTags /><span>Cadastradas ({itens.length})</span></div>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className={styles.searchInput} placeholder="Buscar marca..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <StatusBox loading={loading} erro={erro} onDismiss={() => setErro(null)} />
          {!loading && (
            <div className={styles.lista}>
              {filtered.length === 0 && <p className={styles.empty}>{search ? "Nenhum resultado." : "Nenhuma marca cadastrada."}</p>}
              {filtered.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemLeft}><span className={styles.itemNome}>{item.nome}</span></div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button className={styles.btnRemover} onClick={() => iniciarEdicao(item)} title="Editar" style={{ color: "#3b82f6", background: "#eff6ff" }}><IconEdit /></button>
                    <button className={styles.btnRemover} onClick={() => handleRemover(item.id)} title="Remover"><IconTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Seção Tipos de Serviço ───────────────────────────────────────────────────
function SecaoTiposServico() {
  const [itens,    setItens]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [nome,     setNome]     = useState("");
  const [valor,    setValor]    = useState("");
  const [search,   setSearch]   = useState("");
  const [editId,   setEditId]   = useState(null);

  async function carregar() {
    setLoading(true); setErro(null);
    try {
      const res  = await fetch(API_TIPOS_SV);
      const data = await res.json();
      setItens(Array.isArray(data) ? data : (data.value ?? []));
    } catch (e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(); }, []);

  async function handleAdicionar() {
    if (!nome.trim()) return;
    setSalvando(true); setErro(null);
    try {
      const url = editId ? `${API_TIPOS_SV}/${editId}` : API_TIPOS_SV;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), valor_padrao: Number(valor) || 0 }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setNome(""); setValor(""); setEditId(null);
      await carregar();
    } catch (e) { setErro(`Erro ao salvar: ${e.message}`); }
    finally { setSalvando(false); }
  }

  function iniciarEdicao(item) {
    setEditId(item.id);
    setNome(item.nome || "");
    setValor(item.valor_padrao || "");
  }

  function cancelarEdicao() {
    setEditId(null);
    setNome("");
    setValor("");
  }

  async function handleRemover(id) {
    setErro(null);
    try {
      const res = await fetch(`${API_TIPOS_SV}/${id}`, { method: "DELETE" });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      await carregar();
    } catch (e) { setErro(`Erro ao remover: ${e.message}`); }
  }

  const filtered = itens.filter((i) =>
    (i.nome ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.secao}>
      <div className={styles.secaoHeader}>
        <span className={styles.secaoIcone}><IconWrench /></span>
        <div>
          <h2 className={styles.secaoTitulo}>Tipos de Serviço</h2>
          <p className={styles.secaoSubtitulo}>Serviços com valor padrão usados nas ordens</p>
        </div>
      </div>
      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.cardTitle}><IconPlus /><span>{editId ? "Editar Tipo de Serviço" : "Adicionar Tipo de Serviço"}</span></div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome do Serviço</label>
            <input className={styles.input} placeholder="Ex: Formatação, Troca de Tela..." value={nome}
              onChange={(e) => setNome(e.target.value)} disabled={salvando} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Valor Padrão (R$)</label>
            <input className={styles.input} type="number" placeholder="0,00" value={valor}
              onChange={(e) => setValor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdicionar()} disabled={salvando} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className={styles.btnAdicionar} onClick={handleAdicionar} disabled={salvando || !nome.trim()} style={{ flex: 1 }}>
              <IconPlus /> {salvando ? "Salvando..." : editId ? "Atualizar" : "Adicionar"}
            </button>
            {editId && (
              <button className={styles.btnRemover} onClick={cancelarEdicao} disabled={salvando} style={{ padding: "0 15px", background: "#f1f5f9", color: "#64748b" }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}><IconWrench /><span>Cadastrados ({itens.length})</span></div>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className={styles.searchInput} placeholder="Buscar tipo de serviço..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <StatusBox loading={loading} erro={erro} onDismiss={() => setErro(null)} />
          {!loading && (
            <div className={styles.lista}>
              {filtered.length === 0 && <p className={styles.empty}>{search ? "Nenhum resultado." : "Nenhum tipo cadastrado."}</p>}
              {filtered.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemNome}>{item.nome}</span>
                    <span className={styles.valorBadge}>
                      {Number(item.valor_padrao) > 0 ? fmt(item.valor_padrao) : "Grátis"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button className={styles.btnRemover} onClick={() => iniciarEdicao(item)} title="Editar" style={{ color: "#3b82f6", background: "#eff6ff" }}><IconEdit /></button>
                    <button className={styles.btnRemover} onClick={() => handleRemover(item.id)} title="Remover"><IconTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Seção Tipos de Equipamento ──────────────────────────────────────────────
function SecaoTiposEquipamento() {
  const [itens,    setItens]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [nome,     setNome]     = useState("");
  const [search,   setSearch]   = useState("");
  const [editId,   setEditId]   = useState(null);

  async function carregar() {
    setLoading(true); setErro(null);
    try {
      const res  = await fetch("/api/tipo-equipamentos");
      const data = await res.json();
      setItens(Array.isArray(data) ? data : (data.value ?? []));
    } catch (e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(); }, []);

  async function handleAdicionar() {
    if (!nome.trim()) return;
    setSalvando(true); setErro(null);
    try {
      const url = editId ? `/api/tipo-equipamentos/${editId}` : "/api/tipo-equipamentos";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim() }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setNome(""); setEditId(null);
      await carregar();
    } catch (e) { setErro(`Erro ao salvar: ${e.message}`); }
    finally { setSalvando(false); }
  }

  function iniciarEdicao(item) {
    setEditId(item.id);
    setNome(item.nome || "");
  }

  function cancelarEdicao() {
    setEditId(null);
    setNome("");
  }

  async function handleRemover(id) {
    setErro(null);
    try {
      const res = await fetch(`/api/tipo-equipamentos/${id}`, { method: "DELETE" });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      await carregar();
    } catch (e) { setErro(`Erro ao remover: ${e.message}`); }
  }

  const filtered = itens.filter(i =>
    (i.nome ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.secao}>
      <div className={styles.secaoHeader}>
        <span className={styles.secaoIcone}><IconMonitor /></span>
        <div>
          <h2 className={styles.secaoTitulo}>Tipos de Equipamento</h2>
          <p className={styles.secaoSubtitulo}>Celular, notebook, desktop, impressora, etc.</p>
        </div>
      </div>
      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.cardTitle}><IconPlus /><span>{editId ? "Editar Tipo" : "Adicionar Tipo"}</span></div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome</label>
            <input className={styles.input} placeholder="Ex: Celular, Notebook..." value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdicionar()} disabled={salvando} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className={styles.btnAdicionar} onClick={handleAdicionar} disabled={salvando || !nome.trim()} style={{ flex: 1 }}>
              <IconPlus /> {salvando ? "Salvando..." : editId ? "Atualizar" : "Adicionar"}
            </button>
            {editId && (
              <button className={styles.btnRemover} onClick={cancelarEdicao} disabled={salvando} style={{ padding: "0 15px", background: "#f1f5f9", color: "#64748b" }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}><IconMonitor /><span>Cadastrados ({itens.length})</span></div>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className={styles.searchInput} placeholder="Buscar tipo..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <StatusBox loading={loading} erro={erro} onDismiss={() => setErro(null)} />
          {!loading && (
            <div className={styles.lista}>
              {filtered.length === 0 && <p className={styles.empty}>{search ? "Nenhum resultado." : "Nenhum tipo cadastrado."}</p>}
              {filtered.map(item => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemNome}>{item.nome}</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button className={styles.btnRemover} onClick={() => iniciarEdicao(item)} title="Editar" style={{ color: "#3b82f6", background: "#eff6ff" }}><IconEdit /></button>
                    <button className={styles.btnRemover} onClick={() => handleRemover(item.id)} title="Remover"><IconTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function Tabs({ sections }) {
  const [ativa, setAtiva] = useState(sections[0].key);
  const secaoAtiva = sections.find((s) => s.key === ativa);
  return (
    <div>
      <div className={styles.tabs}>
        {sections.map((s) => (
          <button key={s.key}
            className={`${styles.tab} ${ativa === s.key ? styles.tabActive : ""}`}
            onClick={() => setAtiva(s.key)}>
            {s.icone} {s.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{secaoAtiva?.content}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TagsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cadastros Auxiliares</h1>
        <p className={styles.subtitle}>Gerencie status, marcas e tipos usados no sistema</p>
      </div>

      <Tabs sections={[
        {
          key: "status", label: "Status", icone: <IconTagPlus />,
          content: <SecaoStatus />,
        },
        {
          key: "marcas", label: "Marcas", icone: <IconBrand />,
          content: <SecaoMarcas />,
        },
        {
          key: "tiposServico", label: "Tipos de Serviço", icone: <IconWrench />,
          content: <SecaoTiposServico />,
        },
        {
          key: "tiposEquipamento", label: "Tipos de Equipamento", icone: <IconMonitor />,
          content: <SecaoTiposEquipamento />,
        },
      ]} />
    </div>
  );
}
