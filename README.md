# entovallesol-frontend

Frontend del Sistema de Control y Registro de Producción Entomológica — **ValleSol S.A.C.**

## Stack
- **React 18** + **TypeScript**
- **Vite** — bundler
- **React Router v6** — navegación
- **TanStack Query** — caché y fetching de datos
- **Zustand** — estado global
- **React Hook Form + Zod** — formularios y validación
- **Recharts** — gráficas de producción
- **Tailwind CSS** — estilos

## Instalación
```bash
npm install
cp .env.example .env
npm run dev
```

## Módulos
| Ruta | Descripción |
|------|-------------|
| `/login` | Autenticación |
| `/dashboard` | KPIs y resumen general |
| `/produccion/sitotroga` | Registro diario Sitotroga |
| `/produccion/trichogramma` | Registro Trichogramma exiguum/pretiosum |
| `/produccion/galleria` | Registro Galleria mellonella |
| `/produccion/paratheresia` | Registro Paratheresia claripalpis |
| `/distribucion` | Salidas a fincas y sectores |
| `/inventario` | Saldos en tiempo real |
| `/reportes` | Exportar PDF y Excel |
| `/importacion` | Carga masiva Excel |
| `/usuarios` | CRUD de usuarios (admin) |
| `/configuracion` | Parámetros del sistema |
