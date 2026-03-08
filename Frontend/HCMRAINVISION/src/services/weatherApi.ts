/**
 * Weather API: latest, heatmap, check-route, report
 */
import { apiGet, apiPost } from './apiClient';
import type {
  WeatherLatestItemDto,
  HeatmapPointDto,
  ReportDto,
  RoutePointDto,
} from '../types/api';
import type { RainDataPoint, RainLevel } from '../types';

export async function getLatestWeather(): Promise<WeatherLatestItemDto[]> {
  const data = await apiGet<WeatherLatestItemDto[]>('api/Weather/latest', { retries: 2 });
  return Array.isArray(data) ? data : [];
}

export async function getRainHeatmap(): Promise<HeatmapPointDto[]> {
  const data = await apiGet<HeatmapPointDto[]>('api/Weather/heatmap', { retries: 2 });
  return Array.isArray(data) ? data : [];
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
    timestamp: item.TimeAgo,
  };
}
