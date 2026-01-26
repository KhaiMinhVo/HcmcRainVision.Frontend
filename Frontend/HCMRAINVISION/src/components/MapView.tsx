/**
 * MapView Component
 * Displays an interactive map with camera markers and rain data visualization
 */

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RainDataPoint, CameraInfo } from '../types';
import { HCMC_CENTER, MAP_CONFIG, RAIN_LEVEL_CONFIG } from '../constants';

interface MapViewProps {
  rainData: RainDataPoint[];
  cameras: CameraInfo[];
  selectedCameraId: string | null;
  onCameraClick: (cameraId: string) => void;
}

/**
 * Fix for default marker icons in React-Leaflet
 * This runs once on module load to fix icon paths
 */
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

/**
 * MapUpdater Component
 * Handles map marker updates when data changes
 */
function MapUpdater({
  rainData,
  cameras,
  selectedCameraId,
  onCameraClick,
}: {
  rainData: RainDataPoint[];
  cameras: CameraInfo[];
  selectedCameraId: string | null;
  onCameraClick: (cameraId: string) => void;
}) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const popupsRef = useRef<Map<string, L.Popup>>(new Map());

  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    popupsRef.current.forEach((popup) => {
      map.removeLayer(popup);
    });
    markersRef.current.clear();
    popupsRef.current.clear();

    // Create maps for efficient lookup
    const rainDataMap = new Map<string, RainDataPoint>();
    rainData.forEach((point) => {
      rainDataMap.set(point.id, point);
    });

    const cameraMap = new Map<string, CameraInfo>();
    cameras.forEach((camera) => {
      cameraMap.set(camera.id, camera);
    });

    // Marker color configuration
    const MARKER_COLORS = {
      [RAIN_LEVEL_CONFIG.NO_RAIN]: '#9ca3af',
      [RAIN_LEVEL_CONFIG.LIGHT_RAIN]: '#eab308',
      [RAIN_LEVEL_CONFIG.HEAVY_RAIN]: '#ef4444',
      SELECTED: '#3b82f6',
    } as const;

    const MARKER_RADIUS = {
      [RAIN_LEVEL_CONFIG.NO_RAIN]: 6,
      [RAIN_LEVEL_CONFIG.LIGHT_RAIN]: 10,
      [RAIN_LEVEL_CONFIG.HEAVY_RAIN]: 14,
    } as const;

    // Add markers for all cameras
    cameras.forEach((camera) => {
      const rainPoint = rainDataMap.get(camera.id);
      const rainLevel = rainPoint?.rainLevel ?? RAIN_LEVEL_CONFIG.NO_RAIN;
      const isSelected = selectedCameraId === camera.id;

      const color = MARKER_COLORS[rainLevel];
      const radius = MARKER_RADIUS[rainLevel];

      const marker = L.circleMarker([camera.lat, camera.lng], {
        radius,
        fillColor: color,
        color: isSelected ? MARKER_COLORS.SELECTED : color,
        weight: isSelected ? 4 : 2,
        opacity: 0.9,
        fillOpacity: 0.7,
        className: 'cursor-pointer transition-all',
      });

      // Click handler
      marker.on('click', () => {
        onCameraClick(camera.id);
        map.setView(
          [camera.lat, camera.lng],
          Math.max(map.getZoom(), MAP_CONFIG.MIN_ZOOM_ON_SELECT),
          { animate: true }
        );
      });

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2';
      
      const rainStatusClass =
        rainLevel === RAIN_LEVEL_CONFIG.NO_RAIN
          ? 'bg-gray-200 text-gray-700'
          : rainLevel === RAIN_LEVEL_CONFIG.LIGHT_RAIN
          ? 'bg-yellow-400 text-yellow-900'
          : 'bg-red-500 text-white';

      const rainStatusText =
        rainLevel === RAIN_LEVEL_CONFIG.NO_RAIN
          ? 'No Rain'
          : rainLevel === RAIN_LEVEL_CONFIG.LIGHT_RAIN
          ? 'Light Rain'
          : 'Heavy Rain';

      popupContent.innerHTML = `
        <h3 class="font-semibold text-sm mb-1">${camera.name}</h3>
        <p class="text-xs text-gray-600 mb-2">${camera.ward}, ${camera.district}</p>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-xs ${rainStatusClass}">
            ${rainStatusText}
          </span>
        </div>
        <button class="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium view-details-btn">
          View Details →
        </button>
      `;

      // Add click handler to popup button
      const viewDetailsBtn = popupContent.querySelector('.view-details-btn');
      if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onCameraClick(camera.id);
          map.closePopup();
        });
      }

      const popup = L.popup({
        className: 'custom-popup',
        maxWidth: 250,
      }).setContent(popupContent);

      marker.bindPopup(popup);

      // Hover effects
      marker.on('mouseover', function () {
        this.setStyle({
          weight: 4,
          fillOpacity: 0.9,
        });
        marker.openPopup();
      });

      marker.on('mouseout', function () {
        if (!isSelected) {
          this.setStyle({
            weight: 2,
            fillOpacity: 0.7,
          });
        }
      });

      marker.addTo(map);
      markersRef.current.set(camera.id, marker);
      popupsRef.current.set(camera.id, popup);
    });

    // Zoom to selected camera
    if (selectedCameraId) {
      const selectedCamera = cameraMap.get(selectedCameraId);
      if (selectedCamera) {
        map.setView(
          [selectedCamera.lat, selectedCamera.lng],
          Math.max(map.getZoom(), MAP_CONFIG.MIN_ZOOM_ON_SELECT),
          { animate: true }
        );
      }
    }

    return () => {
      markersRef.current.forEach((marker) => {
        map.removeLayer(marker);
      });
      popupsRef.current.forEach((popup) => {
        map.removeLayer(popup);
      });
    };
  }, [rainData, cameras, selectedCameraId, map, onCameraClick]);

  return null;
}

/**
 * MapView Component
 * Main map component displaying HCMC with camera markers
 */
export default function MapView({
  rainData,
  cameras,
  selectedCameraId,
  onCameraClick,
}: MapViewProps) {
  const hcmcCenter: [number, number] = [HCMC_CENTER.lat, HCMC_CENTER.lng];

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={hcmcCenter}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater
          rainData={rainData}
          cameras={cameras}
          selectedCameraId={selectedCameraId}
          onCameraClick={onCameraClick}
        />
      </MapContainer>
    </div>
  );
}
