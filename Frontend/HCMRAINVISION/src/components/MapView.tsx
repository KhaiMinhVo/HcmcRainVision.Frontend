import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RainDataPoint } from '../data/mockRainData';
import type { CameraInfo } from '../data/mockRainData';

interface MapViewProps {
  rainData: RainDataPoint[];
  cameras: CameraInfo[];
  selectedCameraId: string | null;
  onCameraClick: (cameraId: string) => void;
}

// Fix for default marker icons in React-Leaflet (runs once on module load)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Component to update map view when data changes
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

    // Create a map of camera ID to rain level
    const rainDataMap = new Map<string, RainDataPoint>();
    rainData.forEach((point) => {
      rainDataMap.set(point.id, point);
    });

    // Create a map of camera ID to camera info
    const cameraMap = new Map<string, CameraInfo>();
    cameras.forEach((camera) => {
      cameraMap.set(camera.id, camera);
    });

    // Add markers for all cameras
    cameras.forEach((camera) => {
      const rainPoint = rainDataMap.get(camera.id);
      const rainLevel = rainPoint?.rainLevel || 0;

      // Skip no rain points (optional - you can show all cameras)
      // if (rainLevel === 0) return;

      const color = rainLevel === 0 ? '#9ca3af' : rainLevel === 1 ? '#eab308' : '#ef4444';
      const radius = rainLevel === 0 ? 6 : rainLevel === 1 ? 10 : 14;
      const isSelected = selectedCameraId === camera.id;

      const marker = L.circleMarker([camera.lat, camera.lng], {
        radius,
        fillColor: color,
        color: isSelected ? '#3b82f6' : color,
        weight: isSelected ? 4 : 2,
        opacity: 0.9,
        fillOpacity: 0.7,
        className: 'cursor-pointer transition-all',
      });

      // Add click handler
      marker.on('click', () => {
        onCameraClick(camera.id);
        // Zoom to camera
        map.setView([camera.lat, camera.lng], Math.max(map.getZoom(), 14), {
          animate: true,
        });
      });

      // Create popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2';
      popupContent.innerHTML = `
        <h3 class="font-semibold text-sm mb-1">${camera.name}</h3>
        <p class="text-xs text-gray-600 mb-2">${camera.ward}, ${camera.district}</p>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-xs ${
            rainLevel === 0
              ? 'bg-gray-200 text-gray-700'
              : rainLevel === 1
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-red-500 text-white'
          }">
            ${rainLevel === 0 ? 'No Rain' : rainLevel === 1 ? 'Light Rain' : 'Heavy Rain'}
          </span>
        </div>
        <button class="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium view-details-btn">
          View Details →
        </button>
      `;

      // Add click handler to button
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

      // Add hover effects
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

    // If a camera is selected, zoom to it
    if (selectedCameraId) {
      const selectedCamera = cameraMap.get(selectedCameraId);
      if (selectedCamera) {
        map.setView([selectedCamera.lat, selectedCamera.lng], Math.max(map.getZoom(), 14), {
          animate: true,
        });
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

export default function MapView({
  rainData,
  cameras,
  selectedCameraId,
  onCameraClick,
}: MapViewProps) {
  // Ho Chi Minh City center coordinates
  const hcmcCenter: [number, number] = [10.8231, 106.6297];

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={hcmcCenter}
        zoom={12}
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
