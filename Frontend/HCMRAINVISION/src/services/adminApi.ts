/**
 * Admin API – stats, users, audit, camera CRUD, ingestion jobs.
 * All endpoints require [Authorize(Roles = "Admin")].
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type {
  AdminStatsDto,
  RainFrequencyItemDto,
  FailedCamerasDto,
  CameraHealthDto,
  AuditDataItemDto,
  UserAdminViewDto,
  IngestionJobsResponseDto,
  IngestionJobDetailDto,
  IngestionStatsDto,
} from '../types/api';
import type { CreateCameraRequest, UpdateCameraRequest } from '../types/api';

const prefix = 'api/Admin';

/** GET /api/admin/stats – system overview stats */
export async function getAdminStats(): Promise<AdminStatsDto> {
  return apiGet<AdminStatsDto>(`${prefix}/stats`);
}

/** GET /api/admin/stats/rain-frequency */
export async function getRainFrequency(): Promise<RainFrequencyItemDto[]> {
  return apiGet<RainFrequencyItemDto[]>(`${prefix}/stats/rain-frequency`);
}

/** GET /api/admin/stats/failed-cameras */
export async function getFailedCameras(): Promise<FailedCamerasDto> {
  return apiGet<FailedCamerasDto>(`${prefix}/stats/failed-cameras`);
}

/** GET /api/admin/stats/check-camera-health */
export async function checkCameraHealth(): Promise<CameraHealthDto> {
  return apiGet<CameraHealthDto>(`${prefix}/stats/check-camera-health`);
}

/** GET /api/admin/audit-data – user reports for review */
export async function getAuditData(): Promise<AuditDataItemDto[]> {
  return apiGet<AuditDataItemDto[]>(`${prefix}/audit-data`);
}

/** GET /api/admin/users */
export async function getAdminUsers(): Promise<UserAdminViewDto[]> {
  return apiGet<UserAdminViewDto[]>(`${prefix}/users`);
}

/** PUT /api/admin/users/{id}/ban – toggle ban */
export async function toggleBanUser(id: number): Promise<{ message: string }> {
  return apiPut<{ message: string }>(`${prefix}/users/${id}/ban`, {});
}

/** GET /api/admin/ingestion-jobs (paginated) */
export async function getIngestionJobs(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<IngestionJobsResponseDto> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.pageSize != null) sp.set('pageSize', String(params.pageSize));
  if (params?.status) sp.set('status', params.status);
  const q = sp.toString();
  return apiGet<IngestionJobsResponseDto>(`${prefix}/ingestion-jobs${q ? `?${q}` : ''}`);
}

/** GET /api/admin/ingestion-jobs/{jobId} */
export async function getIngestionJobDetail(jobId: string): Promise<IngestionJobDetailDto> {
  return apiGet<IngestionJobDetailDto>(`${prefix}/ingestion-jobs/${jobId}`);
}

/** GET /api/admin/ingestion-stats?days= */
export async function getIngestionStats(days?: number): Promise<IngestionStatsDto> {
  const q = days != null ? `?days=${days}` : '';
  return apiGet<IngestionStatsDto>(`${prefix}/ingestion-stats${q}`);
}

/** POST /api/camera – create camera (Admin) */
export async function createCamera(body: CreateCameraRequest): Promise<{ camera: unknown; message: string }> {
  return apiPost<{ camera: unknown; message: string }>('api/Camera', body);
}

/** PUT /api/camera/{id} – update camera (Admin) */
export async function updateCamera(id: string, body: UpdateCameraRequest): Promise<unknown> {
  return apiPut<unknown>(`api/Camera/${encodeURIComponent(id)}`, body);
}

/** DELETE /api/camera/{id} – delete camera (Admin) */
export async function deleteCamera(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`api/Camera/${encodeURIComponent(id)}`);
}
