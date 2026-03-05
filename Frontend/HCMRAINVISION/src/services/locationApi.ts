/**
 * Location API: wards, districts, ward by id
 */
import { apiGet } from './apiClient';
import type { WardDto, WardDetailDto } from '../types/api';

export async function getWards(): Promise<WardDto[]> {
  const data = await apiGet<WardDto[]>('api/location/wards', { retries: 2 });
  return Array.isArray(data) ? data : [];
}

export async function getDistricts(): Promise<string[]> {
  const data = await apiGet<string[]>('api/location/districts', { retries: 2 });
  return Array.isArray(data) ? data : [];
}

export async function getWardsByDistrict(districtName: string): Promise<WardDto[]> {
  const encoded = encodeURIComponent(districtName);
  const data = await apiGet<WardDto[]>(`api/location/wards/by-district/${encoded}`, { retries: 2 });
  return Array.isArray(data) ? data : [];
}

/** GET /api/location/wards/{id} – ward detail by WardId */
export async function getWardById(id: string): Promise<WardDetailDto> {
  return apiGet<WardDetailDto>(`api/location/wards/${encodeURIComponent(id)}`);
}

/** Build a map WardId -> { wardName, districtName } for camera mapping */
export function buildWardMap(wards: WardDto[]): Map<string, { wardName: string; districtName: string }> {
  const map = new Map<string, { wardName: string; districtName: string }>();
  for (const w of wards) {
    map.set(w.WardId, {
      wardName: w.WardName,
      districtName: w.DistrictName ?? '',
    });
  }
  return map;
}
