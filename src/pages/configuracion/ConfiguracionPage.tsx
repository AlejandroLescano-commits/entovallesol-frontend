export default function ConfiguracionPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Configuración</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Parámetros del sistema</p>
      </div>
      <div className="row g-3">
        {[
          { label: 'Versión', value: '1.0.0' },
          { label: 'Empresa', value: 'ValleSol S.A.C.' },
          { label: 'Sistema', value: 'Producción Entomológica' },
        ].map(({ label, value }) => (
          <div key={label} className="col-md-4">
            <div className="vs-stat-card">
              <div className="text-muted mb-1" style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
              <div className="fw-semibold">{value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="vs-card mt-4">
        <h6 className="fw-semibold mb-3">Lugares de liberación disponibles</h6>
        <div className="d-flex flex-wrap gap-2">
          {['San Ricardo A', 'San Ricardo B', 'Quemazón', 'Trapiche', 'Segundo Jirón', 'Pabellón alto', 'Sacachique', 'La Encantada'].map(l => (
            <span key={l} className="badge bg-light text-dark border">{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}