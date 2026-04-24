import api from "./axiosInstance";
import { saveAs } from "file-saver";

const excel = async (url: string, params: object, filename: string) => {
  const res = await api.get(url, { params, responseType: "blob" });
  saveAs(res.data, filename);
};

// ── Producción ────────────────────────────────────────────────────────────────
export const descargarExcelSitotroga = (fi: string, ff: string) =>
  excel("/reportes/excel/sitotroga", { fecha_inicio: fi, fecha_fin: ff }, `sitotroga_${fi}_${ff}.xlsx`);

export const descargarExcelTrichogramma = (fi: string, ff: string) =>
  excel("/reportes/excel/trichogramma", { fecha_inicio: fi, fecha_fin: ff }, `trichogramma_${fi}_${ff}.xlsx`);

export const descargarExcelGalleria = (fi: string, ff: string) =>
  excel("/reportes/excel/galleria", { fecha_inicio: fi, fecha_fin: ff }, `galleria_${fi}_${ff}.xlsx`);

export const descargarExcelParatheresia = (fi: string, ff: string) =>
  excel("/reportes/excel/paratheresia", { fecha_inicio: fi, fecha_fin: ff }, `paratheresia_${fi}_${ff}.xlsx`);

// ── Notas de Salida ───────────────────────────────────────────────────────────
export const descargarExcelNotasSitodroga = (fi: string, ff: string) =>
  excel("/reportes/excel/notas/sitodroga", { fecha_inicio: fi, fecha_fin: ff }, `notas_sitodroga_${fi}_${ff}.xlsx`);

export const descargarExcelNotasAvispitas = (fi: string, ff: string) =>
  excel("/reportes/excel/notas/avispitas", { fecha_inicio: fi, fecha_fin: ff }, `notas_avispitas_${fi}_${ff}.xlsx`);

export const descargarExcelNotasMoscas = (fi: string, ff: string) =>
  excel("/reportes/excel/notas/moscas", { fecha_inicio: fi, fecha_fin: ff }, `notas_moscas_${fi}_${ff}.xlsx`);

export const descargarExcelNotasGalleria = (fi: string, ff: string) =>
  excel("/reportes/excel/notas/galleria", { fecha_inicio: fi, fecha_fin: ff }, `notas_galleria_${fi}_${ff}.xlsx`);