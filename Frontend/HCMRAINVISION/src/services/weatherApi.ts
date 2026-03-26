/**
 * Weather API: latest, heatmap, check-route, report
 */
import { apiGet, apiPost, apiPostFormData } from './apiClient';
import type {
  WeatherLatestItemDto,
  HeatmapPointDto,
  ReportDto,
  RoutePointDto,
} from '../types/api';
import type { RainDataPoint, RainLevel } from '../types';

function rawToWeatherLatestItem(raw: Record<string, unknown>): WeatherLatestItemDto {
  return {
    Id: String((raw.cameraId ?? raw.CameraId) ?? ''), // Use CameraId for mapping, not WeatherLog.Id
    CameraId: String((raw.cameraId ?? raw.CameraId) ?? ''),
    Latitude: Number(raw.latitude ?? raw.Latitude ?? 0),
    Longitude: Number(raw.longitude ?? raw.Longitude ?? 0),
    IsRaining: Boolean(raw.isRaining ?? raw.IsRaining),
    Confidence: Number(raw.confidence ?? raw.Confidence ?? 0),
    TimeAgo: String((raw.timeAgo ?? raw.TimeAgo) ?? ''),
    Timestamp: String((raw.timestamp ?? raw.Timestamp) ?? ''),
  };
}

function rawToHeatmapPoint(raw: Record<string, unknown>): HeatmapPointDto {
  return {
    Lat: Number(raw.lat ?? raw.Lat ?? 0),
    Lng: Number(raw.lng ?? raw.Lng ?? 0),
    Intensity: Number(raw.intensity ?? raw.Intensity ?? 0),
  };
}

export async function getLatestWeather(): Promise<WeatherLatestItemDto[]> {
  const data = await apiGet<unknown>('api/Weather/latest', { retries: 2 });
  if (!Array.isArray(data)) return [];
  return data.map((item) => rawToWeatherLatestItem((item as Record<string, unknown>) ?? {}));
}

export async function getRainHeatmap(): Promise<HeatmapPointDto[]> {
  const data = await apiGet<unknown>('api/Weather/heatmap', { retries: 2 });
  if (!Array.isArray(data)) return [];
  return data.map((item) => rawToHeatmapPoint((item as Record<string, unknown>) ?? {}));
}

export async function checkRoute(routePoints: RoutePointDto[]): Promise<{
  IsSafe: boolean;
  Warnings: Array<{ Lat: number; Lng: number; Message: string }>;
}> {
  return apiPost('api/Weather/check-route', routePoints);
}

export async function reportIncorrectPrediction(body: ReportDto): Promise<{ message: string }> {
  return apiPost('api/Weather/report', body);
}

/** POST api/Weather/test-ai � upload image for AI prediction test (multipart). */
export async function testAi(imageFile: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('ImageFile', imageFile);
  return apiPostFormData<unknown>('api/Weather/test-ai', formData);
}

/** Map latest item to RainDataPoint (rainLevel from IsRaining + Confidence) */
export function mapLatestToRainPoint(item: WeatherLatestItemDto): RainDataPoint {
  let rainLevel: RainLevel = 0;
  if (item.IsRaining) {
    rainLevel = item.Confidence >= 0.7 ? 2 : 1;
  }
  return {
    id: String(item.Id),
    lat: item.Latitude,
    lng: item.Longitude,
    rainLevel,
    timestamp: item.Timestamp || item.TimeAgo, // ?u ti�n ISO timestamp, fallback sang TimeAgo
  };
}
