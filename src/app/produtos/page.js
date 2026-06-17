"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const API          = "/api/produtos";
const API_MARCAS   = "/api/marcas";

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const emptyForm = { nome: "", marcaId: "", preco: "", quantidade: "" };

// ─── Mapeia API → form ────────────────────────────────────────────────────────
function apiToForm(p, marcas) {
  const marca = marcas.find((m) => m.id === p.marca_id);
  return {
    id:         p.id,
    nome:       p.nome             ?? "",
    marcaId:    p.marca_id         ?? "",
    marcaNome:  marca?.nome        ?? (p.marca_id ? `Marca #${p.marca_id}` : ""),
    preco:      p.preco            ?? "0",
    quantidade: p.estoque_livre    ?? 0,
  };
}

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

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconPlus    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSearch  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconTrash   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconBox     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconRefresh = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={15} height={15}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;

// ─── Modal de confirmação ─────────────────────────────────────────────────────
function ModalConfirmar({ titulo, mensagem, onConfirmar, onCancelar, loading }) {
  return (
    <div className={styles.modalOverlay} onClick={!loading ? onCancelar : undefined}>
      <div className={styles.modal} style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{titulo}</h2>
          <button className={styles.btnClose} onClick={onCancelar} disabled={loading}><IconX /></button>
        </div>
        <div className={styles.modalBody} style={{ gap: 0 }}>
          <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{mensagem}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancelar} onClick={onCancelar} disabled={loading}>Cancelar</button>
          <button
            style={{ background: "#b1002f", color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif", opacity: loading ? 0.6 : 1 }}
            onClick={onConfirmar} disabled={loading}
          >
            {loading ? "Excluindo..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Formulário ───────────────────────────────────────────────────────────────
function ProdutoForm({ form, onChange, marcas }) {
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>Nome <span className={styles.required}>*</span></label>
        <input name="nome" value={form.nome} onChange={onChange} placeholder="Ex: Tela LCD" className={styles.input} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Marca</label>
          <select name="marcaId" value={form.marcaId} onChange={onChange} className={styles.input}>
            <option value="">Sem marca</option>
            {marcas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Preço (R$)</label>
          <input name="preco" type="number" step="0.01" min="0" value={form.preco} onChange={onChange} placeholder="0,00" className={styles.input} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Quantidade em Estoque</label>
        <input name="quantidade" type="number" min="0" value={form.quantidade} onChange={onChange} placeholder="0" className={styles.input} />
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProdutosPage() {
  const [produtos,   setProdutos]   = useState([]);
  const [marcas,     setMarcas]     = useState([]);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState(null);
  const isMobile = useIsMobile();

  // criar
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [criando,    setCriando]    = useState(false);

  // editar
  const [showEdit,  setShowEdit]  = useState(false);
  const [editForm,  setEditForm]  = useState(null);
  const [editando,  setEditando]  = useState(false);

  // deletar
  const [showDelete,   setShowDelete]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletando,    setDeletando]    = useState(false);

  // ── Carregar ────────────────────────────────────────────────────────────────
  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const [resP, resM] = await Promise.all([
        fetch(API),
        fetch(API_MARCAS),
      ]);
      const [dataP, dataM] = await Promise.all([resP.json(), resM.json()]);

      const listaMarcas = (Array.isArray(dataM) ? dataM : (dataM.value ?? [])).map((m) => ({
        id: m.id, nome: m.nome,
      }));

      const listaProdutos = (Array.isArray(dataP) ? dataP : (dataP.value ?? [])).map((p) =>
        apiToForm(p, listaMarcas)
      );

      setMarcas(listaMarcas);
      setProdutos(listaProdutos);
    } catch (e) {
      setErro(`Erro ao carregar produtos: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtered = produtos.filter((p) =>
    `${p.nome} ${p.marcaNome} ${p.tipo}`.toLowerCase().includes(search.toLowerCase())
  );

  function handleChange(setter) {
    return (e) => setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Criar ───────────────────────────────────────────────────────────────────
  async function handleCriar() {
    if (!createForm.nome.trim()) return;
    setCriando(true);
    setErro(null);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome:          createForm.nome,
          marca_id:      createForm.marcaId ? Number(createForm.marcaId) : null,
          preco:         Number(createForm.preco)      || 0,
          estoque_livre: Number(createForm.quantidade) || 0,
        }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowCreate(false);
      setCreateForm(emptyForm);
      await carregar();
    } catch (e) {
      setErro(`Erro ao criar produto: ${e.message}`);
    } finally {
      setCriando(false);
    }
  }

  // ── Editar ──────────────────────────────────────────────────────────────────
  async function handleAtualizar() {
    if (!editForm.nome.trim()) return;
    setEditando(true);
    setErro(null);
    try {
      const res = await fetch(`${API}/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome:          editForm.nome,
          marca_id:      editForm.marcaId ? Number(editForm.marcaId) : null,
          preco:         Number(editForm.preco)      || 0,
          estoque_livre: Number(editForm.quantidade) || 0,
        }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowEdit(false);
      setEditForm(null);
      await carregar();
    } catch (e) {
      setErro(`Erro ao atualizar produto: ${e.message}`);
    } finally {
      setEditando(false);
    }
  }

  // ── Deletar ─────────────────────────────────────────────────────────────────
  async function handleDeletar() {
    setDeletando(true);
    setErro(null);
    try {
      const res = await fetch(`${API}/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowDelete(false);
      setDeleteTarget(null);
      await carregar();
    } catch (e) {
      setErro(`Erro ao excluir produto: ${e.message}`);
      setShowDelete(false);
    } finally {
      setDeletando(false);
    }
  }

  function abrirEdicao(p) {
    setEditForm({ ...p, preco: String(p.preco), quantidade: String(p.quantidade) });
    setShowEdit(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Produtos / Peças</h1>
          <p className={styles.subtitle}>Gerencie o estoque de peças e produtos</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className={styles.btnRecarregar} onClick={carregar} disabled={loading} title="Recarregar">
            <IconRefresh />
          </button>
          <button className={styles.btnNovo} onClick={() => { setCreateForm(emptyForm); setShowCreate(true); }}>
            <IconPlus /> Novo Produto
          </button>
        </div>
      </div>

      {erro && (
        <div className={styles.erroBox}>
          {erro}
          <button className={styles.btnErroFechar} onClick={() => setErro(null)}><IconX /></button>
        </div>
      )}

      <div className={styles.searchBox}>
        <IconSearch />
        <input
          className={styles.searchInput}
          placeholder="Buscar por nome, tipo ou marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingBox}>
            <div className={styles.spinner} />
            <span>Carregando produtos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            {search ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}
          </div>
        ) : isMobile ? (
          /* ── Cards mobile ── */
          <div className={styles.cardList}>
            {filtered.map((p) => (
              <div key={p.id} className={styles.prodCard}>
                <div className={styles.prodCardTop}>
                  <span className={styles.prodNome}><IconBox />{p.nome}</span>
                  <span className={Number(p.quantidade) > 0 ? styles.estoqueBadge : styles.estoqueZero}>
                    {Number(p.quantidade) > 0 ? `${p.quantidade} un.` : "Sem estoque"}
                  </span>
                </div>
                <div className={styles.prodCardBody}>
                  {p.tipo && (
                    <div className={styles.prodCardRow}>
                      <span className={styles.prodCardLabel}>Tipo</span>
                      <span>{p.tipo}</span>
                    </div>
                  )}
                  <div className={styles.prodCardRow}>
                    <span className={styles.prodCardLabel}>Marca</span>
                    <span>{p.marcaNome || "—"}</span>
                  </div>
                  <div className={styles.prodCardRow}>
                    <span className={styles.prodCardLabel}>Preço</span>
                    <span>{Number(p.preco) > 0 ? fmt(p.preco) : "—"}</span>
                  </div>
                </div>
                <div className={styles.acoes}>
                  <button className={styles.btnEditar} onClick={() => abrirEdicao(p)}>Editar</button>
                  <button className={styles.btnRemover} onClick={() => { setDeleteTarget(p); setShowDelete(true); }}><IconTrash /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Tabela desktop ── */
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={styles.row}>
                  <td><span className={styles.prodNome}><IconBox />{p.nome}</span></td>
                  <td>{p.tipo || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td>{p.marcaNome || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td>{Number(p.preco) > 0 ? fmt(p.preco) : <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td>
                    <span className={Number(p.quantidade) > 0 ? styles.estoqueBadge : styles.estoqueZero}>
                      {Number(p.quantidade) > 0 ? `${p.quantidade} un.` : "Sem estoque"}
                    </span>
                  </td>
                  <td className={styles.acoes}>
                    <button className={styles.btnEditar} onClick={() => abrirEdicao(p)}>Editar</button>
                    <button className={styles.btnRemover} onClick={() => { setDeleteTarget(p); setShowDelete(true); }}><IconTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Criar */}
      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => !criando && setShowCreate(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Novo Produto</h2>
              <button className={styles.btnClose} onClick={() => setShowCreate(false)} disabled={criando}><IconX /></button>
            </div>
            <div className={styles.modalBody}>
              <ProdutoForm form={createForm} onChange={handleChange(setCreateForm)} marcas={marcas} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setShowCreate(false)} disabled={criando}>Cancelar</button>
              <button className={styles.btnCriar} onClick={handleCriar} disabled={criando || !createForm.nome.trim()}>
                {criando ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEdit && editForm && (
        <div className={styles.modalOverlay} onClick={() => !editando && setShowEdit(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar Produto</h2>
              <button className={styles.btnClose} onClick={() => setShowEdit(false)} disabled={editando}><IconX /></button>
            </div>
            <div className={styles.modalBody}>
              <ProdutoForm form={editForm} onChange={handleChange(setEditForm)} marcas={marcas} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setShowEdit(false)} disabled={editando}>Cancelar</button>
              <button className={styles.btnCriar} onClick={handleAtualizar} disabled={editando || !editForm.nome.trim()}>
                {editando ? "Salvando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {showDelete && deleteTarget && (
        <ModalConfirmar
          titulo="Excluir Produto"
          mensagem={`Tem certeza que deseja excluir o produto "${deleteTarget.nome}"? Esta ação não pode ser desfeita.`}
          onConfirmar={handleDeletar}
          onCancelar={() => { setShowDelete(false); setDeleteTarget(null); }}
          loading={deletando}
        />
      )}
    </div>
  );
}
