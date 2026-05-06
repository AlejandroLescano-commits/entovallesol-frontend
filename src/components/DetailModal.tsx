import type { ReactNode } from 'react'

interface Field {
  label: string
  value: ReactNode
}

interface Props {
  title: string
  fields: Field[]
  onClose: () => void
}

export function DetailModal({ title, fields, onClose }: Props) {
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.45)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header" style={{ borderBottom: '2px solid #e5e7eb' }}>
            <h5 className="modal-title fw-bold" style={{ fontSize: '.95rem' }}>
              🔍 {title}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
            <dl className="row mb-0" style={{ rowGap: '.5rem' }}>
              {fields.map(({ label, value }) => (
                value !== undefined && value !== null && value !== '' ? (
                  <>
                    <dt key={`dt-${label}`} className="col-sm-5" style={{ fontSize: '.8rem', color: '#6b7280', fontWeight: 500 }}>{label}</dt>
                    <dd key={`dd-${label}`} className="col-sm-7 mb-0" style={{ fontSize: '.88rem', color: '#111827' }}>{value}</dd>
                  </>
                ) : (
                  <>
                    <dt key={`dt-${label}`} className="col-sm-5" style={{ fontSize: '.8rem', color: '#6b7280', fontWeight: 500 }}>{label}</dt>
                    <dd key={`dd-${label}`} className="col-sm-7 mb-0" style={{ fontSize: '.88rem', color: '#9ca3af' }}>—</dd>
                  </>
                )
              ))}
            </dl>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid #f3f4f6' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Botón ojito estándar */
export function EyeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="btn btn-sm btn-outline-secondary"
      style={{ fontSize: '.72rem', padding: '2px 7px', lineHeight: 1.4 }}
      title="Ver detalle"
      onClick={onClick}
    >
      👁
    </button>
  )
}
