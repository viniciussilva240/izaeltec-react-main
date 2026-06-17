"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const API        = "/api/tecnicos";
const API_DELETE = "/api/tecnicos";

const IconUserPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={16} height={16}>
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function TecnicosPage() {
  const [tecnicos, setTecnicos] = useState([]);
  const [nome, setNome]         = useState("");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletando, setDeletando]       = useState(false);
  // editar
  const [editTarget, setEditTarget]   = useState(null);
  const [editNome, setEditNome]       = useState("");
  const [editando, setEditando]       = useState(false);

  // ── Carregar técnicos da API ──────────────────────────────────────────────
  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const res  = await fetch(API);
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      const data = await res.json();
      setTecnicos(Array.isArray(data) ? data : (data.value ?? []));
    } catch (e) {
      console.error("Erro ao carregar técnicos:", e);
      setErro(`Não foi possível carregar os técnicos. (${e.message})`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  // ── Adicionar ─────────────────────────────────────────────────────────────
  async function handleAdicionar() {
    if (!nome.trim()) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim() }),
      });
      if (!res.ok) throw new Error();
      setNome("");
      await carregar();
    } catch {
      setErro("Erro ao adicionar técnico.");
    } finally {
      setSalvando(false);
    }
  }

  // ── Deletar ───────────────────────────────────────────────────────────────
  async function handleDeletar() {
    if (!deleteTarget) return;
    setDeletando(true);
    setErro(null);
    try {
      const res  = await fetch(`${API_DELETE}/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.erro || data?.message || `Erro ${res.status}`);
      setDeleteTarget(null);
      await carregar();
    } catch (e) {
      setErro(`Não foi possível remover o técnico: ${e.message}`);
      setDeleteTarget(null);
    } finally {
      setDeletando(false);
    }
  }

  // ── Editar ────────────────────────────────────────────────────────────────
  function abrirEdicao(t) {
    setEditTarget(t);
    setEditNome(t.nome);
  }

  async function handleEditar() {
    if (!editTarget || !editNome.trim()) return;
    setEditando(true);
    setErro(null);
    try {
      const res = await fetch(`${API}/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ nome: editNome.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.erro || data?.message || `Erro ${res.status}`);
      setEditTarget(null);
      setEditNome("");
      await carregar();
    } catch (e) {
      setErro(`Não foi possível editar o técnico: ${e.message}`);
    } finally {
      setEditando(false);
    }
  }

  const filteredTecnicos = tecnicos.filter((t) =>
    t.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Técnicos</h1>
          <p className={styles.subtitle}>Gerencie os técnicos da assistência</p>
        </div>
        <button className={styles.btnRecarregar} onClick={carregar} disabled={loading} title="Recarregar">
          <IconRefresh /> Recarregar
        </button>
      </div>

      {erro && (
        <div className={styles.erroBox}>
          {erro}
          <button className={styles.btnErroFechar} onClick={() => setErro(null)}><IconX /></button>
        </div>
      )}

      <div className={styles.layout}>
        {/* Formulário de adição */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <IconUserPlus />
            <span>Adicionar Técnico</span>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome do Técnico</label>
            <input
              className={styles.input}
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
              disabled={salvando}
            />
          </div>
          <button className={styles.btnAdicionar} onClick={handleAdicionar} disabled={salvando || !nome.trim()}>
            <IconUserPlus /> {salvando ? "Salvando..." : "Adicionar"}
          </button>
        </div>

        {/* Lista de técnicos */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <IconUsers />
            <span>Técnicos Cadastrados ({loading ? "..." : filteredTecnicos.length})</span>
          </div>

          {/* Busca */}
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              className={styles.searchInput}
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <span>Carregando...</span>
            </div>
          ) : (
            <div className={styles.lista}>
              {filteredTecnicos.length === 0 && (
                <p className={styles.empty}>
                  {search ? "Nenhum técnico encontrado." : "Nenhum técnico cadastrado."}
                </p>
              )}
              {filteredTecnicos.map((t) => (
                <div key={t.id} className={styles.tecnicoRow}>
                  <div className={styles.tecnicoAvatar}><IconUser /></div>
                  <span className={styles.tecnicoNome}>{t.nome}</span>
                  <button
                    className={styles.btnEditar}
                    onClick={() => abrirEdicao(t)}
                    title="Editar técnico"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={14} height={14}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    className={styles.btnRemover}
                    onClick={() => setDeleteTarget(t)}
                    title="Remover técnico"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de edição */}
      {editTarget && (
        <div className={styles.modalOverlay} onClick={() => !editando && setEditTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar Técnico</h2>
              <button className={styles.btnClose} onClick={() => setEditTarget(null)} disabled={editando}>
                <IconX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome do Técnico</label>
                <input
                  className={styles.input}
                  placeholder="Nome completo"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEditar()}
                  disabled={editando}
                  autoFocus
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setEditTarget(null)} disabled={editando}>
                Cancelar
              </button>
              <button className={styles.btnConfirmar} onClick={handleEditar} disabled={editando || !editNome.trim()}>
                {editando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => !deletando && setDeleteTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Remover Técnico</h2>
              <button className={styles.btnClose} onClick={() => setDeleteTarget(null)} disabled={deletando}>
                <IconX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalTexto}>
                Tem certeza que deseja remover o técnico <strong>{deleteTarget.nome}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setDeleteTarget(null)} disabled={deletando}>
                Cancelar
              </button>
              <button className={styles.btnConfirmar} onClick={handleDeletar} disabled={deletando}>
                {deletando ? "Removendo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
