/**
 * Fetches cameras, wards, weather latest; maps to CameraInfo and RainDataPoint[].
 */
import { useState, useCallback, useEffect } from 'react';
import * as cameraApi from '../services/cameraApi';
import * as weatherApi from '../services/weatherApi';
import * as locationApi from '../services/locationApi';
import type { CameraInfo, RainDataPoint } from '../types';

/** [lat, lng, intensity] for Leaflet heat layer */
export type HeatmapPoint = [number, number, number];

export interface UseCamerasAndWeatherResult {
  cameras: CameraInfo[];
  rainData: RainDataPoint[];
  heatmapPoints: HeatmapPoint[];
  districts: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCamerasAndWeather(): UseCamerasAndWeatherResult {
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [rainData, setRainData] = useState<RainDataPoint[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [camerasRaw, wards, latest, heatmap, districtsFromApi] = await Promise.all([
        cameraApi.getCameras(),
        locationApi.getWards(),
        weatherApi.getLatestWeather(),
        weatherApi.getRainHeatmap(),
        locationApi.getDistricts().catch(() => [] as string[]),
      ]);
      const wardMap = locationApi.buildWardMap(wards);
      const cameraList = camerasRaw.map((c) => cameraApi.mapCameraToInfo(c, wardMap));
      const districtSet = new Set<string>();
      cameraList.forEach((c) => {
        if (c.district) districtSet.add(c.district);
      });
      setCameras(cameraList);
      setRainData(latest.map(weatherApi.mapLatestToRainPoint));
      setHeatmapPoints(heatmap.map((p) => [p.Lat, p.Lng, p.Intensity]));
      const fallbackDistricts = Array.from(districtSet).sort();
      setDistricts(districtsFromApi.length > 0 ? districtsFromApi.sort() : fallbackDistricts);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Không tải được dữ liệu.';
      setError(msg);
      if (typeof console !== 'undefined' && console.error) console.error('[useCamerasAndWeather]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cameras, rainData, heatmapPoints, districts, loading, error, refetch };
}
