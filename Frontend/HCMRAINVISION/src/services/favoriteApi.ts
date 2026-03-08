/**
 * Favorites API: GET/POST/DELETE /api/Favorite (requires auth)
 */
import { apiGet, apiPost, apiDelete } from './apiClient';
import type { CameraDto } from '../types/api';
import type { CameraInfo } from '../types';
import { mapCameraToInfo } from './cameraApi';
import { getWards, buildWardMap } from './locationApi';

export async function getFavorites(): Promise<CameraInfo[]> {
  const data = await apiGet<CameraDto[]>('api/Favorite');
  if (!Array.isArray(data)) return [];
  const wards = await getWards();
  const wardMap = buildWardMap(wards);
  return data.map((c) => mapCameraToInfo(c, wardMap));
}

export async function addFavorite(cameraId: string): Promise<void> {
  await apiPost(`api/Favorite/${encodeURIComponent(cameraId)}`, {});
}

export async function removeFavorite(cameraId: string): Promise<void> {
  await apiDelete(`api/Favorite/${encodeURIComponent(cameraId)}`);
}
