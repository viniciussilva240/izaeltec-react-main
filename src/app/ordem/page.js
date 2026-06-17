"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

// ─── APIs ─────────────────────────────────────────────────────────────────────
const API_ORDENS       = "/api/ordens";
const API_CLIENTES     = "/api/clientes";
const API_EQUIP        = "/api/equipamentos";
const API_TECNICOS     = "/api/tecnicos";
const API_STATUS       = "/api/status-servico";
const API_TIPO_SERVICO = "/api/tipo-servicos";
const API_PRODUTOS     = "/api/produtos";

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
function fmtData(d) { return d ? new Date(d).toLocaleDateString("pt-BR") : "—"; }
function toInputDate(d) { return d ? String(d).slice(0, 10) : ""; }

// ─── Form vazio ───────────────────────────────────────────────────────────────
const emptyForm = {
  equipamentoId: "", statusId: "", tecnicoId: "",
  dataEntrada: "", relatoCliente: "", diagnosticoTecnico: "",
  servicoRealizado: "", observacoes: "",
  servicos: [],   // [{ tipoServicoId }]
  produtos: [],   // [{ produtoId, qtd }]
  valorManual: "",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconPlus    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={15} height={15}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSearch  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconFilter  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={16} height={16}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconEye     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconBack    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><polyline points="15 18 9 12 15 6"/></svg>;
const IconUser    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconTrash   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={14} height={14}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconRefresh = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={15} height={15}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IconCheck   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={15} height={15}><polyline points="20 6 9 17 4 12"/></svg>;
const IconSort    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={14} height={14}><path d="M3 6h18M7 12h10M11 18h2"/></svg>;

// ─── Cores de status ──────────────────────────────────────────────────────────
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

// ─── Modal Novo Cliente ───────────────────────────────────────────────────────
function ModalNovoCliente({ onSalvar, onFechar }) {
  const [nome, setNome]         = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]         = useState("");

  async function handleSalvar() {
    if (!nome.trim()) return;
    setSalvando(true); setErro("");
    try {
      const res = await fetch(API_CLIENTES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_completo: nome.trim(), telefone: telefone.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || `HTTP ${res.status}`);
      onSalvar(data);
    } catch (e) { setErro(e.message || "Erro ao cadastrar cliente."); }
    finally { setSalvando(false); }
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000,padding:16 }} onClick={onFechar}>
      <div style={{ background:"#fff",borderRadius:14,width:"100%",maxWidth:360,boxShadow:"0 8px 32px rgba(0,0,0,.18)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px 0" }}>
          <span style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Cadastrar cliente</span>
          <button onClick={onFechar} style={{ background:"none",border:"none",cursor:"pointer",color:"#64748b",padding:4 }}><IconX /></button>
        </div>
        <div style={{ padding:"16px 20px",display:"flex",flexDirection:"column",gap:12 }}>
          {erro && <div style={{ background:"#fff0f3",color:"#b1002f",borderRadius:8,padding:"8px 12px",fontSize:13 }}>{erro}</div>}
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <label style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Nome <span style={{ color:"#b1002f" }}>*</span></label>
            <input autoFocus style={{ padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,outline:"none",fontFamily:"DM Sans,sans-serif" }}
              value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome completo" disabled={salvando} />
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <label style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Telefone</label>
            <input style={{ padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,outline:"none",fontFamily:"DM Sans,sans-serif" }}
              value={telefone} onChange={e=>setTelefone(e.target.value)} placeholder="(00) 00000-0000" disabled={salvando} />
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:8,padding:"12px 20px",borderTop:"1px solid #f1f5f9" }}>
          <button onClick={onFechar} disabled={salvando} style={{ padding:"8px 16px",background:"#f1f5f9",color:"#475569",border:"none",borderRadius:8,fontSize:14,cursor:"pointer" }}>Cancelar</button>
          <button onClick={handleSalvar} disabled={salvando||!nome.trim()} style={{ padding:"8px 16px",background:"linear-gradient(180deg,#b1002f,#c2006f)",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",opacity:salvando||!nome.trim()?0.6:1 }}>
            {salvando ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Novo Equipamento ───────────────────────────────────────────────────
function ModalNovoEquipamento({ clientes, onSalvar, onFechar, onNovoCliente }) {
  const [modelo, setModelo]             = useState("");
  const [clienteId, setClienteId]       = useState("");
  const [tipoEquipId, setTipoEquipId]   = useState("");
  const [marcaId, setMarcaId]           = useState("");
  const [tiposEquip, setTiposEquip]     = useState([]);
  const [marcas, setMarcas]             = useState([]);
  const [salvando, setSalvando]         = useState(false);
  const [erro, setErro]                 = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/tipo-equipamentos").then(r => r.json()),
      fetch("/api/marcas").then(r => r.json()),
    ]).then(([dataT, dataM]) => {
      const norm = d => Array.isArray(d) ? d : (d?.value ?? []);
      setTiposEquip(norm(dataT).map(t => ({ id: t.id, nome: t.nome ?? `Tipo #${t.id}` })));
      setMarcas(norm(dataM).map(m => ({ id: m.id, nome: m.nome ?? `Marca #${m.id}` })));
    }).catch(() => {});
  }, []);

  async function handleSalvar() {
    if (!modelo.trim() || !clienteId || !tipoEquipId || !marcaId) return;
    setSalvando(true); setErro("");
    try {
      const res = await fetch(API_EQUIP, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          modelo:               modelo.trim(),
          cliente_id:           Number(clienteId),
          tipo_equipamento_id:  Number(tipoEquipId),
          marca_id:             Number(marcaId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || data?.message || `HTTP ${res.status}`);
      onSalvar(data);
    } catch (e) { setErro(e.message || "Erro ao cadastrar equipamento."); }
    finally { setSalvando(false); }
  }

  const sel = s => ({ padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,outline:"none",fontFamily:"DM Sans,sans-serif",background:"#fff" });

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000,padding:16 }} onClick={onFechar}>
      <div style={{ background:"#fff",borderRadius:14,width:"100%",maxWidth:420,boxShadow:"0 8px 32px rgba(0,0,0,.18)",maxHeight:"90vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px 0" }}>
          <span style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Cadastrar equipamento</span>
          <button onClick={onFechar} style={{ background:"none",border:"none",cursor:"pointer",color:"#64748b",padding:4 }}><IconX /></button>
        </div>
        <div style={{ padding:"16px 20px",display:"flex",flexDirection:"column",gap:12 }}>
          {erro && <div style={{ background:"#fff0f3",color:"#b1002f",borderRadius:8,padding:"8px 12px",fontSize:13 }}>{erro}</div>}

          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <label style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Modelo <span style={{ color:"#b1002f" }}>*</span></label>
            <input autoFocus style={sel()} value={modelo} onChange={e=>setModelo(e.target.value)} placeholder="Ex: Samsung Galaxy S21" disabled={salvando} />
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <label style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Tipo de Equipamento <span style={{ color:"#b1002f" }}>*</span></label>
            <select style={sel()} value={tipoEquipId} onChange={e=>setTipoEquipId(e.target.value)} disabled={salvando}>
              <option value="">Selecione o tipo</option>
              {tiposEquip.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <label style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Marca <span style={{ color:"#b1002f" }}>*</span></label>
            <select style={sel()} value={marcaId} onChange={e=>setMarcaId(e.target.value)} disabled={salvando}>
              <option value="">Selecione a marca</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <label style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Cliente <span style={{ color:"#b1002f" }}>*</span></label>
            <select style={sel()} value={clienteId} onChange={e=>setClienteId(e.target.value)} disabled={salvando}>
              <option value="">Selecione o cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}{c.telefone?` — ${c.telefone}`:""}</option>)}
            </select>
            <button type="button" onClick={onNovoCliente} style={{ display:"flex",alignItems:"center",gap:5,marginTop:2,padding:"5px 10px",background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",width:"fit-content" }}>
              <IconPlus /> Novo cliente
            </button>
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:8,padding:"12px 20px",borderTop:"1px solid #f1f5f9" }}>
          <button onClick={onFechar} disabled={salvando} style={{ padding:"8px 16px",background:"#f1f5f9",color:"#475569",border:"none",borderRadius:8,fontSize:14,cursor:"pointer" }}>Cancelar</button>
          <button onClick={handleSalvar} disabled={salvando||!modelo.trim()||!clienteId||!tipoEquipId||!marcaId}
            style={{ padding:"8px 16px",background:"linear-gradient(180deg,#b1002f,#c2006f)",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",opacity:(salvando||!modelo.trim()||!clienteId||!tipoEquipId||!marcaId)?0.6:1 }}>
            {salvando ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Seletor de Serviços com valor ───────────────────────────────────────────
function ServicosSelector({ tiposServico, value, onChange }) {
  // value = [{ tipoServicoId }]
  const [search, setSearch] = useState("");

  const filtered = tiposServico.filter(t =>
    t.nome.toLowerCase().includes(search.toLowerCase())
  );

  function toggleServico(id) {
    const exists = value.find(v => v.tipoServicoId === id);
    if (exists) onChange(value.filter(v => v.tipoServicoId !== id));
    else        onChange([...value, { tipoServicoId: id }]);
  }

  const totalServicos = value.reduce((sum, v) => {
    const t = tiposServico.find(t => t.id === v.tipoServicoId);
    return sum + (t ? Number(t.valor_padrao ?? 0) : 0);
  }, 0);

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
        <span style={{ fontSize:13,fontWeight:500,color:"#475569" }}>Serviços realizados</span>
        {totalServicos > 0 && <span style={{ fontSize:13,fontWeight:700,color:"#b1002f" }}>{fmt(totalServicos)}</span>}
      </div>
      <div className={styles.searchInline}>
        <IconSearch /><input className={styles.searchInlineInput} placeholder="Buscar serviço..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <div style={{ maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:4 }}>
        {filtered.length === 0 && <div style={{ color:"#94a3b8",fontSize:13,padding:"8px 0" }}>Nenhum serviço encontrado.</div>}
        {filtered.map(t => {
          const sel = value.find(v => v.tipoServicoId === t.id);
          return (
            <div key={t.id}
              style={{ display:"flex",alignItems:"center",gap:8,background:sel?"#fff0f3":"#f8fafc",border:`1.5px solid ${sel?"#b1002f":"#e2e8f0"}`,borderRadius:8,padding:"7px 10px",cursor:"pointer",transition:"all .15s" }}
              onClick={()=>toggleServico(t.id)}>
              <div style={{ width:16,height:16,borderRadius:4,border:`2px solid ${sel?"#b1002f":"#cbd5e1"}`,background:sel?"#b1002f":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                {sel && <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} width={10} height={10}><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{ flex:1,fontSize:13,fontWeight:500,color:"#0f172a" }}>{t.nome}</span>
              <span style={{ fontSize:12,color:"#64748b" }}>{Number(t.valor_padrao) > 0 ? fmt(t.valor_padrao) : "Grátis"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Seletor de Produtos com Quantidade ───────────────────────────────────────
function ProdutosSelector({ produtos, value, onChange }) {
  // value = [{ produtoId, qtd }]
  const [search, setSearch] = useState("");

  const filtered = produtos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  function toggleProduto(produtoId) {
    const p = produtos.find(x => x.id === produtoId);
    if (!p) return;
    const exists = value.find(v => v.produtoId === produtoId);
    if (exists) {
      onChange(value.filter(v => v.produtoId !== produtoId));
    } else {
      if (p.estoque_livre <= 0) {
        alert("Erro: você não pode selecionar um produto que está sem estoque.");
        return;
      }
      onChange([...value, { produtoId, qtd: 1 }]);
    }
  }

  function setQtd(produtoId, qtd) {
    const p = produtos.find(x => x.id === produtoId);
    if (!p) return;
    let n = Math.max(1, Number(qtd) || 1);
    if (n > p.estoque_livre) {
      alert(`Erro: você não pode selecionar mais unidades que temos no estoque (Máx: ${p.estoque_livre}).`);
      n = p.estoque_livre;
    }
    onChange(value.map(v => v.produtoId === produtoId ? { ...v, qtd: n } : v));
  }

  const totalProdutos = value.reduce((sum, v) => {
    const p = produtos.find(p => p.id === v.produtoId);
    return sum + (p ? p.preco * v.qtd : 0);
  }, 0);

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
        <span style={{ fontSize:13,fontWeight:500,color:"#475569" }}>Produtos usados</span>
        {totalProdutos > 0 && <span style={{ fontSize:13,fontWeight:700,color:"#b1002f" }}>{fmt(totalProdutos)}</span>}
      </div>
      <div className={styles.searchInline}>
        <IconSearch /><input className={styles.searchInlineInput} placeholder="Buscar produto..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <div style={{ maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:4 }}>
        {filtered.length === 0 && <div style={{ color:"#94a3b8",fontSize:13,padding:"8px 0" }}>Nenhum produto encontrado.</div>}
        {filtered.map(p => {
          const sel = value.find(v => v.produtoId === p.id);
          const outOfStock = Number(p.estoque_livre) <= 0;
          return (
            <div key={p.id} style={{ display:"flex",alignItems:"center",gap:8,background:sel?"#fff0f3":"#f8fafc",border:`1.5px solid ${sel?"#b1002f":"#e2e8f0"}`,borderRadius:8,padding:"7px 10px",cursor:outOfStock?"not-allowed":"pointer",transition:"all .15s",opacity:outOfStock?0.6:1 }}
              onClick={()=>{ if(!outOfStock) toggleProduto(p.id) }}>
              <div style={{ width:16,height:16,borderRadius:4,border:`2px solid ${sel?"#b1002f":"#cbd5e1"}`,background:sel?"#b1002f":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                {sel && <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} width={10} height={10}><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div style={{ flex:1,display:"flex",flexDirection:"column",gap:2 }}>
                <span style={{ fontSize:13,fontWeight:500,color:"#0f172a" }}>{p.nome}</span>
                <span style={{ fontSize:11,fontWeight:600,color:outOfStock?"#b1002f":"#166534" }}>Estoque Livre: {Number(p.estoque_livre)} unid.</span>
              </div>
              <span style={{ fontSize:12,color:"#64748b" }}>{fmt(p.preco)}</span>
              {sel && (
                <div style={{ display:"flex",alignItems:"center",gap:4 }} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>setQtd(p.id,sel.qtd-1)} style={{ width:22,height:22,borderRadius:4,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:"#475569" }}>−</button>
                  <input type="number" min={1} max={Number(p.estoque_livre)} value={sel.qtd} onChange={e=>setQtd(p.id,e.target.value)}
                    style={{ width:36,textAlign:"center",border:"1px solid #e2e8f0",borderRadius:4,fontSize:13,padding:"2px 0",fontFamily:"DM Sans,sans-serif" }} onClick={e=>e.stopPropagation()} />
                  <button onClick={()=>setQtd(p.id,sel.qtd+1)} style={{ width:22,height:22,borderRadius:4,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:"#475569" }}>+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Busca de Equipamento com filtro ─────────────────────────────────────────
function EquipamentoSearch({ equipamentos, value, onChange }) {
  const [query, setQuery]   = useState("");
  const [open,  setOpen]    = useState(false);
  const ref = React.useRef(null);

  const selecionado = equipamentos.find(e => e.id === Number(value));

  const filtrados = equipamentos.filter(e =>
    e.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 50);

  // Fecha ao clicar fora
  useEffect(() => {
    function handler(ev) {
      if (ref.current && !ref.current.contains(ev.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selecionar(id) {
    onChange(String(id));
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div
        className={styles.input}
        style={{ display:"flex",alignItems:"center",gap:6,cursor:"pointer",paddingRight:10 }}
        onClick={() => { setOpen(o => !o); setQuery(""); }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} width={14} height={14}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span style={{ flex:1,fontSize:14,color:selecionado?"#334155":"#94a3b8" }}>
          {selecionado ? selecionado.label : "Buscar equipamento..."}
        </span>
        {selecionado && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(""); setOpen(false); }}
            style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8",padding:0,lineHeight:1 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>
      {open && (
        <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,.12)",zIndex:200,overflow:"hidden" }}>
          <div style={{ padding:"8px 10px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} width={14} height={14}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              autoFocus
              style={{ border:"none",outline:"none",fontSize:13,flex:1,fontFamily:"DM Sans,sans-serif",color:"#334155" }}
              placeholder="Digite para filtrar..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div style={{ maxHeight:200,overflowY:"auto" }}>
            {filtrados.length === 0 && (
              <div style={{ padding:"12px 14px",fontSize:13,color:"#94a3b8" }}>Nenhum equipamento encontrado.</div>
            )}
            {filtrados.map(e => (
              <div key={e.id}
                style={{ padding:"9px 14px",fontSize:13,color:"#334155",cursor:"pointer",background:Number(value)===e.id?"#fff0f3":"#fff",fontWeight:Number(value)===e.id?600:400 }}
                onMouseEnter={ev=>ev.currentTarget.style.background=Number(value)===e.id?"#fff0f3":"#f8fafc"}
                onMouseLeave={ev=>ev.currentTarget.style.background=Number(value)===e.id?"#fff0f3":"#fff"}
                onClick={()=>selecionar(e.id)}
              >
                {e.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Formulário de Ordem ──────────────────────────────────────────────────────
function OrdemForm({ form, setForm, equipamentos, clientes, tecnicos, statusList, tiposServico, produtos, onNovoEquipamento }) {
  const equip = equipamentos.find(e => e.id === Number(form.equipamentoId));
  const clienteAutoNome = equip ? (clientes.find(c => c.id === equip.clienteId)?.nome ?? `Cliente #${equip.clienteId}`) : null;

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Valor total = serviços + produtos + valor manual
  const totalServicos = form.servicos.reduce((sum, v) => {
    const t = tiposServico.find(t => t.id === v.tipoServicoId);
    return sum + (t ? Number(t.valor_padrao ?? 0) : 0);
  }, 0);
  const totalProdutos = form.produtos.reduce((sum, v) => {
    const p = produtos.find(p => p.id === v.produtoId);
    return sum + (p ? p.preco * v.qtd : 0);
  }, 0);
  const totalManual = Number(form.valorManual) || 0;
  const totalGeral = totalServicos + totalProdutos + totalManual;

  return (
    <>
      {/* Equipamento */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Equipamento <span className={styles.required}>*</span></label>
        <EquipamentoSearch
          equipamentos={equipamentos}
          value={form.equipamentoId}
          onChange={id => setForm(prev => ({ ...prev, equipamentoId: id }))}
        />
        <button type="button" className={styles.btnNovoCliente} style={{ background:"#eff6ff",color:"#1d4ed8",borderColor:"#bfdbfe" }} onClick={onNovoEquipamento}>
          <IconPlus /> Cadastrar novo equipamento
        </button>
      </div>

      {/* Cliente auto-detectado */}
      {clienteAutoNome && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Cliente (dono do equipamento)</label>
          <div className={styles.input} style={{ background:"#f8fafc",color:"#64748b",display:"flex",alignItems:"center",gap:6 }}>
            <IconUser />{clienteAutoNome}
          </div>
        </div>
      )}

      {/* Serviços realizados */}
      <div className={styles.formGroup}>
        <ServicosSelector
          tiposServico={tiposServico}
          value={form.servicos}
          onChange={servicos => setForm(prev => ({ ...prev, servicos }))}
        />
      </div>

      {/* Status e Técnico */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Status <span className={styles.required}>*</span></label>
          <select name="statusId" value={form.statusId} onChange={handleChange} className={styles.input}>
            <option value="">Selecione o status</option>
            {statusList.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Técnico Responsável</label>
          <select name="tecnicoId" value={form.tecnicoId} onChange={handleChange} className={styles.input}>
            <option value="">Sem técnico</option>
            {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Data de Entrada */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Data de Entrada <span className={styles.required}>*</span></label>
        <input name="dataEntrada" type="date" value={form.dataEntrada} max={new Date().toISOString().split("T")[0]} onChange={handleChange} className={styles.input} />
      </div>

      {/* Relato */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Relato do Cliente <span className={styles.required}>*</span></label>
        <textarea name="relatoCliente" value={form.relatoCliente} onChange={handleChange} placeholder="Descreva o problema" className={styles.textarea} rows={3} />
      </div>

      {/* Diagnóstico */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Diagnóstico Técnico</label>
        <textarea name="diagnosticoTecnico" value={form.diagnosticoTecnico} onChange={handleChange} placeholder="Diagnóstico do técnico" className={styles.textarea} rows={2} />
      </div>

      {/* Serviço Realizado */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Serviço Realizado</label>
        <textarea name="servicoRealizado" value={form.servicoRealizado} onChange={handleChange} placeholder="Serviço executado" className={styles.textarea} rows={2} />
      </div>

      {/* Observações */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Observações</label>
        <input name="observacoes" value={form.observacoes} onChange={handleChange} placeholder="Observações gerais" className={styles.input} />
      </div>

      {/* Produtos */}
      <div className={styles.formGroup}>
        <ProdutosSelector produtos={produtos} value={form.produtos} onChange={prods => setForm(prev => ({ ...prev, produtos: prods }))} />
      </div>

      {/* Valor manual */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Valor de Mão de Obra (R$)</label>
          <input name="valorManual" type="number" step="0.01" min="0" value={form.valorManual} onChange={handleChange} placeholder="0,00" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Valor Total Calculado</label>
          <div className={styles.input} style={{ background:"#f8fafc",fontWeight:700,color:"#b1002f" }}>{fmt(totalGeral)}</div>
        </div>
      </div>
    </>
  );
}

// ─── Modal Confirmação ────────────────────────────────────────────────────────
function ModalConfirmar({ titulo, mensagem, onConfirmar, onCancelar, loading, cor = "#b1002f" }) {
  return (
    <div className={styles.modalOverlay} onClick={!loading ? onCancelar : undefined}>
      <div className={styles.modal} style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{titulo}</h2>
          <button className={styles.btnBack} onClick={onCancelar} disabled={loading}><IconX /></button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ margin:0,fontSize:14,color:"#475569",lineHeight:1.6 }}>{mensagem}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancelar} onClick={onCancelar} disabled={loading}>Cancelar</button>
          <button style={{ background:cor,color:"#fff",border:"none",borderRadius:8,padding:"9px 24px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"DM Sans,sans-serif",opacity:loading?0.6:1,display:"flex",alignItems:"center",gap:6 }}
            onClick={onConfirmar} disabled={loading}>
            {loading ? "Aguarde..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Principal ───────────────────────────────────────────────────────────
export default function OrdensPage() {
  const [ordens,       setOrdens]       = useState([]);
  const [clientes,     setClientes]     = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [tecnicos,     setTecnicos]     = useState([]);
  const [statusList,   setStatusList]   = useState([]);
  const [tiposServico, setTiposServico] = useState([]);
  const [produtos,     setProdutos]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [erro,         setErro]         = useState(null);

  // Filtros
  const [search,       setSearch]       = useState("");
  const [filtroStatus, setFiltroStatus] = useState("abertos"); // padrão: somente abertas
  const [sortDir,      setSortDir]      = useState("asc");     // asc = mais antigas primeiro

  // Modais
  const [showCreate,         setShowCreate]         = useState(false);
  const [createForm,         setCreateForm]         = useState(emptyForm);
  const [criando,            setCriando]            = useState(false);
  const [detalhe,            setDetalhe]            = useState(null);
  const [showEdit,           setShowEdit]           = useState(false);
  const [editForm,           setEditForm]           = useState(null);
  const [editando,           setEditando]           = useState(false);
  const [showDelete,         setShowDelete]         = useState(false);
  const [deleteTarget,       setDeleteTarget]       = useState(null);
  const [deletando,          setDeletando]          = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [finalizando,        setFinalizando]        = useState(false);
  const [showNovoCliente,    setShowNovoCliente]    = useState(false);
  const [showNovoEquip,      setShowNovoEquip]      = useState(false);
  // para saber qual modal de equip está aberto (create ou edit)
  const [novoEquipCtx,       setNovoEquipCtx]       = useState("create");
  // sub-modal: novo cliente dentro do modal de novo equip
  const [showNovoClienteEquip, setShowNovoClienteEquip] = useState(false);

  // ── Carregar ─────────────────────────────────────────────────────────────────
  const carregarTudo = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const [resO, resC, resE, resT, resS, resTipos, resP] = await Promise.all([
        fetch(API_ORDENS), fetch(API_CLIENTES), fetch(API_EQUIP),
        fetch(API_TECNICOS), fetch(API_STATUS), fetch(API_TIPO_SERVICO), fetch(API_PRODUTOS),
      ]);
      const [dataO, dataC, dataE, dataT, dataS, dataTipos, dataP] = await Promise.all([
        resO.json(), resC.json(), resE.json(), resT.json(), resS.json(), resTipos.json(), resP.json(),
      ]);

      const norm = (d, arr) => Array.isArray(d) ? d : (d?.[arr] ?? d?.value ?? []);

      const listaC = norm(dataC, "clientes").map(c => ({
        id:       c.id,
        nome:     c.nome_completo ?? c.nome ?? `Cliente #${c.id}`,
        telefone: c.telefone ?? "",
      }));
      const listaE = norm(dataE, "equipamentos").map(e => ({
        id:       e.id,
        label:    `${e.modelo ?? "Equipamento"} #${e.id}`,
        clienteId: e.cliente_id,
      }));
      const listaT = norm(dataT, "tecnicos").map(t => ({
        id:   t.id,
        nome: t.nome ?? `Técnico #${t.id}`,
      }));
      const CORES = [
        "#b1002f","#1d4ed8","#166534","#854d0e","#6b21a8","#9a3412","#0c4a6e","#86198f"
      ];
      const listaS = norm(dataS, "statusServico").map(s => {
        let corIndex = s.corIndex ?? 0;
        if (s.cor && corIndex === 0) {
          const idx = CORES.findIndex(c => c === s.cor);
          if (idx !== -1) corIndex = idx;
        }
        return { id: s.id, nome: s.nome ?? `Status #${s.id}`, corIndex };
      });
      const listaTipos = norm(dataTipos, "tiposServico").map(t => ({
        id:          t.id,
        nome:        t.nome ?? `Tipo #${t.id}`,
        valor_padrao: Number(t.valor_padrao ?? 0),
      }));
      const listaP = norm(dataP, "produtos").map(p => ({
        id:    p.id,
        nome:  p.nome ?? `Produto #${p.id}`,
        preco: Number(p.preco ?? 0),
      }));
      const listaO = norm(dataO, "ordensServico");

      setClientes(listaC);
      setEquipamentos(listaE);
      setTecnicos(listaT);
      setStatusList(listaS);
      setTiposServico(listaTipos);
      setProdutos(listaP);
      setOrdens(listaO);
    } catch (e) {
      setErro(`Erro ao carregar dados: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  async function recarregarClientes() {
    const res = await fetch(API_CLIENTES);
    const data = await res.json();
    const norm = d => Array.isArray(d) ? d : (d?.value ?? []);
    setClientes(norm(data).map(c => ({
      id:       c.id,
      nome:     c.nome_completo ?? c.nome ?? `Cliente #${c.id}`,
      telefone: c.telefone ?? "",
    })));
  }

  async function recarregarEquipamentos() {
    const res = await fetch(API_EQUIP);
    const data = await res.json();
    const norm = d => Array.isArray(d) ? d : (d?.value ?? []);
    setEquipamentos(norm(data).map(e => ({
      id:        e.id,
      label:     `${e.modelo ?? "Equipamento"} #${e.id}`,
      clienteId: e.cliente_id,
    })));
  }

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getNome    = id => clientes.find(c => c.id === Number(id))?.nome ?? `Cliente #${id}`;
  const getEquip   = id => equipamentos.find(e => e.id === Number(id))?.label ?? `Equip. #${id}`;
  const getTecnico = id => tecnicos.find(t => t.id === Number(id))?.nome ?? "—";
  const getStatus  = id => statusList.find(s => s.id === Number(id));

  // Cliente a partir do equipamento
  const getClienteDoEquip = id => {
    const eq = equipamentos.find(e => e.id === Number(id));
    return eq ? (clientes.find(c => c.id === eq.clienteId)?.nome ?? `Cliente #${eq.clienteId}`) : "—";
  };

  const isConcluida = o => {
    if (o.concluida || !!o.data_conclusao) return true;
    const s = getStatus(o.status_id);
    if (!s) return false;
    const n = s.nome.toLowerCase();
    return n.includes("finaliz") || n.includes("conclu") || n.includes("entregue");
  };

  const isAberta = o => !isConcluida(o);

  const filtered = ordens
    .filter(o => {
      const cliente = o.cliente || getClienteDoEquip(o.equipamento_id);
      const equip   = o.equipamento || getEquip(o.equipamento_id);
      const matchSearch = `${cliente} ${equip} ${o.descricao_problema ?? ""}`.toLowerCase().includes(search.toLowerCase());
      const statusAtual = getStatus(o.status_id);
      if (filtroStatus === "abertos") return matchSearch && isAberta(o);
      if (filtroStatus === "finalizadas") return matchSearch && isConcluida(o);
      if (filtroStatus === "Todos")   return matchSearch;
      return matchSearch && statusAtual?.nome === filtroStatus;
    })
    .sort((a, b) => {
      const da = new Date(a.data_entrada ?? 0).getTime();
      const db = new Date(b.data_entrada ?? 0).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });

  function calcValorTotal(form) {
    const totalServicos = form.servicos.reduce((sum, v) => {
      const t = tiposServico.find(t => t.id === v.tipoServicoId);
      return sum + (t ? Number(t.valor_padrao ?? 0) : 0);
    }, 0);
    const prodTotal = form.produtos.reduce((sum, v) => {
      const p = produtos.find(p => p.id === v.produtoId);
      return sum + (p ? p.preco * v.qtd : 0);
    }, 0);
    return totalServicos + prodTotal + (Number(form.valorManual) || 0);
  }

  function buildBody(form) {
    return {
      equipamento_id:     form.equipamentoId ? Number(form.equipamentoId) : null,
      status_id:          form.statusId      ? Number(form.statusId)      : null,
      tecnico_id:         form.tecnicoId     ? Number(form.tecnicoId)     : null,
      data_entrada:       form.dataEntrada   || null,
      descricao_problema: form.relatoCliente || null,
      diagnostico:        form.diagnosticoTecnico || null,
      valor_manual:       form.valorManual !== "" ? Number(form.valorManual) : null,
      servicos:           form.servicos.map(v => ({ tipo_servico_id: v.tipoServicoId })),
      produtos:           form.produtos.map(v => ({ produto_id: v.produtoId, quantidade: v.qtd })),
    };
  }

  // ── Criar ─────────────────────────────────────────────────────────────────────
  async function handleCriar() {
    if (!createForm.equipamentoId || !createForm.statusId || !createForm.dataEntrada || !createForm.relatoCliente.trim() || createForm.valorManual === "") return;
    setCriando(true); setErro(null);
    try {
      const res = await fetch(API_ORDENS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(createForm)),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowCreate(false); setCreateForm(emptyForm);
      await carregarTudo();
    } catch (e) { setErro(`Erro ao criar OS: ${e.message}`); }
    finally { setCriando(false); }
  }

  // ── Atualizar ─────────────────────────────────────────────────────────────────
  async function handleAtualizar() {
    if (!editForm.equipamentoId || !editForm.statusId || !editForm.dataEntrada || !editForm.relatoCliente.trim() || editForm.valorManual === "") return;
    setEditando(true); setErro(null);
    try {
      const res = await fetch(`${API_ORDENS}/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(editForm)),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.erro || data?.message || `HTTP ${res.status}`);
      }
      setShowEdit(false); setDetalhe(null); setEditForm(null);
      await carregarTudo();
    } catch (e) { setErro(`Erro ao atualizar OS: ${e.message}`); }
    finally { setEditando(false); }
  }

  // ── Finalizar OS — usa endpoint /concluir ────────────────────────────────────
  async function handleFinalizar() {
    // funciona tanto a partir do detalhe quanto do editForm
    const id = editForm?.id ?? detalhe?.id;
    if (!id) return;
    setFinalizando(true); setErro(null);
    try {
      const res = await fetch(`${API_ORDENS}/${id}/concluir`, {
        method: "POST",
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowFinalizarModal(false);
      setShowEdit(false);
      setDetalhe(null);
      setEditForm(null);
      await carregarTudo();
    } catch (e) { setErro(`Erro ao finalizar OS: ${e.message}`); }
    finally { setFinalizando(false); }
  }

  // ── Deletar ───────────────────────────────────────────────────────────────────
  async function handleDeletar() {
    setDeletando(true); setErro(null);
    try {
      const res = await fetch(`${API_ORDENS}/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowDelete(false); setDeleteTarget(null); setDetalhe(null);
      await carregarTudo();
    } catch (e) { setErro(`Erro ao excluir OS: ${e.message}`); setShowDelete(false); }
    finally { setDeletando(false); }
  }

  async function abrirEdicao(o) {
    try {
      const [resS, resP] = await Promise.all([
        fetch(`${API_ORDENS}/${o.id}/servicos`),
        fetch(`${API_ORDENS}/${o.id}/produtos`)
      ]);
      const servicos = resS.ok ? await resS.json() : [];
      const produtos = resP.ok ? await resP.json() : [];

      setEditForm({
        id:                 o.id,
        equipamentoId:      String(o.equipamento_id ?? ""),
        tecnicoId:          String(o.tecnico_id     ?? ""),
        statusId:           String(o.status_id      ?? ""),
        dataEntrada:        toInputDate(o.data_entrada),
        relatoCliente:      o.descricao_problema    ?? "",
        diagnosticoTecnico: o.diagnostico           ?? "",
        servicoRealizado:   "",
        observacoes:        "",
        servicos:           servicos.map(s => ({ tipoServicoId: s.tipo_servico_id })),
        produtos:           produtos.map(p => ({ produtoId: p.produto_id, qtd: p.quantidade })),
        valorManual:        String(o.valor_manual   ?? ""),
      });
      setShowEdit(true);
    } catch (e) {
      setErro("Erro ao carregar detalhes da OS para edição.");
    }
  }

  function gerarPDF(o) {
    const eqId    = o.Equipamentos_idEquipamentos ?? o.equipamento_id;
    const nome    = getClienteDoEquip(eqId);
    const equip   = getEquip(eqId);
    const tecnico = getTecnico(o.Tecnicos_idTecnicos ?? o.tecnico_id);
    const status  = getStatus(o.StatusServico_idStatusServico ?? o.status_id)?.nome ?? "—";
    const html = `<html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;padding:32px;color:#0f172a}h1{font-size:22px}.sub{color:#64748b;font-size:13px;margin-bottom:24px}.section{margin-bottom:20px}.section h2{font-size:12px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}.field label{font-size:11px;color:#94a3b8;display:block}.field span{font-size:14px;font-weight:600}.desc{font-size:14px;color:#334155;line-height:1.6}.total{font-size:16px;font-weight:700;color:#b1002f;text-align:right;margin-top:16px}</style></head><body>
    <h1>Ordem de Serviço #${String(o.idServicos??o.id).padStart(5,"0")}</h1>
    <p class="sub">IzaelTec — Assistência Técnica</p>
    <div class="section"><h2>Informações Gerais</h2><div class="grid">
      <div class="field"><label>Cliente</label><span>${nome}</span></div>
      <div class="field"><label>Equipamento</label><span>${equip}</span></div>
      <div class="field"><label>Técnico</label><span>${tecnico}</span></div>
      <div class="field"><label>Status</label><span>${status}</span></div>
      <div class="field"><label>Data de Entrada</label><span>${fmtData(o.dataEntradaServicos??o.data_entrada)}</span></div>
      <div class="field"><label>Data de Finalização</label><span>${fmtData(o.dataFinalizacaoServicos??o.data_conclusao)}</span></div>
    </div></div>
    ${(o.relatoClienteServicos??o.descricao_problema)?`<div class="section"><h2>Relato do Cliente</h2><p class="desc">${o.relatoClienteServicos??o.descricao_problema}</p></div>`:""}
    ${(o.diagnosticoTecnicoServicos??o.diagnostico)?`<div class="section"><h2>Diagnóstico Técnico</h2><p class="desc">${o.diagnosticoTecnicoServicos??o.diagnostico}</p></div>`:""}
    <div class="total">Valor: ${fmt(o.valorAlternativoOrdemServicos??o.valor_total)}</div>
    </body></html>`;
    const win = window.open("", "_blank");
    win.document.write(html); win.document.close(); win.focus();
    setTimeout(() => win.print(), 400);
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ordens de Serviço</h1>
          <p className={styles.subtitle}>Gerencie as ordens de serviço</p>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <button className={styles.btnRecarregar} onClick={carregarTudo} disabled={loading} title="Recarregar"><IconRefresh /></button>
          <button className={styles.btnNova} onClick={() => { setCreateForm(emptyForm); setShowCreate(true); }}>
            <IconPlus /> Nova OS
          </button>
        </div>
      </div>

      {erro && (
        <div className={styles.erroBox}>
          {erro}
          <button className={styles.btnErroFechar} onClick={() => setErro(null)}><IconX /></button>
        </div>
      )}

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <IconSearch />
          <input className={styles.searchInput} placeholder="Buscar por cliente, equipamento ou relato..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className={styles.selectWrapper}>
          <IconFilter />
          <select className={styles.select} value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)}>
            <option value="abertos">Somente abertas</option>
            <option value="finalizadas">Somente finalizadas</option>
            <option value="Todos">Todos os status</option>
            {statusList.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
          </select>
        </div>
        <button
          className={styles.btnRecarregar}
          style={{ width:"auto",padding:"0 14px",gap:6,display:"flex",alignItems:"center",fontSize:13,fontWeight:500,color:"#475569",whiteSpace:"nowrap" }}
          title={sortDir==="asc"?"Mais antigas primeiro":"Mais novas primeiro"}
          onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
        >
          <IconSort /> {sortDir === "asc" ? "Mais antigas" : "Mais novas"}
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingBox}><div className={styles.spinner} /><span>Carregando ordens...</span></div>
      ) : (
        <>
          {/* Tabela desktop */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>OS</th><th>Cliente</th><th>Equipamento</th><th>Técnico</th><th>Valor</th><th>Entrada</th><th>Status</th><th></th><th></th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={9} className={styles.empty}>Nenhuma ordem encontrada.</td></tr>}
                {filtered.map(o => {
                  const status = getStatus(o.status_id);
                  const concluida = !!o.data_conclusao || (()=>{
                    const n = status?.nome?.toLowerCase() ?? "";
                    return n.includes("finaliz") || n.includes("conclu") || n.includes("entregue");
                  })();
                  return (
                    <tr key={o.id} className={`${styles.tableRow} ${concluida ? styles.tableRowConcluida : ""}`}>
                      <td>
                        <span className={styles.osId}>#{String(o.id).padStart(5,"0")}</span>
                      </td>
                      <td>{o.cliente || getClienteDoEquip(o.equipamento_id)}</td>
                      <td>{o.equipamento || getEquip(o.equipamento_id)}</td>
                      <td>{o.tecnico_id ? <span className={styles.tecnicoBadge}><IconUser />{getTecnico(o.tecnico_id)}</span> : <span style={{color:"#cbd5e1"}}>—</span>}</td>
                      <td className={styles.valor}>{fmt(o.valor_total ?? o.valor_manual)}</td>
                      <td style={{fontSize:13,color:"#64748b"}}>{fmtData(o.data_entrada)}</td>
                      <td>
                        {concluida
                          ? <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600}}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={11} height={11}><polyline points="20 6 9 17 4 12"/></svg>
                              Finalizada
                            </span>
                          : status ? <StatusBadge nome={status.nome} corIndex={status.corIndex} /> : <span style={{color:"#cbd5e1"}}>—</span>
                        }
                      </td>
                      <td><button className={styles.btnVer} onClick={()=>setDetalhe(o)}><IconEye /> Ver</button></td>
                      <td><button className={styles.btnDel} title="Excluir" onClick={()=>{setDeleteTarget(o);setShowDelete(true);}}><IconTrash /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className={styles.mobileList}>
            {filtered.map(o => {
              const status = getStatus(o.status_id);
              const concluida = !!o.data_conclusao || (()=>{
                const n = status?.nome?.toLowerCase() ?? "";
                return n.includes("finaliz") || n.includes("conclu") || n.includes("entregue");
              })();
              return (
                <div key={o.id} className={`${styles.mobileCard} ${concluida ? styles.mobileCardConcluida : ""}`} onClick={()=>setDetalhe(o)}>
                  <div className={styles.mobileCardTop}>
                    <span className={styles.osId}>#{String(o.id).padStart(5,"0")}</span>
                    {concluida
                      ? <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={10} height={10}><polyline points="20 6 9 17 4 12"/></svg>
                          Finalizada
                        </span>
                      : status && <StatusBadge nome={status.nome} corIndex={status.corIndex} />
                    }
                  </div>
                  <div className={styles.mobileCardCliente}>{o.cliente || getClienteDoEquip(o.equipamento_id)}</div>
                  <div className={styles.mobileCardEquip}>{o.equipamento || getEquip(o.equipamento_id)}</div>
                  <div className={styles.mobileCardFooter}>
                    <span style={{fontSize:13,color:"#64748b"}}>{fmtData(o.data_entrada)}</span>
                    <span style={{fontWeight:700,color:"#0f172a"}}>{fmt(o.valor_total ?? o.valor_manual)}</span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{textAlign:"center",color:"#94a3b8",padding:"40px 0"}}>Nenhuma ordem encontrada.</div>}
          </div>
        </>
      )}

      {/* Modal Criar */}
      {showCreate && (
        <div className={styles.modalOverlay} onClick={()=>!criando&&setShowCreate(false)}>
          <div className={styles.modal} onClick={e=>e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button className={styles.btnBack} onClick={()=>setShowCreate(false)}><IconX /></button>
              <div style={{flex:1}}><h2 className={styles.modalTitle}>Nova OS</h2></div>
            </div>
            <div className={styles.modalBody}>
              <OrdemForm form={createForm} setForm={setCreateForm}
                equipamentos={equipamentos} clientes={clientes} tecnicos={tecnicos}
                statusList={statusList} tiposServico={tiposServico} produtos={produtos}
                onNovoEquipamento={()=>{setNovoEquipCtx("create");setShowNovoEquip(true);}} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={()=>setShowCreate(false)} disabled={criando}>Cancelar</button>
              <button className={styles.btnSalvar} onClick={handleCriar}
                disabled={criando||!createForm.equipamentoId||!createForm.statusId||!createForm.dataEntrada||!createForm.relatoCliente.trim()||createForm.valorManual===""}>
                {criando ? "Criando..." : <><IconPlus /> Criar OS</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhe */}
      {detalhe && !showEdit && (()=>{
        const jaConcluida = !!detalhe.data_conclusao || (()=>{
          const s = getStatus(detalhe.status_id);
          const n = s?.nome?.toLowerCase() ?? "";
          return n.includes("finaliz") || n.includes("conclu") || n.includes("entregue");
        })();
        return (
        <div className={styles.modalOverlay} onClick={()=>setDetalhe(null)}>
          <div className={styles.modal} onClick={e=>e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button className={styles.btnBack} onClick={()=>setDetalhe(null)}><IconBack /></button>
              <div style={{flex:1}}>
                <h2 className={styles.modalTitle}>OS #{String(detalhe.id).padStart(5,"0")}</h2>
                <p className={styles.modalSubtitle}>{detalhe.cliente || getClienteDoEquip(detalhe.equipamento_id)}</p>
              </div>
              {jaConcluida
                ? <span style={{display:"inline-flex",alignItems:"center",gap:5,background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}><polyline points="20 6 9 17 4 12"/></svg>
                    Finalizada
                  </span>
                : (()=>{const s=getStatus(detalhe.status_id);return s?<StatusBadge nome={s.nome} corIndex={s.corIndex}/>:null;})()
              }
            </div>
            <div className={styles.modalBody}>
              {jaConcluida && (
                <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#166534",fontWeight:500}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}><polyline points="20 6 9 17 4 12"/></svg>
                  Esta ordem foi finalizada em {fmtData(detalhe.data_conclusao)}.
                </div>
              )}
              <div className={styles.detalhesSection}>
                <p className={styles.detalhesSectionTitle}>Informações Gerais</p>
                <div className={styles.detalhesGrid}>
                  <div className={styles.infoField}><span className={styles.infoLabel}>Cliente</span><span className={styles.infoValue}>{detalhe.cliente || getClienteDoEquip(detalhe.equipamento_id)}</span></div>
                  <div className={styles.infoField}><span className={styles.infoLabel}>Equipamento</span><span className={styles.infoValue}>{detalhe.equipamento || getEquip(detalhe.equipamento_id)}</span></div>
                  <div className={styles.infoField}><span className={styles.infoLabel}>Técnico</span><span className={styles.infoValue}>{getTecnico(detalhe.tecnico_id)}</span></div>
                  <div className={styles.infoField}><span className={styles.infoLabel}>Data Entrada</span><span className={styles.infoValue}>{fmtData(detalhe.data_entrada)}</span></div>
                  <div className={styles.infoField}><span className={styles.infoLabel}>Data Finalização</span><span className={styles.infoValue}>{fmtData(detalhe.data_conclusao)}</span></div>
                  <div className={styles.infoField}><span className={styles.infoLabel}>Valor Total</span><span className={styles.infoValue} style={{color:"#b1002f",fontWeight:700}}>{fmt(detalhe.valor_total ?? detalhe.valor_manual)}</span></div>
                </div>
              </div>
              {detalhe.descricao_problema && (<><div className={styles.detalhesDivider}/><div className={styles.detalhesSection}><p className={styles.detalhesSectionTitle}>Relato do Cliente</p><p className={styles.infoBoxValue}>{detalhe.descricao_problema}</p></div></>)}
              {detalhe.diagnostico && (<><div className={styles.detalhesDivider}/><div className={styles.detalhesSection}><p className={styles.detalhesSectionTitle}>Diagnóstico</p><p className={styles.infoBoxValue}>{detalhe.diagnostico}</p></div></>)}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={()=>setDetalhe(null)}>Fechar</button>
              <button className={styles.btnPDF} onClick={()=>gerarPDF(detalhe)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                PDF
              </button>
              {!jaConcluida && (
                <button className={styles.btnFinalizar} onClick={()=>setShowFinalizarModal(true)} disabled={finalizando}>
                  <IconCheck /> Finalizar OS
                </button>
              )}
              {!jaConcluida && (
                <button className={styles.btnSalvar} onClick={()=>abrirEdicao(detalhe)}>Editar OS</button>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Modal Editar */}
      {showEdit && editForm && (
        <div className={styles.modalOverlay} onClick={()=>!editando&&setShowEdit(false)}>
          <div className={styles.modal} onClick={e=>e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button className={styles.btnBack} onClick={()=>setShowEdit(false)}><IconBack /></button>
              <div style={{flex:1}}><h2 className={styles.modalTitle}>Editar OS #{String(editForm.id).padStart(5,"0")}</h2></div>
            </div>
            <div className={styles.modalBody}>
              <OrdemForm form={editForm} setForm={setEditForm}
                equipamentos={equipamentos} clientes={clientes} tecnicos={tecnicos}
                statusList={statusList} tiposServico={tiposServico} produtos={produtos}
                onNovoEquipamento={()=>{setNovoEquipCtx("edit");setShowNovoEquip(true);}} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={()=>setShowEdit(false)} disabled={editando}>Cancelar</button>
              <button className={styles.btnFinalizar} onClick={()=>setShowFinalizarModal(true)} disabled={editando}>
                <IconCheck /> Finalizar OS
              </button>
              <button className={styles.btnSalvar} onClick={handleAtualizar} disabled={editando||!editForm.equipamentoId||!editForm.statusId||!editForm.dataEntrada||!editForm.relatoCliente.trim()||editForm.valorManual===""}>
                {editando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Finalizar */}
      {showFinalizarModal && (
        <ModalConfirmar
          titulo="Finalizar Ordem de Serviço"
          mensagem={`Confirmar a finalização da OS #${String(editForm?.id).padStart(5,"0")}? O status será atualizado para finalizado e a data de conclusão será registrada hoje.`}
          onConfirmar={handleFinalizar}
          onCancelar={()=>setShowFinalizarModal(false)}
          loading={finalizando}
          cor="#166534"
        />
      )}

      {/* Modal Novo Equipamento */}
      {showNovoEquip && (
        <ModalNovoEquipamento
          clientes={clientes}
          onSalvar={async (data) => {
            setShowNovoEquip(false);
            await recarregarEquipamentos();
            // auto-selecionar o novo equipamento
            const novoId = data?.idEquipamentos ?? data?.id;
            if (novoId) {
              if (novoEquipCtx === "create") setCreateForm(prev => ({ ...prev, equipamentoId: String(novoId) }));
              else setEditForm(prev => ({ ...prev, equipamentoId: String(novoId) }));
            }
          }}
          onFechar={()=>setShowNovoEquip(false)}
          onNovoCliente={()=>setShowNovoClienteEquip(true)}
        />
      )}

      {/* Sub-modal: Novo Cliente (dentro do modal de equipamento) */}
      {showNovoClienteEquip && (
        <ModalNovoCliente
          onSalvar={async () => { setShowNovoClienteEquip(false); await recarregarClientes(); }}
          onFechar={()=>setShowNovoClienteEquip(false)}
        />
      )}

      {/* Modal Novo Cliente (direto do form) */}
      {showNovoCliente && (
        <ModalNovoCliente
          onSalvar={async () => { setShowNovoCliente(false); await recarregarClientes(); }}
          onFechar={()=>setShowNovoCliente(false)}
        />
      )}

      {/* Modal Deletar */}
      {showDelete && deleteTarget && (
        <ModalConfirmar
          titulo="Excluir Ordem"
          mensagem={`Tem certeza que deseja excluir a OS #${String(deleteTarget.idServicos??deleteTarget.id).padStart(5,"0")}? Esta ação não pode ser desfeita.`}
          onConfirmar={handleDeletar}
          onCancelar={()=>{setShowDelete(false);setDeleteTarget(null);}}
          loading={deletando}
        />
      )}
    </div>
  );
}
