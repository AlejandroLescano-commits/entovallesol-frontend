import { useSitotroga, useTrichogramma, useGalleria, useParatheresia } from "@/hooks/useProduccion";

function KpiCard({ titulo, valor, unidad, color }: { titulo: string; valor: number; unidad: string; color: string }) {
  return (
    <div className={`rounded-xl border-l-4 bg-white shadow-sm p-5 ${color}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{titulo}</p>
      <p className="text-3xl font-bold mt-1">{valor.toLocaleString()}</p>
      <p className="text-xs text-gray-400 mt-1">{unidad}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: sitotroga = [] } = useSitotroga();
  const { data: trichogramma = [] } = useTrichogramma();
  const { data: galleria = [] } = useGalleria();
  const { data: paratheresia = [] } = useParatheresia();

  const saldoSitotroga = sitotroga.at(-1)?.saldo ?? 0;
  const saldoTrichogramma = trichogramma.at(-1)?.saldo ?? 0;
  const saldoGalleria = galleria.at(-1)?.saldo ?? 0;
  const saldoParatheresia = paratheresia.at(-1)?.saldo ?? 0;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5 text-gray-700">Resumen de Producción</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard titulo="Saldo Sitotroga" valor={saldoSitotroga} unidad="gramos" color="border-green-500" />
        <KpiCard titulo="Saldo Trichogramma" valor={saldoTrichogramma} unidad="pulg²" color="border-purple-500" />
        <KpiCard titulo="Saldo Galleria" valor={saldoGalleria} unidad="unidades" color="border-amber-500" />
        <KpiCard titulo="Saldo Paratheresia" valor={saldoParatheresia} unidad="parejas" color="border-teal-500" />
      </div>
    </div>
  );
}
