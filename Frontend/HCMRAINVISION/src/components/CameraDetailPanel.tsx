import { useEffect } from 'react';
import type { CameraInfo } from '../data/mockRainData';
import type { RainDataPoint } from '../data/mockRainData';

interface CameraDetailPanelProps {
  camera: CameraInfo | null;
  rainData: RainDataPoint | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraDetailPanel({
  camera,
  rainData,
  isOpen,
  onClose,
}: CameraDetailPanelProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!camera || !isOpen) return null;

  const getRainStatus = () => {
    if (!rainData || rainData.rainLevel === 0) {
      return {
        level: 0,
        label: 'No Rain',
        color: 'bg-gray-200',
        textColor: 'text-gray-700',
        icon: '☀️',
      };
    }
    if (rainData.rainLevel === 1) {
      return {
        level: 1,
        label: 'Light Rain',
        color: 'bg-yellow-400',
        textColor: 'text-yellow-900',
        icon: '🌦️',
      };
    }
    return {
      level: 2,
      label: 'Heavy Rain',
      color: 'bg-red-500',
      textColor: 'text-white',
      icon: '🌧️',
    };
  };

  const rainStatus = getRainStatus();
  const lastUpdate = rainData?.timestamp
    ? new Date(rainData.timestamp).toLocaleString('vi-VN')
    : 'N/A';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 lg:right-auto lg:left-auto lg:top-0 lg:bottom-0 lg:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{camera.name}</h2>
              <p className="text-xs text-gray-600 mt-1 truncate">{camera.district}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Rain Status Card */}
            <div className={`${rainStatus.color} ${rainStatus.textColor} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl mb-2">{rainStatus.icon}</div>
                  <div className="text-sm font-medium opacity-90">Rain Status</div>
                  <div className="text-2xl font-bold">{rainStatus.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75">Last Update</div>
                  <div className="text-sm font-medium">{lastUpdate}</div>
                </div>
              </div>
            </div>

            {/* Camera Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Camera Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="text-gray-900 font-medium">{camera.address}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-gray-600">Ward: </span>
                      <span className="text-gray-900 font-medium">{camera.ward}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">District: </span>
                      <span className="text-gray-900 font-medium">{camera.district}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Coordinates: </span>
                    <span className="text-gray-900 font-mono text-xs">
                      {camera.lat.toFixed(6)}, {camera.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Player Section */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                {/* Mock Video Placeholder */}
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Live Camera Feed</p>
                  <p className="text-xs mt-1 opacity-75">Mock Video Stream</p>
                </div>
                
                {/* Rain Overlay Indicator */}
                {rainStatus.level > 0 && (
                  <div className="absolute top-2 right-2">
                    <div className={`${rainStatus.color} ${rainStatus.textColor} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                      <span>{rainStatus.icon}</span>
                      <span>{rainStatus.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recent History</h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {new Date(Date.now() - i * 5 * 60 * 1000).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        Math.random() > 0.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {Math.random() > 0.5 ? 'Light Rain' : 'No Rain'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                // Navigate to map location
                onClose();
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View on Map
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

