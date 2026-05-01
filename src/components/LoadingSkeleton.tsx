export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-white/10 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-white/10 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-white/10 rounded w-40"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-white/10 rounded w-28"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-white/10 rounded w-32"></div>
      </td>
    </tr>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowSkeleton key={index} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-effect rounded-2xl p-6 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
        <div className="h-4 bg-white/10 rounded w-4/6"></div>
      </div>
    </div>
  );
}
