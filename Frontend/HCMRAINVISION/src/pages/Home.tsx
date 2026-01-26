/**
 * Home Page Component
 * Main page component containing all UI elements and state management
 */

import { useState, useMemo } from 'react';
import MapView from '../components/MapView';
import TimeSlider from '../components/TimeSlider';
import Legend from '../components/Legend';
import Header from '../components/Header';
import CameraList from '../components/CameraList';
import CameraDetailPanel from '../components/CameraDetailPanel';
import {
  generateAllMockData,
  generateTimestamps,
  CAMERA_LOCATIONS,
  getAllDistricts,
  getCameraInfo,
} from '../data/mockRainData';
import type { RainDataPoint, RainFilter } from '../types';
import { RAIN_LEVEL_CONFIG } from '../constants';

export default function Home() {
  // Generate static data once
  const timestamps = useMemo(() => generateTimestamps(), []);
  const allMockData = useMemo(() => generateAllMockData(), []);
  const districts = useMemo(() => getAllDistricts(), []);

  // State management
  const [currentTimestamp, setCurrentTimestamp] = useState<string>(
    timestamps[timestamps.length - 1]
  );
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [rainFilter, setRainFilter] = useState<RainFilter>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  // Get current rain data for selected timestamp
  const currentRainData: RainDataPoint[] = useMemo(() => {
    return allMockData[currentTimestamp] || [];
  }, [currentTimestamp, allMockData]);

  // Filter cameras based on search and filters
  const filteredCameras = useMemo(() => {
    return CAMERA_LOCATIONS.filter((camera) => {
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
        const rainPoint = currentRainData.find((p) => p.id === camera.id);
        const hasRain = rainPoint?.rainLevel && rainPoint.rainLevel > RAIN_LEVEL_CONFIG.NO_RAIN;
        if (rainFilter === 'rain' && !hasRain) return false;
        if (rainFilter === 'no-rain' && hasRain) return false;
      }

      return true;
    });
  }, [searchQuery, districtFilter, rainFilter, currentRainData]);

  // Get selected camera info
  const selectedCamera = useMemo(() => {
    if (!selectedCameraId) return null;
    return getCameraInfo(selectedCameraId);
  }, [selectedCameraId]);

  // Get selected camera rain data
  const selectedCameraRainData = useMemo(() => {
    if (!selectedCameraId) return null;
    return currentRainData.find((p) => p.id === selectedCameraId) || null;
  }, [selectedCameraId, currentRainData]);

  // Count cameras with rain
  const camerasWithRain = useMemo(() => {
    return currentRainData.filter((p) => p.rainLevel > RAIN_LEVEL_CONFIG.NO_RAIN).length;
  }, [currentRainData]);

  // Handle camera selection
  const handleCameraSelect = (cameraId: string) => {
    setSelectedCameraId(cameraId);
    setIsDetailPanelOpen(true);
  };

  // Handle close detail panel
  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        onSearchChange={setSearchQuery}
        onDistrictFilterChange={setDistrictFilter}
        onRainFilterChange={setRainFilter}
        districts={districts}
        totalCameras={CAMERA_LOCATIONS.length}
        camerasWithRain={camerasWithRain}
      />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Camera List */}
        <div className={`hidden sm:block transition-all duration-300 ${
          isSidebarCollapsed ? 'w-0' : 'w-80 lg:w-96'
        }`}>
          <CameraList
            cameras={filteredCameras}
            rainData={currentRainData}
            selectedCameraId={selectedCameraId}
            onCameraSelect={handleCameraSelect}
            searchQuery={searchQuery}
            districtFilter={districtFilter}
            rainFilter={rainFilter}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Map Section */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            <MapView
              rainData={currentRainData}
              cameras={filteredCameras}
              selectedCameraId={selectedCameraId}
              onCameraClick={handleCameraSelect}
            />
            <Legend />
          </div>

          {/* Time Slider */}
          <TimeSlider
            currentTimestamp={currentTimestamp}
            timestamps={timestamps}
            onTimestampChange={setCurrentTimestamp}
          />
        </div>
      </main>

      {/* Camera Detail Panel */}
      <CameraDetailPanel
        camera={selectedCamera}
        rainData={selectedCameraRainData}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseDetailPanel}
      />

      {/* Mobile Camera List Button */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="fixed bottom-20 right-4 sm:hidden z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle camera list"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Camera List Overlay */}
      {!isSidebarCollapsed && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-40 sm:hidden shadow-2xl">
            <CameraList
              cameras={filteredCameras}
              rainData={currentRainData}
              selectedCameraId={selectedCameraId}
              onCameraSelect={(id) => {
                handleCameraSelect(id);
                setIsSidebarCollapsed(true);
              }}
              searchQuery={searchQuery}
              districtFilter={districtFilter}
              rainFilter={rainFilter}
              isCollapsed={false}
              onToggleCollapse={() => setIsSidebarCollapsed(true)}
            />
          </div>
        </>
      )}
    </div>
  );
}
