import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '@/hooks/useAuth'

const schema = z.object({
  email:    z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ 
    resolver: zodResolver(schema) 
  })
  const { mutate, isPending } = useLogin()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .vs-brand-name { font-family: 'DM Serif Display', serif; }
        .vs-heading    { font-family: 'DM Serif Display', serif; }
        .vs-body       { font-family: 'DM Sans', sans-serif; }
        .vs-left-overlay {
          background: linear-gradient(to top, rgba(10,40,20,.82) 0%, rgba(10,40,20,.15) 60%, transparent 100%);
        }
        .vs-badge {
          backdrop-filter: blur(4px);
          border: 0.5px solid rgba(255,255,255,.25);
          background: rgba(255,255,255,.12);
        }
        .vs-field-input:focus {
          border-color: #166534 !important;
          box-shadow: 0 0 0 3px rgba(22,101,52,.12) !important;
        }
        .vs-btn-login { transition: background .2s, transform .1s; }
        .vs-btn-login:hover:not(:disabled) { background: #14532d !important; }
        .vs-btn-login:active:not(:disabled) { transform: scale(.99); }
      `}</style>

      <div className="container-fluid vh-100 p-0 d-flex align-items-center justify-content-center bg-light">
        <div
          className="row g-0 overflow-hidden"
          style={{
            width: '100%', maxWidth: 900,
            borderRadius: 20,
            border: '0.5px solid #e5e7eb',
            boxShadow: '0 24px 64px rgba(0,0,0,.10)',
            minHeight: 580,
          }}
        >
          {/* ── Left Panel ── */}
          <div className="col-md-7 d-none d-md-flex position-relative">
            <img
              src="https://marverde.pe/wp-content/uploads/2023/07/AREAS-VERDES-PROYECTO-CORALES-MARVERDE-e1716326790651-1024x900.jpg"
              alt="ValleSol proyecto"
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 vs-left-overlay" />
            <div className="position-absolute bottom-0 start-0 p-4 pb-5" style={{ zIndex: 2 }}>
              <span className="d-inline-flex align-items-center gap-2 rounded-pill text-white vs-badge vs-body mb-3 px-3 py-1" style={{ fontSize: '.75rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                Portal de gestión activo
              </span>
              <h1 className="vs-heading text-white mb-2" style={{ fontSize: '1.9rem', lineHeight: 1.2 }}>
                Gestión integral<br /><em>vallesol</em>
              </h1>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="col-12 col-md-5 bg-white d-flex align-items-center justify-content-center p-5">
            <div style={{ width: '100%', maxWidth: 340 }}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: 10, background: '#166534' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#4ade80">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c8 0 6-8 14-8a4.38 4.38 0 010 .56A8 8 0 0017 8z"/>
                  </svg>
                </div>
                <span className="vs-brand-name" style={{ fontSize: '1.35rem', color: '#111' }}>
                  Valle<span style={{ color: '#166534' }}>Sol</span>
                </span>
              </div>

              <h2 className="vs-heading mb-1" style={{ fontSize: '1.55rem' }}>Bienvenido</h2>
              <p className="vs-body text-muted mb-4" style={{ fontSize: '.8rem' }}>Ingresa tus credenciales para continuar.</p>

              <form onSubmit={handleSubmit((d) => mutate(d))} noValidate>
                <div className="mb-3">
                  <label className="vs-body d-block mb-1 text-uppercase text-muted" style={{ fontSize: '.7rem', fontWeight: 500 }}>Correo electrónico</label>
                  <input
                    type="email"
                    className={`form-control vs-body vs-field-input ${errors.email ? 'is-invalid' : ''}`}
                    style={{ height: 44, background: '#f9fafb', borderRadius: 10 }}
                    {...register('email')}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>

                <div className="mb-4">
                  <label className="vs-body d-block mb-1 text-uppercase text-muted" style={{ fontSize: '.7rem', fontWeight: 500 }}>Contraseña</label>
                  <input
                    type="password"
                    className={`form-control vs-body vs-field-input ${errors.password ? 'is-invalid' : ''}`}
                    style={{ height: 44, background: '#f9fafb', borderRadius: 10 }}
                    {...register('password')}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="btn w-100 vs-body vs-btn-login text-white"
                  style={{ height: 46, background: '#166534', borderRadius: 10 }}
                >
                  {isPending ? 'Ingresando...' : 'Ingresar'}
                </button>

                <div className="d-flex align-items-center gap-2 my-4">
                  <hr className="grow m-0" />
                  <span className="vs-body text-muted" style={{ fontSize: '.7rem' }}>soporte</span>
                  <hr className="grow m-0" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}