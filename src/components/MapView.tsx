export default function MapView() {
  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Prescription Intensity Index
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Regional distribution of prescriptions per 1,000 inhabitants
        </p>
      </div>
      <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
        Map placeholder
      </div>
    </div>
  )
}
