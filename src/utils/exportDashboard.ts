/**
 * Exportación del dashboard de producción a Excel (.xlsx) y PDF.
 *
 * Requiere instalar:
 *   npm install xlsx jspdf jspdf-autotable
 */
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

export type VistaExport = 'dia' | 'mes' | 'anio'

const VISTA_LABEL: Record<VistaExport, string> = { dia: 'Día', mes: 'Mes', anio: 'Año' }

export interface DatosExportables {
  vista: VistaExport
  fechaInicio: string
  fechaFin: string
  sitotroga: any[]
  trichogramma: any[]
  galleria: any[]
  paratheresia: any[]
  notasSit: any[]
  totales: {
    sitotroga: number
    trichogramma: number
    galleria: number
    paratheresia: number
  }
}

/** Imágenes PNG (base64) de los gráficos, obtenidas con chart.toBase64Image() de Chart.js. */
export interface ImagenesGraficos {
  bar?: string | null
  donut?: string | null
  line?: string | null
}

function nombreArchivo(base: string, ext: string, d: Pick<DatosExportables, 'fechaInicio' | 'fechaFin'>) {
  return `${base}_${d.fechaInicio}_a_${d.fechaFin}.${ext}`
}

/* ══════════════════════════════════════════════════════════
   EXCEL
═══════════════════════════════════════════════════════════ */
export function exportarDashboardExcel(datos: DatosExportables) {
  const wb = XLSX.utils.book_new()

  /* Hoja de resumen */
  const resumen = [
    ['Dashboard de Producción'],
    [`Periodo: ${datos.fechaInicio} a ${datos.fechaFin}`],
    [`Vista: ${VISTA_LABEL[datos.vista]}`],
    [],
    ['Especie', 'Total acumulado'],
    ['Sitotroga (g)', datos.totales.sitotroga],
    ['Trichogramma (pulg²)', datos.totales.trichogramma],
    ['Galleria (unid.)', datos.totales.galleria],
    ['Paratheresia (parejas)', datos.totales.paratheresia],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), 'Resumen')

  /* Una hoja por especie/registro, solo si tiene datos */
  const addHoja = (nombre: string, filas: any[]) => {
    if (!filas?.length) return
    const ws = XLSX.utils.json_to_sheet(filas)
    XLSX.utils.book_append_sheet(wb, ws, nombre.slice(0, 31)) // Excel limita nombres a 31 caracteres
  }
  addHoja('Sitotroga', datos.sitotroga)
  addHoja('Trichogramma', datos.trichogramma)
  addHoja('Galleria', datos.galleria)
  addHoja('Paratheresia', datos.paratheresia)
  addHoja('Notas Sitotroga', datos.notasSit)

  XLSX.writeFile(wb, nombreArchivo('dashboard_produccion', 'xlsx', datos))
}

/* ══════════════════════════════════════════════════════════
   PDF
═══════════════════════════════════════════════════════════ */
export function exportarDashboardPDF(datos: DatosExportables, imagenes: ImagenesGraficos = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const margenX = 40
  const anchoUtil = 515 // ancho A4 (595pt) menos márgenes de 40pt a cada lado
  const altoPagina = 780
  let y = 50

  doc.setFontSize(16)
  doc.text('Dashboard de Producción', margenX, y)
  y += 20
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Periodo: ${datos.fechaInicio} a ${datos.fechaFin}  ·  Vista: ${VISTA_LABEL[datos.vista]}`, margenX, y)
  doc.setTextColor(0)
  y += 20

  /* Tabla resumen de KPIs */
  autoTable(doc, {
    startY: y,
    margin: { left: margenX, right: margenX },
    head: [['Especie', 'Total acumulado']],
    body: [
      ['Sitotroga', `${datos.totales.sitotroga.toFixed(1)} g`],
      ['Trichogramma', `${datos.totales.trichogramma.toFixed(0)} pulg²`],
      ['Galleria', `${datos.totales.galleria.toFixed(0)} unid.`],
      ['Paratheresia', `${datos.totales.paratheresia.toFixed(0)} parejas`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [186, 117, 23] },
  })
  y = (doc as any).lastAutoTable.finalY + 20

  /* Gráficos como imágenes (si el gráfico correspondiente tenía datos) */
  const agregarImagen = (titulo: string, img: string | null | undefined, alto = 200) => {
    if (!img) return
    if (y + alto + 30 > altoPagina) { doc.addPage(); y = 50 }
    doc.setFontSize(11)
    doc.text(titulo, margenX, y)
    y += 10
    doc.addImage(img, 'PNG', margenX, y, anchoUtil, alto)
    y += alto + 20
  }
  agregarImagen('Producción diaria (Sitotroga + Trichogramma)', imagenes.bar)
  agregarImagen('Salidas Sitotroga', imagenes.donut, 180)
  agregarImagen('Galleria vs Paratheresia', imagenes.line)

  /* Tablas de detalle, una por especie, cada una en página nueva */
  const agregarTablaDetalle = (titulo: string, filas: any[], columnas: { header: string; key: string }[]) => {
    if (!filas?.length) return
    doc.addPage()
    y = 50
    doc.setFontSize(13)
    doc.text(titulo, margenX, y)
    autoTable(doc, {
      startY: y + 15,
      margin: { left: margenX, right: margenX },
      head: [columnas.map(c => c.header)],
      body: filas.map(f => columnas.map(c => String(f[c.key] ?? ''))),
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [80, 80, 80] },
    })
  }

  agregarTablaDetalle('Detalle Sitotroga', datos.sitotroga, [
    { header: 'Fecha', key: 'fecha' }, { header: 'Cantidad (g)', key: 'cantidad' },
  ])
  agregarTablaDetalle('Detalle Trichogramma', datos.trichogramma, [
    { header: 'Fecha', key: 'fecha' }, { header: 'Cantidad (pulg²)', key: 'cantidad' },
  ])
  agregarTablaDetalle('Detalle Galleria', datos.galleria, [
    { header: 'Fecha', key: 'fecha' }, { header: 'Cantidad (unid.)', key: 'cantidad' },
  ])
  agregarTablaDetalle('Detalle Paratheresia', datos.paratheresia, [
    { header: 'Fecha', key: 'fecha' }, { header: 'Cantidad (parejas)', key: 'cantidad' },
  ])

  doc.save(nombreArchivo('dashboard_produccion', 'pdf', datos))
}
