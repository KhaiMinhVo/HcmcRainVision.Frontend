/**
 * Camera API: GET /api/camera
 */
import { apiGet } from './apiClient';
import type { CameraDto } from '../types/api';
import type { CameraInfo } from '../types';

export async function getCameras(): Promise<CameraDto[]> {
  const data = await apiGet<CameraDto[]>('api/camera', { retries: 2 });
  return Array.isArray(data) ? data : [];
}

/** Map backend camera to app CameraInfo (ward/district/address from wards map if provided) */
export function mapCameraToInfo(
  c: CameraDto,
  wardNames?: Map<string, { wardName: string; districtName: string }>
): CameraInfo {
  const wardId = c.WardId ?? 'DEFAULT';
  const info = wardNames?.get(wardId);
  const ward = info?.wardName ?? wardId;
  const district = info?.districtName ?? '';
  const address = [c.Name, ward, district].filter(Boolean).join(', ') + (district ? ', TP.HCM' : '');
  return {
    id: c.Id,
    name: c.Name,
    address,
    ward,
    district,
    wardId: c.WardId ?? undefined,
    lat: c.Latitude,
    lng: c.Longitude,
  };
}
