import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props { data: { fecha: string; produccion: number; saldo: number }[]; titulo: string; }

export default function ProduccionChart({ data, titulo }: Props) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">{titulo}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="produccion" stroke="#1D9E75" strokeWidth={2} dot={false} name="Producción/día" />
          <Line type="monotone" dataKey="saldo" stroke="#534AB7" strokeWidth={2} dot={false} name="Saldo" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
