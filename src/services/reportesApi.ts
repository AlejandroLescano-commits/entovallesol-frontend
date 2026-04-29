import api from "./axiosInstance";
import { saveAs } from "file-saver";

const excel = async (url: string, params: object, filename: string) => {
  const res = await api.get(url, { params, responseType: "blob" });
  saveAs(res.data, filename);
};

// ── Notas de Salida (rango de fechas) ────────────────────────────────────────
export const descargarExcelNotasSitodroga = (fi: string, ff: string) =>
  excel("/reportes/excel/notas/sitodroga", { fecha_inicio: fi, fecha_fin: ff }, `notas_sitodroga_${fi}_${ff}.xlsx`);

export const descargarExcelNotasAvispitas = (fi: string, ff: string) =>
  excel("/reportes/excel/notas/avispitas", { fecha_inicio: fi, fecha_fin: ff }, `notas_avispitas_${fi}_${ff}.xlsx`);

export const descargarExcelNotasMoscas = (fi: string, ff: string) =>
  excel("/reportes/excel/notas/moscas", { fecha_inicio: fi, fecha_fin: ff }, `notas_moscas_${fi}_${ff}.xlsx`);

export const descargarExcelNotasGalleria = (fi: string, ff: string) =>
  excel("/reportes/excel/notas/galleria", { fecha_inicio: fi, fecha_fin: ff }, `notas_galleria_${fi}_${ff}.xlsx`);

// ── Producción Mensual (mes + año) ───────────────────────────────────────────
// ── Producción Mensual ────────────────────────────────────────────────────────
export const descargarExcelSitotroga = (mes: number, anio: number) =>
  excel("/reportes/excel/sitotroga/mensual", { mes, anio }, `sitotroga_${anio}_${String(mes).padStart(2,'0')}.xlsx`);

export const descargarExcelTrichogramma = (mes: number, anio: number) =>
  excel("/reportes/excel/trichogramma/mensual", { mes, anio }, `trichogramma_${anio}_${String(mes).padStart(2,'0')}.xlsx`);

export const descargarExcelParatheresia = (mes: number, anio: number) =>
  excel("/reportes/excel/paratheresia/mensual", { mes, anio }, `paratheresia_${anio}_${String(mes).padStart(2,'0')}.xlsx`);

export const descargarExcelGalleria = (mes: number, anio: number) =>
  excel("/reportes/excel/galleria/mensual", { mes, anio }, `galleria_${anio}_${String(mes).padStart(2,'0')}.xlsx`);
