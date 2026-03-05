/**
 * Favorites API: GET/POST/DELETE /api/favorite (requires auth)
 */
import { apiGet, apiPost, apiDelete } from './apiClient';
import type { CameraDto } from '../types/api';
import type { CameraInfo } from '../types';
import { mapCameraToInfo } from './cameraApi';
import { getWards, buildWardMap } from './locationApi';

export async function getFavorites(): Promise<CameraInfo[]> {
  const data = await apiGet<CameraDto[]>('api/favorite');
  if (!Array.isArray(data)) return [];
  const wards = await getWards();
  const wardMap = buildWardMap(wards);
  return data.map((c) => mapCameraToInfo(c, wardMap));
}

export async function addFavorite(cameraId: string): Promise<void> {
  await apiPost(`api/favorite/${encodeURIComponent(cameraId)}`, {});
}

export async function removeFavorite(cameraId: string): Promise<void> {
  await apiDelete(`api/favorite/${encodeURIComponent(cameraId)}`);
}
