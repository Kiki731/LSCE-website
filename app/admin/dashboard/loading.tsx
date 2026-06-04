function SkeletonCard() {
  return (
    <div className="bg-[#161616] border border-white/6 rounded-[16px] p-5 flex flex-col gap-2">
      <div className="h-2.5 w-20 bg-white/8 rounded-full animate-pulse" />
      <div className="h-7 w-28 bg-white/10 rounded-full animate-pulse mt-1" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {[180, 80, 40, 80, 80].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded-full bg-white/8 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function DashboardLoading() {
  return (
    <div className="p-8 flex flex-col gap-8">
      <div>
        <div className="h-6 w-32 bg-white/10 rounded-full animate-pulse" />
        <div className="h-3 w-48 bg-white/6 rounded-full animate-pulse mt-2" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-5 py-3">
                  <div className="h-2.5 w-12 bg-white/8 rounded-full animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
