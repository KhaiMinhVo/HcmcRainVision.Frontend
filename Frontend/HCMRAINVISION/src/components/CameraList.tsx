/**
 * CameraList Component
 * Sidebar displaying list of cameras with filtering and selection
 */

import { useMemo } from 'react';
import type { CameraInfo, RainDataPoint, RainFilter } from '../types';
import { RAIN_LEVEL_CONFIG } from '../constants';

interface CameraListProps {
  cameras: CameraInfo[];
  rainData: RainDataPoint[];
  selectedCameraId: string | null;
  onCameraSelect: (cameraId: string) => void;
  searchQuery: string;
  districtFilter: string;
  rainFilter: RainFilter;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * Get rain status information for a camera
 */
const getRainStatus = (rainLevel: number) => {
  if (rainLevel === RAIN_LEVEL_CONFIG.NO_RAIN) {
    return {
      level: RAIN_LEVEL_CONFIG.NO_RAIN,
      label: 'No Rain',
      color: 'bg-gray-200',
      textColor: 'text-gray-700',
    };
  }
  if (rainLevel === RAIN_LEVEL_CONFIG.LIGHT_RAIN) {
    return {
      level: RAIN_LEVEL_CONFIG.LIGHT_RAIN,
      label: 'Light Rain',
      color: 'bg-yellow-400',
      textColor: 'text-yellow-900',
    };
  }
  return {
    level: RAIN_LEVEL_CONFIG.HEAVY_RAIN,
    label: 'Heavy Rain',
    color: 'bg-red-500',
    textColor: 'text-white',
  };
};

export default function CameraList({
  cameras,
  rainData,
  selectedCameraId,
  onCameraSelect,
  searchQuery,
  districtFilter,
  rainFilter,
  isCollapsed,
  onToggleCollapse,
}: CameraListProps) {
  // Create a map of camera ID to rain level for efficient lookup
  const rainDataMap = useMemo(() => {
    const map = new Map<string, RainDataPoint>();
    rainData.forEach((point) => {
      map.set(point.id, point);
    });
    return map;
  }, [rainData]);

  // Filter cameras based on search, district, and rain status
  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          camera.name.toLowerCase().includes(query) ||
          camera.address.toLowerCase().includes(query) ||
          camera.ward.toLowerCase().includes(query) ||
          camera.district.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // District filter
      if (districtFilter !== 'all' && camera.district !== districtFilter) {
        return false;
      }

      // Rain filter
      if (rainFilter !== 'all') {
        const rainPoint = rainDataMap.get(camera.id);
        const hasRain = rainPoint?.rainLevel && rainPoint.rainLevel > RAIN_LEVEL_CONFIG.NO_RAIN;
        if (rainFilter === 'rain' && !hasRain) return false;
        if (rainFilter === 'no-rain' && hasRain) return false;
      }

      return true;
    });
  }, [cameras, searchQuery, districtFilter, rainFilter, rainDataMap]);

  // Collapsed state - show toggle button
  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white shadow-lg rounded-r-lg p-2 border border-gray-200 hover:bg-gray-50 transition-all"
        aria-label="Show camera list"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="w-full sm:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          Cameras ({filteredCameras.length})
        </h2>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          aria-label="Hide camera list"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCameras.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">No cameras found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCameras.map((camera) => {
              const rainPoint = rainDataMap.get(camera.id);
              const rainLevel = rainPoint?.rainLevel ?? RAIN_LEVEL_CONFIG.NO_RAIN;
              const rainStatus = getRainStatus(rainLevel);
              const isSelected = selectedCameraId === camera.id;

              return (
                <button
                  key={camera.id}
                  onClick={() => onCameraSelect(camera.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{camera.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${rainStatus.color} ${rainStatus.textColor} flex-shrink-0`}
                        >
                          {rainStatus.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{camera.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {camera.ward}, {camera.district}
                      </p>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
