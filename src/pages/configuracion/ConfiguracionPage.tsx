'use client'
import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { t } from '@/i18n'
import {
  useLugaresAvispitasTodos, useCreateLugarAvispitas, useUpdateLugarAvispitas, useDeleteLugarAvispitas,
  useLugaresMoscasTodos, useCreateLugarMoscas, useUpdateLugarMoscas, useDeleteLugarMoscas,
} from '@/hooks/useProduccion'

/* ─── Section wrapper ─────────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--vs-border)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        padding: '13px 20px', borderBottom: '1px solid var(--vs-border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--vs-primary)', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--vs-text-primary)' }}>{title}</span>
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  )
}

/* ─── Field label ─────────────────────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '.05em', color: 'var(--vs-text-muted)', marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

/* ─── Toggle group ────────────────────────────────────────────────────────── */
function ToggleGroup<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style={{
      display: 'inline-flex', border: '1px solid var(--vs-border)',
      borderRadius: 8, overflow: 'hidden', background: 'var(--vs-bg-page)',
    }}>
      {options.map(({ value: v, label }, i) => {
        const active = value === v
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              padding: '7px 16px', border: 'none',
              borderLeft: i > 0 ? '1px solid var(--vs-border)' : 'none',
              background: active ? 'var(--vs-primary)' : 'transparent',
              color: active ? '#fff' : 'var(--vs-text-secondary)',
              fontSize: '.82rem', fontWeight: active ? 600 : 400,
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Lugares editor (reutilizable para avispitas y moscas) ─────────────────── */
type Lugar = { id: number; nombre: string; descripcion?: string | null; activo: boolean }

function LugaresEditor({
  lugares, onCrear, onActualizar, onEliminar,
}: {
  lugares: Lugar[]
  onCrear: (nombre: string) => void
  onActualizar: (id: number, data: { nombre?: string; activo?: boolean }) => void
  onEliminar: (id: number) => void
}) {
  const [nuevo, setNuevo] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editNombre, setEditNombre] = useState('')

  const guardarEdicion = () => {
    if (editId == null) return
    const nombre = editNombre.trim()
    if (nombre) onActualizar(editId, { nombre })
    setEditId(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {lugares.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {editId === l.id ? (
              <input
                className="cfg-input"
                style={{ width: 140, padding: '4px 8px' }}
                value={editNombre}
                onChange={e => setEditNombre(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') guardarEdicion() }}
                onBlur={guardarEdicion}
                autoFocus
              />
            ) : (
              <span
                className="lugar-chip"
                style={{
                  opacity: l.activo ? 1 : .5,
                  textDecoration: l.activo ? 'none' : 'line-through',
                  cursor: 'pointer',
                }}
                onClick={() => { setEditId(l.id); setEditNombre(l.nombre) }}
                title="Click para editar nombre"
              >
                {l.nombre}
              </span>
            )}
            <button
              className="cfg-btn cfg-btn--ghost"
              style={{ padding: '2px 8px', fontSize: '.72rem' }}
              onClick={() => onActualizar(l.id, { activo: !l.activo })}
            >
              {l.activo ? 'Desactivar' : 'Activar'}
            </button>
            <button
              className="cfg-btn cfg-btn--ghost"
              style={{ padding: '2px 8px', fontSize: '.72rem', color: '#dc2626' }}
              onClick={() => { if (confirm(`¿Eliminar "${l.nombre}"?`)) onEliminar(l.id) }}
            >
              ✕
            </button>
          </div>
        ))}
        {lugares.length === 0 && (
          <span style={{ fontSize: '.82rem', color: 'var(--vs-text-muted)' }}>Sin lugares registrados.</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="cfg-input"
          style={{ maxWidth: 220 }}
          placeholder="Nuevo lugar..."
          value={nuevo}
          onChange={e => setNuevo(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && nuevo.trim()) { onCrear(nuevo.trim()); setNuevo('') }
          }}
        />
        <button
          className="cfg-btn cfg-btn--primary"
          onClick={() => { if (nuevo.trim()) { onCrear(nuevo.trim()); setNuevo('') } }}
        >
          Agregar
        </button>
      </div>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function ConfiguracionPage() {
  const store = useSettingsStore()
  const i = t[store.lang]

  const [editando, setEditando] = useState(false)
  const [saved, setSaved]       = useState(false)
  const [draft, setDraft] = useState({
    empresa: store.empresa,
    version: store.version,
    sistema: store.sistema,
  })

  // ── Lugares de liberación: Avispitas ──
  const { data: lugaresAvispitas = [] } = useLugaresAvispitasTodos()
  const crearAvispitas = useCreateLugarAvispitas()
  const actualizarAvispitas = useUpdateLugarAvispitas()
  const eliminarAvispitas = useDeleteLugarAvispitas()

  // ── Lugares de liberación: Moscas ──
  const { data: lugaresMoscas = [] } = useLugaresMoscasTodos()
  const crearMoscas = useCreateLugarMoscas()
  const actualizarMoscas = useUpdateLugarMoscas()
  const eliminarMoscas = useDeleteLugarMoscas()

  const handleGuardar = () => {
    store.setEmpresa(draft.empresa)
    store.setVersion(draft.version)
    store.setSistema(draft.sistema)
    setEditando(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCancelar = () => {
    setDraft({ empresa: store.empresa, version: store.version, sistema: store.sistema })
    setEditando(false)
  }

  const temaOpciones = [
    { value: 'light'  as const, label: i.claro      },
    { value: 'dark'   as const, label: i.oscuro      },
    { value: 'system' as const, label: i.automatico  },
  ]

  const langOpciones = [
    { value: 'es' as const, label: i.espanol },
    { value: 'en' as const, label: i.ingles  },
  ]

  const campos = [
    { key: 'empresa' as const, label: i.empresa },
    { key: 'sistema' as const, label: i.sistema },
    { key: 'version' as const, label: i.version },
  ]

  return (
    <>
      <style>{`
        :root {
          --vs-primary:      #16a34a;
          --vs-primary-soft: #dcfce7;
          --vs-success:      #15803d;
          --vs-success-soft: #dcfce7;
          --vs-neutral-soft: #f3f4f6;
          --vs-border:       #e5e7eb;
          --vs-text-primary:   #111827;
          --vs-text-secondary: #374151;
          --vs-text-muted:     #9ca3af;
          --vs-bg-card:      #ffffff;
          --vs-bg-page:      #f9fafb;
        }
        .cfg-input {
          width: 100%; padding: 8px 12px; font-size: .88rem;
          border: 1px solid var(--vs-border); border-radius: 8px;
          background: #fff; color: var(--vs-text-primary);
          transition: border-color .15s; box-sizing: border-box;
        }
        .cfg-input:focus {
          outline: none; border-color: var(--vs-primary);
          box-shadow: 0 0 0 3px rgba(22,163,74,.1);
        }
        .cfg-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: 8px; font-size: .83rem;
          font-weight: 500; border: none; cursor: pointer;
          transition: opacity .15s, transform .1s;
        }
        .cfg-btn:active { transform: scale(.97); }
        .cfg-btn--primary { background: var(--vs-primary); color: #fff; }
        .cfg-btn--primary:hover { opacity: .88; }
        .cfg-btn--ghost {
          background: transparent; border: 1px solid var(--vs-border);
          color: var(--vs-text-secondary);
        }
        .cfg-btn--ghost:hover { background: var(--vs-neutral-soft); }
        .cfg-fields {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 18px;
        }
        @media (max-width: 640px) {
          .cfg-fields { grid-template-columns: 1fr; }
        }
        .lugar-chip {
          padding: 4px 12px; border-radius: 6px; font-size: .78rem;
          font-weight: 500; background: var(--vs-bg-page);
          border: 1px solid var(--vs-border); color: var(--vs-text-secondary);
          white-space: nowrap;
        }
        .cfg-apariencia {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 540px) {
          .cfg-apariencia { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Encabezado */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--vs-text-primary)' }}>
          {i.configuracion}
        </h1>
        <p style={{ margin: '3px 0 0', fontSize: '.83rem', color: 'var(--vs-text-muted)' }}>
          {i.parametros}
        </p>
      </div>

      {/* ── Apariencia ── */}
      <Section title={i.apariencia}>
        <div className="cfg-apariencia">
          <div>
            <FieldLabel>{i.tema}</FieldLabel>
            <ToggleGroup options={temaOpciones} value={store.theme} onChange={store.setTheme} />
          </div>
          <div>
            <FieldLabel>{i.idioma}</FieldLabel>
            <ToggleGroup options={langOpciones} value={store.lang} onChange={store.setLang} />
          </div>
        </div>
      </Section>

      {/* ── Datos de empresa ── */}
      <div style={{
        background: '#fff', border: '1px solid var(--vs-border)',
        borderRadius: 12, overflow: 'hidden', marginBottom: 16,
      }}>
        {/* Header */}
        <div style={{
          padding: '13px 20px', borderBottom: '1px solid var(--vs-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--vs-primary)', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--vs-text-primary)' }}>
              {i.datosEmpresa}
            </span>
          </div>
          {/* Saved pill */}
          {saved && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600,
              background: 'var(--vs-success-soft)', color: 'var(--vs-success)',
              border: '1px solid #86efac',
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l2.5 2.5L10 4" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {i.guardado}
            </span>
          )}
        </div>

        <div style={{ padding: '18px 20px' }}>
          <div className="cfg-fields">
            {campos.map(({ key, label }) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                {editando
                  ? (
                    <input
                      className="cfg-input"
                      value={draft[key]}
                      onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
                    />
                  )
                  : (
                    <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--vs-text-primary)', padding: '7px 0' }}>
                      {store[key]}
                    </div>
                  )
                }
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {!editando
              ? (
                <button className="cfg-btn cfg-btn--ghost" onClick={() => {
                  setDraft({ empresa: store.empresa, version: store.version, sistema: store.sistema })
                  setEditando(true)
                }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5a1.5 1.5 0 0 1 2.12 2.12L5 13.24l-3 .76.76-3L11.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {i.editar}
                </button>
              )
              : (
                <>
                  <button className="cfg-btn cfg-btn--primary" onClick={handleGuardar}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {i.guardar}
                  </button>
                  <button className="cfg-btn cfg-btn--ghost" onClick={handleCancelar}>
                    {i.cancelar}
                  </button>
                </>
              )
            }
          </div>
        </div>
      </div>

      {/* ── Lugares de liberación: Avispitas ── */}
      <Section title="Lugares de liberación — Avispitas">
        <LugaresEditor
          lugares={lugaresAvispitas}
          onCrear={nombre => crearAvispitas.mutate({ nombre })}
          onActualizar={(id, data) => actualizarAvispitas.mutate({ id, data })}
          onEliminar={id => eliminarAvispitas.mutate(id)}
        />
      </Section>

      {/* ── Lugares de liberación: Moscas ── */}
      <Section title="Lugares de liberación — Moscas">
        <LugaresEditor
          lugares={lugaresMoscas}
          onCrear={nombre => crearMoscas.mutate({ nombre })}
          onActualizar={(id, data) => actualizarMoscas.mutate({ id, data })}
          onEliminar={id => eliminarMoscas.mutate(id)}
        />
      </Section>
    </>
  )
}
