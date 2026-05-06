'use client'
import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { t } from '@/i18n'

const LUGARES = [
  'San Ricardo A', 'San Ricardo B', 'Quemazón', 'Trapiche',
  'Segundo Jirón', 'Pabellón alto', 'Sacachique', 'La Encantada',
]

export default function ConfiguracionPage() {
  const store = useSettingsStore()
  const i = t[store.lang]

  const [editando, setEditando] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draft, setDraft] = useState({
    empresa: store.empresa,
    version: store.version,
    sistema: store.sistema,
  })

  const handleGuardar = () => {
    store.setEmpresa(draft.empresa)
    store.setVersion(draft.version)
    store.setSistema(draft.sistema)
    setEditando(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancelar = () => {
    setDraft({ empresa: store.empresa, version: store.version, sistema: store.sistema })
    setEditando(false)
  }

  const temaOpciones = [
    { value: 'light', label: i.claro, icon: '☀️' },
    { value: 'dark',  label: i.oscuro, icon: '🌙' },
    { value: 'system', label: i.automatico, icon: '💻' },
  ] as const

  const campos = [
    { key: 'version' as const, label: i.version },
    { key: 'empresa' as const, label: i.empresa },
    { key: 'sistema' as const, label: i.sistema },
  ]

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">{i.configuracion}</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>{i.parametros}</p>
      </div>

      {/* ── Apariencia ── */}
      <div className="vs-card mb-3">
        <h6 className="fw-semibold mb-3">{i.apariencia}</h6>
        <div className="row g-3">
          {/* Tema */}
          <div className="col-md-6">
            <label className="text-muted mb-2 d-block" style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {i.tema}
            </label>
            <div className="d-flex gap-2">
              {temaOpciones.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => store.setTheme(value)}
                  className={`btn btn-sm ${store.theme === value ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ flex: 1 }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Idioma */}
          <div className="col-md-6">
            <label className="text-muted mb-2 d-block" style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {i.idioma}
            </label>
            <div className="d-flex gap-2">
              {([['es', `🇵🇪 ${i.espanol}`], ['en', `🇺🇸 ${i.ingles}`]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => store.setLang(val)}
                  className={`btn btn-sm ${store.lang === val ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ flex: 1 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos de empresa ── */}
      <div className="vs-card mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold mb-0">{i.datosEmpresa}</h6>
          {saved && <span className="text-success small">{i.guardado}</span>}
        </div>

        <div className="row g-3 mb-3">
          {campos.map(({ key, label }) => (
            <div key={key} className="col-md-4">
              <label className="text-muted mb-1 d-block" style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {label}
              </label>
              {editando ? (
                <input
                  className="form-control form-control-sm"
                  value={draft[key]}
                  onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
                />
              ) : (
                <div className="fw-semibold">{store[key]}</div>
              )}
            </div>
          ))}
        </div>

        <div className="d-flex gap-2">
          {!editando ? (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => {
              setDraft({ empresa: store.empresa, version: store.version, sistema: store.sistema })
              setEditando(true)
            }}>
              ✏️ {i.editar}
            </button>
          ) : (
            <>
              <button className="btn btn-sm btn-primary" onClick={handleGuardar}>💾 {i.guardar}</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={handleCancelar}>{i.cancelar}</button>
            </>
          )}
        </div>
      </div>

      {/* ── Lugares ── */}
      <div className="vs-card">
        <h6 className="fw-semibold mb-3">{i.lugares}</h6>
        <div className="d-flex flex-wrap gap-2">
          {LUGARES.map(l => (
            <span key={l} className="badge bg-light text-dark border">{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
