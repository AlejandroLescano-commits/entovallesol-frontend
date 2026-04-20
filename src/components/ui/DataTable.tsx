interface Column<T> { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode; }

interface Props<T> { columns: Column<T>[]; data: T[]; loading?: boolean; }

export default function DataTable<T extends Record<string, unknown>>({ columns, data, loading }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-left font-semibold text-gray-600">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-8 text-gray-400">Cargando...</td></tr>
          ) : data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-2.5 text-gray-700">
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
