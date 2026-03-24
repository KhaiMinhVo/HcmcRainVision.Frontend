/**
 * MapView Component
 * Displays an interactive Google Map with camera markers and rain data visualization.
 * Uses @react-google-maps/api with useJsApiLoader for async API loading.
 */

import { useCallback, useRef, useMemo, useEffect } from 'react';
import {
  GoogleMap,
  HeatmapLayer,
  useJsApiLoader,
} from '@react-google-maps/api';
import type { RainDataPoint, CameraInfo } from '../types';
import type { HeatmapPoint } from '../hooks/useCamerasAndWeather';
import { HCMC_CENTER, HEATMAP_CONFIG, MAP_CONFIG, RAIN_LEVEL_CONFIG } from '../constants';

interface MapViewProps {
  rainData: RainDataPoint[];
  cameras: CameraInfo[];
  selectedCameraId: string | null;
  onCameraClick: (cameraId: string) => void;
  heatmapPoints?: HeatmapPoint[];
  showHeatmap?: boolean;
}

const GOOGLE_MAPS_LIBRARIES: ('visualization' | 'marker')[] = ['visualization', 'marker'];

function getGoogleMapsApiKey(): string {
  if (typeof window !== 'undefined' && window.__GOOGLE_MAPS_API_KEY__) {
    return window.__GOOGLE_MAPS_API_KEY__;
  }
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
}

const MARKER_COLORS = {
  [RAIN_LEVEL_CONFIG.NO_RAIN]: '#9ca3af',
  [RAIN_LEVEL_CONFIG.LIGHT_RAIN]: '#eab308',
  [RAIN_LEVEL_CONFIG.HEAVY_RAIN]: '#ef4444',
  SELECTED: '#3b82f6',
} as const;

const MARKER_SCALE = {
  [RAIN_LEVEL_CONFIG.NO_RAIN]: 6,
  [RAIN_LEVEL_CONFIG.LIGHT_RAIN]: 10,
  [RAIN_LEVEL_CONFIG.HEAVY_RAIN]: 14,
} as const;

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const MAP_CENTER = { lat: HCMC_CENTER.lat, lng: HCMC_CENTER.lng };

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
  clickableIcons: false,
  // Required by AdvancedMarkerElement; DEMO_MAP_ID works for dev/demo usage.
  mapId: 'DEMO_MAP_ID',
};

export default function MapView({
  rainData,
  cameras,
  selectedCameraId,
  onCameraClick,
  heatmapPoints = [],
  showHeatmap = false,
}: MapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    markerListenersRef.current.forEach((listener) => listener.remove());
    markerListenersRef.current = [];
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }
    mapRef.current = null;
  }, []);

  // Build rainData lookup: cameraId → RainDataPoint
  const rainDataMap = useMemo(() => {
    const m = new Map<string, RainDataPoint>();
    rainData.forEach((p) => m.set(p.id, p));
    return m;
  }, [rainData]);

  const handleMarkerClick = useCallback(
    (cameraId: string, lat: number, lng: number) => {
      onCameraClick(cameraId);
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        const zoom = mapRef.current.getZoom() ?? MAP_CONFIG.DEFAULT_ZOOM;
        if (zoom < MAP_CONFIG.MIN_ZOOM_ON_SELECT) {
          mapRef.current.setZoom(MAP_CONFIG.MIN_ZOOM_ON_SELECT);
        }
      }
    },
    [onCameraClick]
  );

  const buildInfoWindowContent = useCallback(
    (camera: CameraInfo, rainLevel: number) => {
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

      return `
        <div style="padding: 8px; min-width: 160px;">
          <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">${camera.name}</h3>
          <p style="font-size: 12px; color: #4b5563; margin: 0 0 8px 0;">${camera.ward}, ${camera.district}</p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="${rainStatusClass}" style="padding: 2px 8px; border-radius: 6px; font-size: 12px;">
              ${rainStatusText}
            </span>
          </div>
          <button id="map-view-details-${camera.id}" style="font-size: 12px; color: #2563eb; font-weight: 500; border: none; background: transparent; cursor: pointer; padding: 0;">
            View Details →
          </button>
        </div>
      `;
    },
    []
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!isLoaded || !map || !google.maps.marker?.AdvancedMarkerElement) return;

    markerListenersRef.current.forEach((listener) => listener.remove());
    markerListenersRef.current = [];
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    const infoWindow = infoWindowRef.current ?? new google.maps.InfoWindow();
    infoWindowRef.current = infoWindow;

    cameras.forEach((camera) => {
      const rainPoint = rainDataMap.get(camera.id);
      const rainLevel = rainPoint?.rainLevel ?? RAIN_LEVEL_CONFIG.NO_RAIN;
      const isSelected = selectedCameraId === camera.id;
      const color = MARKER_COLORS[rainLevel];
      const scale = MARKER_SCALE[rainLevel];

      const markerNode = document.createElement('div');
      markerNode.style.width = `${scale * 2}px`;
      markerNode.style.height = `${scale * 2}px`;
      markerNode.style.borderRadius = '50%';
      markerNode.style.backgroundColor = color;
      markerNode.style.opacity = '0.75';
      markerNode.style.border = `${isSelected ? 4 : 2}px solid ${isSelected ? MARKER_COLORS.SELECTED : color}`;
      markerNode.style.boxSizing = 'border-box';
      markerNode.style.cursor = 'pointer';

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: camera.lat, lng: camera.lng },
        content: markerNode,
        title: camera.name,
      });

      const clickListener = marker.addListener('gmp-click', () => {
        handleMarkerClick(camera.id, camera.lat, camera.lng);
      });
      markerListenersRef.current.push(clickListener);

      markerNode.addEventListener('mouseenter', () => {
        infoWindow.setContent(buildInfoWindowContent(camera, rainLevel));
        infoWindow.open({ map, anchor: marker });

        const id = `map-view-details-${camera.id}`;
        // Wait for InfoWindow DOM mount before binding click handler
        setTimeout(() => {
          const btn = document.getElementById(id);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              onCameraClick(camera.id);
              infoWindow.close();
            };
          }
        }, 0);
      });

      markerNode.addEventListener('mouseleave', () => {
        infoWindow.close();
      });

      markersRef.current.push(marker);
    });

    return () => {
      markerListenersRef.current.forEach((listener) => listener.remove());
      markerListenersRef.current = [];
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];
      infoWindow.close();
    };
  }, [isLoaded, cameras, rainDataMap, selectedCameraId, handleMarkerClick, onCameraClick, buildInfoWindowContent]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-sm">Không tải được Google Maps. Kiểm tra API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Đang tải bản đồ...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={MAP_CENTER}
      zoom={MAP_CONFIG.DEFAULT_ZOOM}
      options={MAP_OPTIONS}
      onLoad={onMapLoad}
      onUnmount={onMapUnmount}
    >
      {showHeatmap && heatmapPoints.length > 0 && (
        <HeatmapLayer
          data={heatmapPoints.map((p) => ({
            location: new google.maps.LatLng(p.lat, p.lng),
            weight: p.weight,
          }))}
          options={{
            radius: HEATMAP_CONFIG.RADIUS,
            opacity: 0.7,
            maxIntensity: HEATMAP_CONFIG.MAX,
          }}
        />
      )}
    </GoogleMap>
  );
}
