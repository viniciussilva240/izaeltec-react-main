"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const API = "/api/clientes";

const emptyForm = {
  nome: "", cpfCnpj: "", telefone: "", email: "",
  rua: "", numero: "", complemento: "", bairro: "", cep: "",
  cidade: "", estado: "", observacoes: "",
};

// ─── Mapeia API → form ────────────────────────────────────────────────────────
function apiToForm(c) {
  return {
    id:          c.idCliente        ?? c.id,
    // API retorna nomeCliente; fallback para nome
    nome:        c.nomeCliente      ?? c.nome_completo ?? c.nome ?? "",
    cpfCnpj:     c.cpfCnpj         ?? c.cpf_cnpj      ?? c.cpf  ?? "",
    telefone:    c.telefone         ?? c.fone           ?? "",
    email:       c.email            ?? "",
    rua:         c.rua              ?? c.logradouro     ?? "",
    numero:      c.numero           ?? "",
    complemento: c.complemento      ?? "",
    bairro:      c.bairro           ?? "",
    cep:         c.cep              ?? "",
    cidade:      c.cidade           ?? c.municipio     ?? "",
    estado:      c.estado           ?? c.uf             ?? "",
    observacoes: c.observacoes      ?? c.obs            ?? "",
  };
}

// ─── Mapeia form → body da API ────────────────────────────────────────────────
function formToApi(f) {
  return {
    nome_completo: f.nome        || null,
    telefone:      f.telefone    || null,
    cpf_cnpj:      f.cpfCnpj     || null,
    email:         f.email       || null,
    rua:           f.rua         || null,
    numero:        f.numero      || null,
    complemento:   f.complemento || null,
    bairro:        f.bairro      || null,
    cep:           f.cep         || null,
    cidade:        f.cidade      || null,
    estado:        f.estado      || null,
    observacoes:   f.observacoes || null,
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUser   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPhone  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>;
const IconMail   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconPin    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconPlus   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconTrash  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={14} height={14}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconRefresh = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;

// ─── Máscaras ─────────────────────────────────────────────────────────────────
function maskTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      a ? `(${a}${b ? `) ${b}${c ? `-${c}` : ""}` : ""}` : "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function maskCpfCnpj(v) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11)
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskCep(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{0,3})/, (_, a, b) => b ? `${a}-${b}` : a);
}

function maskEstado(v) {
  return v.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
}

// ─── Formulário ───────────────────────────────────────────────────────────────
function ClienteForm({ form, setForm, onChange }) {
  function handleMasked(field, maskFn) {
    return (e) => setForm(prev => ({ ...prev, [field]: maskFn(e.target.value) }));
  }

  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>Nome Completo <span className={styles.required}>*</span></label>
        <input name="nome" value={form.nome} onChange={onChange} placeholder="Nome completo" className={styles.input} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>CPF/CNPJ</label>
          <input name="cpfCnpj" value={form.cpfCnpj}
            onChange={handleMasked("cpfCnpj", maskCpfCnpj)}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            className={styles.input} inputMode="numeric" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Telefone <span className={styles.required}>*</span></label>
          <input name="telefone" value={form.telefone}
            onChange={handleMasked("telefone", maskTelefone)}
            placeholder="(00) 00000-0000"
            className={styles.input} inputMode="numeric" />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input name="email" value={form.email} onChange={onChange} placeholder="email@exemplo.com" className={styles.input} />
      </div>

      <div className={styles.divider} />
      <p className={styles.sectionLabel}>Endereço</p>

      <div className={styles.formRowAuto}>
        <div className={`${styles.formGroup} ${styles.flex2}`}>
          <label className={styles.label}>Rua</label>
          <input name="rua" value={form.rua} onChange={onChange} placeholder="Rua exemplo" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Número</label>
          <input name="numero" value={form.numero} onChange={onChange} placeholder="123" className={styles.input} />
        </div>
      </div>

      <div className={styles.formRow3}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Complemento</label>
          <input name="complemento" value={form.complemento} onChange={onChange} placeholder="Apt 45" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Bairro</label>
          <input name="bairro" value={form.bairro} onChange={onChange} placeholder="Centro" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>CEP</label>
          <input name="cep" value={form.cep}
            onChange={handleMasked("cep", maskCep)}
            placeholder="00000-000"
            className={styles.input} inputMode="numeric" />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Cidade</label>
          <input name="cidade" value={form.cidade} onChange={onChange} placeholder="São Paulo" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Estado</label>
          <input name="estado" value={form.estado}
            onChange={handleMasked("estado", maskEstado)}
            placeholder="SP" maxLength={2}
            className={styles.input} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Observações</label>
        <textarea name="observacoes" value={form.observacoes} onChange={onChange} placeholder="Observações sobre o cliente" className={styles.textarea} rows={3} />
      </div>
    </>
  );
}

// ─── Modal de confirmação ─────────────────────────────────────────────────────
function ModalConfirmar({ titulo, mensagem, onConfirmar, onCancelar, loading }) {
  return (
    <div className={styles.modalOverlay} onClick={!loading ? onCancelar : undefined}>
      <div className={styles.modal} style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{titulo}</h2>
          <button className={styles.btnClose} onClick={onCancelar} disabled={loading}><IconX /></button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{mensagem}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancelar} onClick={onCancelar} disabled={loading}>Cancelar</button>
          <button
            style={{ background: "#b1002f", color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif", opacity: loading ? 0.6 : 1 }}
            onClick={onConfirmar}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClientesPage() {
  const [clientes,  setClientes]  = useState([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(null);

  // criar
  const [showCreate,  setShowCreate]  = useState(false);
  const [createForm,  setCreateForm]  = useState(emptyForm);
  const [criando,     setCriando]     = useState(false);

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
      const res  = await fetch(API);
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      const data = await res.json();
      const lista = Array.isArray(data) ? data : (data.value ?? []);
      setClientes(lista.map(apiToForm));
    } catch (e) {
      setErro(`Não foi possível carregar os clientes. (${e.message})`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  // ── Filtro ──────────────────────────────────────────────────────────────────
  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cpfCnpj.includes(search) ||
    c.telefone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Criar ───────────────────────────────────────────────────────────────────
  async function handleCriar() {
    if (!createForm.nome.trim() || !createForm.telefone.trim()) return;
    setCriando(true);
    setErro(null);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToApi(createForm)),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowCreate(false);
      setCreateForm(emptyForm);
      await carregar();
    } catch (e) {
      setErro(`Erro ao criar cliente: ${e.message}`);
    } finally {
      setCriando(false);
    }
  }

  // ── Editar ──────────────────────────────────────────────────────────────────
  async function handleAtualizar() {
    if (!editForm.nome.trim() || !editForm.telefone.trim()) return;
    setEditando(true);
    setErro(null);
    try {
      const res = await fetch(`${API}/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToApi(editForm)),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowEdit(false);
      setEditForm(null);
      await carregar();
    } catch (e) {
      setErro(`Erro ao atualizar cliente: ${e.message}`);
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
      setErro(`Erro ao excluir cliente: ${e.message}`);
      setShowDelete(false);
    } finally {
      setDeletando(false);
    }
  }

  function onChange(setter, form) {
    return (e) => setter({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.subtitle}>Gerencie seus clientes</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className={styles.btnRecarregar} onClick={carregar} disabled={loading} title="Recarregar">
            <IconRefresh />
          </button>
          <button className={styles.btnNovo} onClick={() => { setCreateForm(emptyForm); setShowCreate(true); }}>
            <IconPlus /> Novo Cliente
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
          placeholder="Buscar por nome, CPF/CNPJ, telefone ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <span>Carregando clientes...</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((c) => (
            <div
              key={c.id}
              className={styles.card}
              onDoubleClick={() => { setEditForm({ ...c }); setShowEdit(true); }}
              title="Duplo clique para editar"
            >
              <div className={styles.cardTop}>
                <div className={styles.avatar}><IconUser /></div>
                <button
                  className={styles.btnDeleteCard}
                  title="Excluir cliente"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); setShowDelete(true); }}
                >
                  <IconTrash />
                </button>
              </div>
              <h3 className={styles.clienteName}>{c.nome}</h3>
              {c.cpfCnpj && <p className={styles.cpf}>{c.cpfCnpj}</p>}
              <div className={styles.info}>
                {c.telefone && <span className={styles.infoItem}><IconPhone />{c.telefone}</span>}
                {c.email    && <span className={styles.infoItem}><IconMail />{c.email}</span>}
                {c.cidade   && <span className={styles.infoItem}><IconPin />{c.cidade}{c.estado ? `, ${c.estado}` : ""}</span>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className={styles.empty}>
              {search ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
            </p>
          )}
        </div>
      )}

      {/* Modal Criar */}
      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => !criando && setShowCreate(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Novo Cliente</h2>
              <button className={styles.btnClose} onClick={() => setShowCreate(false)} disabled={criando}><IconX /></button>
            </div>
            <div className={styles.modalBody}>
              <ClienteForm form={createForm} setForm={setCreateForm} onChange={onChange(setCreateForm, createForm)} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setShowCreate(false)} disabled={criando}>Cancelar</button>
              <button className={styles.btnCriar} onClick={handleCriar} disabled={criando || !createForm.nome.trim() || !createForm.telefone.trim()}>
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
              <h2 className={styles.modalTitle}>Editar Cliente</h2>
              <button className={styles.btnClose} onClick={() => setShowEdit(false)} disabled={editando}><IconX /></button>
            </div>
            <div className={styles.modalBody}>
              <ClienteForm form={editForm} setForm={setEditForm} onChange={onChange(setEditForm, editForm)} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setShowEdit(false)} disabled={editando}>Cancelar</button>
              <button className={styles.btnCriar} onClick={handleAtualizar} disabled={editando || !editForm.nome.trim() || !editForm.telefone.trim()}>
                {editando ? "Salvando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {showDelete && deleteTarget && (
        <ModalConfirmar
          titulo="Excluir Cliente"
          mensagem={`Tem certeza que deseja excluir o cliente "${deleteTarget.nome}"? Esta ação não pode ser desfeita.`}
          onConfirmar={handleDeletar}
          onCancelar={() => { setShowDelete(false); setDeleteTarget(null); }}
          loading={deletando}
        />
      )}
    </div>
  );
}
