export default function Legend() {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] border border-gray-200 max-w-xs">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Rain Level Legend
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-gray-400 flex-shrink-0"></div>
          <div className="flex-1">
            <span className="text-xs font-medium text-gray-700">No Rain</span>
            <p className="text-xs text-gray-500">Clear weather</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-500 flex-shrink-0"></div>
          <div className="flex-1">
            <span className="text-xs font-medium text-gray-700">Light Rain</span>
            <p className="text-xs text-gray-500">Drizzle or light showers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-600 flex-shrink-0"></div>
          <div className="flex-1">
            <span className="text-xs font-medium text-gray-700">Heavy Rain</span>
            <p className="text-xs text-gray-500">Heavy downpour detected</p>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Click on markers to view camera details
        </p>
      </div>
    </div>
  );
}
