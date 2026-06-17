"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const API_EQUIP        = "/api/equipamentos";
const API_CLIENTES     = "/api/clientes";
const API_MARCAS       = "/api/marcas";
const API_TIPOS_EQUIP  = "/api/tipo-equipamentos";

const emptyForm = {
  clienteId: "", tipoEquipId: "", marcaId: "", modelo: "", serie: "", estado: "",
};

// ─── Mapeia API → form ────────────────────────────────────────────────────────
function apiToForm(e, clientes, marcas, tiposEquip) {
  const clienteId  = e.cliente_id  ?? e.Cliente_idCliente  ?? e.clienteId;
  const marcaId    = e.marca_id    ?? e.Marcas_idMarcas     ?? e.marcaId;
  const tipoEquipId= e.tipo_equipamento_id ?? e.tipoEquipamentoId;
  const cliente    = clientes.find(c => c.id === clienteId);
  const marca      = marcas.find(m => m.id === marcaId);
  const tipoEquip  = tiposEquip.find(t => t.id === tipoEquipId);
  return {
    id:           e.id ?? e.idEquipamentos,
    clienteId:    clienteId   ?? "",
    clienteNome:  cliente?.nome ?? `Cliente #${clienteId}`,
    tipoEquipId:  tipoEquipId  ?? "",
    tipoEquipNome:tipoEquip?.nome ?? `Tipo #${tipoEquipId}`,
    marcaId:      marcaId      ?? "",
    marcaNome:    marca?.nome  ?? `Marca #${marcaId}`,
    modelo:       e.modelo     ?? "",
    serie:        e.numero_serie ?? e.serie ?? "",
    estado:       e.observacoes  ?? "",
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconMonitor = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IconSearch  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconPlus    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={16} height={16}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconTrash   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={14} height={14}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconRefresh = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}   width={15} height={15}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;

// ─── Modal Novo Cliente Rápido ────────────────────────────────────────────────
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
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      onSalvar();
    } catch { setErro("Erro ao cadastrar cliente."); }
    finally { setSalvando(false); }
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:16 }} onClick={onFechar}>
      <div style={{ background:"#fff",borderRadius:14,width:"100%",maxWidth:360,boxShadow:"0 8px 32px rgba(0,0,0,.18)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px 0" }}>
          <span style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Cadastrar cliente</span>
          <button onClick={onFechar} style={{ background:"none",border:"none",cursor:"pointer",color:"#64748b",padding:4 }}><IconX /></button>
        </div>
        <div style={{ padding:"16px 20px",display:"flex",flexDirection:"column",gap:12 }}>
          {erro && <p style={{ margin:0,fontSize:13,color:"#b1002f" }}>{erro}</p>}
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

// ─── Formulário de Equipamento ────────────────────────────────────────────────
function EquipForm({ form, onChange, clientes, marcas, tiposEquip, onNovoCliente }) {
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>Cliente <span className={styles.required}>*</span></label>
        <select name="clienteId" value={form.clienteId} onChange={onChange} className={styles.input}>
          <option value="">Selecione o cliente</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <button type="button" onClick={onNovoCliente} style={{ marginTop:6,display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer",width:"fit-content" }}>
          <IconPlus /> Cadastrar novo cliente
        </button>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tipo de Equipamento <span className={styles.required}>*</span></label>
        <select name="tipoEquipId" value={form.tipoEquipId} onChange={onChange} className={styles.input}>
          <option value="">Selecione o tipo</option>
          {tiposEquip.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Marca <span className={styles.required}>*</span></label>
          <select name="marcaId" value={form.marcaId} onChange={onChange} className={styles.input}>
            <option value="">Selecione a marca</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Modelo <span className={styles.required}>*</span></label>
          <input name="modelo" value={form.modelo} onChange={onChange} placeholder="Ex: iPhone 13" className={styles.input} />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Número de Série</label>
          <input name="serie" value={form.serie} onChange={onChange} placeholder="Número de série" className={styles.input} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Estado de Conservação</label>
        <textarea name="estado" value={form.estado} onChange={onChange} placeholder="Arranhões, marcas de uso, etc." className={styles.textarea} rows={3} />
      </div>
    </>
  );
}

// ─── Modal de confirmação ─────────────────────────────────────────────────────
function ModalConfirmar({ titulo, mensagem, onConfirmar, onCancelar, loading }) {
  return (
    <div className={styles.modalOverlay} onClick={!loading ? onCancelar : undefined}>
      <div className={styles.modal} style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{titulo}</h2>
          <button className={styles.btnClose} onClick={onCancelar} disabled={loading}><IconX /></button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ margin:0,fontSize:14,color:"#475569",lineHeight:1.6 }}>{mensagem}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancelar} onClick={onCancelar} disabled={loading}>Cancelar</button>
          <button style={{ background:"#b1002f",color:"#fff",border:"none",borderRadius:8,padding:"9px 24px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"DM Sans,sans-serif",opacity:loading?0.6:1 }}
            onClick={onConfirmar} disabled={loading}>
            {loading ? "Excluindo..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EquipamentosPage() {
  const [equipamentos,  setEquipamentos]  = useState([]);
  const [clientes,      setClientes]      = useState([]);
  const [marcas,        setMarcas]        = useState([]);
  const [tiposEquip,    setTiposEquip]    = useState([]);
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState(null);

  const [showCreate,      setShowCreate]      = useState(false);
  const [createForm,      setCreateForm]      = useState(emptyForm);
  const [criando,         setCriando]         = useState(false);
  const [showEdit,        setShowEdit]        = useState(false);
  const [editForm,        setEditForm]        = useState(null);
  const [editando,        setEditando]        = useState(false);
  const [showDelete,      setShowDelete]      = useState(false);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [deletando,       setDeletando]       = useState(false);
  const [showNovoCliente, setShowNovoCliente] = useState(false);

  async function carregarTudo() {
    setLoading(true); setErro(null);
    try {
      const [resE, resC, resM, resT] = await Promise.all([
        fetch(API_EQUIP), fetch(API_CLIENTES), fetch(API_MARCAS), fetch(API_TIPOS_EQUIP),
      ]);
      const [dataE, dataC, dataM, dataT] = await Promise.all([
        resE.json(), resC.json(), resM.json(), resT.json(),
      ]);

      const norm = d => Array.isArray(d) ? d : (d?.value ?? []);

      const listaC = norm(dataC).map(c => ({
        id:   c.id,
        nome: c.nome_completo ?? c.nome ?? `Cliente #${c.id}`,
      }));
      const listaM = norm(dataM).map(m => ({
        id:   m.id,
        nome: m.nome ?? `Marca #${m.id}`,
      }));
      const listaT = norm(dataT).map(t => ({
        id:   t.id,
        nome: t.nome ?? `Tipo #${t.id}`,
      }));
      const listaE = norm(dataE).map(e => apiToForm(e, listaC, listaM, listaT));

      setClientes(listaC);
      setMarcas(listaM);
      setTiposEquip(listaT);
      setEquipamentos(listaE);
    } catch (e) {
      setErro(`Erro ao carregar dados: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarTudo(); }, []);

  const filtered = equipamentos.filter(e =>
    `${e.marcaNome} ${e.modelo} ${e.clienteNome} ${e.tipoEquipNome} ${e.serie}`
      .toLowerCase().includes(search.toLowerCase())
  );

  function handleChange(setter, form) {
    return e => setter({ ...form, [e.target.name]: e.target.value });
  }

  function buildBody(form) {
    return {
      cliente_id:          Number(form.clienteId),
      tipo_equipamento_id: Number(form.tipoEquipId),
      marca_id:            Number(form.marcaId),
      modelo:              form.modelo,
      numero_serie:        form.serie   || null,
      observacoes:         form.estado  || null,
    };
  }

  async function handleCriar() {
    if (!createForm.clienteId || !createForm.tipoEquipId || !createForm.marcaId || !createForm.modelo.trim()) return;
    setCriando(true); setErro(null);
    try {
      const res = await fetch(API_EQUIP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(createForm)),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowCreate(false); setCreateForm(emptyForm);
      await carregarTudo();
    } catch (e) { setErro(`Erro ao criar equipamento: ${e.message}`); }
    finally { setCriando(false); }
  }

  async function handleAtualizar() {
    if (!editForm.clienteId || !editForm.tipoEquipId || !editForm.marcaId || !editForm.modelo.trim()) return;
    setEditando(true); setErro(null);
    try {
      const res = await fetch(`${API_EQUIP}/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(editForm)),
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowEdit(false); setEditForm(null);
      await carregarTudo();
    } catch (e) { setErro(`Erro ao atualizar equipamento: ${e.message}`); }
    finally { setEditando(false); }
  }

  async function handleDeletar() {
    setDeletando(true); setErro(null);
    try {
      const res = await fetch(`${API_EQUIP}/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }
      setShowDelete(false); setDeleteTarget(null);
      await carregarTudo();
    } catch (e) { setErro(`Erro ao excluir equipamento: ${e.message}`); setShowDelete(false); }
    finally { setDeletando(false); }
  }

  async function recarregarClientes() {
    const res = await fetch(API_CLIENTES);
    const data = await res.json();
    const norm = d => Array.isArray(d) ? d : (d?.value ?? []);
    setClientes(norm(data).map(c => ({ id: c.id, nome: c.nome_completo ?? c.nome ?? `Cliente #${c.id}` })));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Equipamentos</h1>
          <p className={styles.subtitle}>Gerencie os equipamentos dos clientes</p>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <button className={styles.btnRecarregar} onClick={carregarTudo} disabled={loading} title="Recarregar"><IconRefresh /></button>
          <button className={styles.btnNovo} onClick={() => { setCreateForm(emptyForm); setShowCreate(true); }}>
            <IconPlus /> Novo Equipamento
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
        <input className={styles.searchInput} placeholder="Buscar por marca, modelo, cliente ou série..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className={styles.loadingBox}><div className={styles.spinner} /><span>Carregando equipamentos...</span></div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(e => (
            <div key={e.id} className={styles.card}
              onDoubleClick={() => { setEditForm({ ...e }); setShowEdit(true); }}
              title="Duplo clique para editar">
              <div className={styles.cardTop}>
                <div className={styles.avatar}><IconMonitor /></div>
                <button className={styles.btnDeleteCard} title="Excluir"
                  onClick={ev => { ev.stopPropagation(); setDeleteTarget(e); setShowDelete(true); }}>
                  <IconTrash />
                </button>
              </div>
              <h3 className={styles.equipNome}>{e.marcaNome} {e.modelo}</h3>
              <div className={styles.info}>
                <span className={styles.infoItem}><strong>Cliente:</strong> {e.clienteNome}</span>
                {e.tipoEquipNome && <span className={styles.infoItem}><strong>Tipo:</strong> {e.tipoEquipNome}</span>}
                {e.serie && <span className={styles.infoItem}><strong>Série:</strong> {e.serie}</span>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className={styles.empty}>{search ? "Nenhum equipamento encontrado." : "Nenhum equipamento cadastrado."}</p>
          )}
        </div>
      )}

      {/* Modal Criar */}
      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => !criando && setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Novo Equipamento</h2>
              <button className={styles.btnClose} onClick={() => setShowCreate(false)} disabled={criando}><IconX /></button>
            </div>
            <div className={styles.modalBody}>
              <EquipForm form={createForm} onChange={handleChange(setCreateForm, createForm)}
                clientes={clientes} marcas={marcas} tiposEquip={tiposEquip}
                onNovoCliente={() => setShowNovoCliente(true)} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setShowCreate(false)} disabled={criando}>Cancelar</button>
              <button className={styles.btnCriar} onClick={handleCriar}
                disabled={criando || !createForm.clienteId || !createForm.tipoEquipId || !createForm.marcaId || !createForm.modelo.trim()}>
                {criando ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEdit && editForm && (
        <div className={styles.modalOverlay} onClick={() => !editando && setShowEdit(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar Equipamento</h2>
              <button className={styles.btnClose} onClick={() => setShowEdit(false)} disabled={editando}><IconX /></button>
            </div>
            <div className={styles.modalBody}>
              <EquipForm form={editForm} onChange={handleChange(setEditForm, editForm)}
                clientes={clientes} marcas={marcas} tiposEquip={tiposEquip}
                onNovoCliente={() => setShowNovoCliente(true)} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setShowEdit(false)} disabled={editando}>Cancelar</button>
              <button className={styles.btnCriar} onClick={handleAtualizar}
                disabled={editando || !editForm.clienteId || !editForm.tipoEquipId || !editForm.marcaId || !editForm.modelo.trim()}>
                {editando ? "Salvando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showNovoCliente && (
        <ModalNovoCliente
          onSalvar={async () => { setShowNovoCliente(false); await recarregarClientes(); }}
          onFechar={() => setShowNovoCliente(false)}
        />
      )}

      {/* Modal Deletar */}
      {showDelete && deleteTarget && (
        <ModalConfirmar
          titulo="Excluir Equipamento"
          mensagem={`Tem certeza que deseja excluir "${deleteTarget.marcaNome} ${deleteTarget.modelo}"? Esta ação não pode ser desfeita.`}
          onConfirmar={handleDeletar}
          onCancelar={() => { setShowDelete(false); setDeleteTarget(null); }}
          loading={deletando}
        />
      )}
    </div>
  );
}
