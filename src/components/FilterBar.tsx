export default function FilterBar() {
  return (
    <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        {['Timeline', 'Demographic', 'Cohorts'].map((filter) => (
          <div key={filter} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              {filter}
            </span>
            <button className="text-sm border border-gray-200 rounded-md px-3 py-1 text-gray-700 hover:bg-gray-50">
              Select ▾
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>Dataset range: 2006 — 2024</span>
        <div className="w-28 h-1 bg-blue-600 rounded-full" />
      </div>
    </div>
  )
}
