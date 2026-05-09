interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  loading?: boolean
}

export default function DataTable<T extends { id: number }>({
  columns, data, onRowClick, loading,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Loading...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        No data found.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, i) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
