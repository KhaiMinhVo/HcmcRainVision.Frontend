/**
 * Admin dashboard – stats, rain frequency, failed cameras, camera health.
 */
import { useState, useEffect } from 'react';
import {
  getAdminStats,
  getRainFrequency,
  getFailedCameras,
  checkCameraHealth,
} from '../../services/adminApi';
import type {
  AdminStatsDto,
  RainFrequencyItemDto,
  FailedCamerasDto,
  CameraHealthDto,
} from '../../types/api';
import { ADMIN_LOADING_TEXT, getApiErrorMessage } from './adminShared';
import AdminErrorMessage from './AdminErrorMessage';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [rainFreq, setRainFreq] = useState<RainFrequencyItemDto[]>([]);
  const [failed, setFailed] = useState<FailedCamerasDto | null>(null);
  const [health, setHealth] = useState<CameraHealthDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      setError(null);
      setLoading(true);
      Promise.all([
        getAdminStats(),
        getRainFrequency(),
        getFailedCameras(),
        checkCameraHealth(),
      ])
        .then(([s, rf, f, h]) => {
          if (!cancelled) {
            setStats(s);
            setRainFreq(rf);
            setFailed(f);
            setHealth(h);
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setError(getApiErrorMessage(e, 'Tải thống kê thất bại'));
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (loading) {
    return <p className="text-gray-600">{ADMIN_LOADING_TEXT}</p>;
  }

  if (error) {
    return <AdminErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Tổng quan</h2>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="text-sm text-gray-500">Tổng camera</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.TotalCameras}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="text-sm text-gray-500">Weather logs</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.TotalWeatherLogs}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="text-sm text-gray-500">Báo cáo user</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.TotalUserReports}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="text-sm text-gray-500">Lần quét cuối</div>
            <div className="text-lg font-medium text-gray-800">
              {stats.LastSystemScan ? new Date(stats.LastSystemScan).toLocaleString('vi-VN') : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Rain frequency (simple list) */}
      {Array.isArray(rainFreq) && rainFreq.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Tần suất mưa theo giờ (7 ngày)</h3>
          <div className="flex flex-wrap gap-2">
            {rainFreq.map((item) => (
              <span
                key={item.Hour}
                className="px-3 py-1 bg-blue-50 text-blue-800 rounded text-sm"
              >
                {item.Hour}h: {item.Count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Failed cameras */}
      {failed && (() => {
        const cameras = failed.Cameras ?? [];
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Camera lỗi (không có dữ liệu 1h) — {failed.TotalFailed ?? cameras.length}
            </h3>
            {cameras.length === 0 ? (
              <p className="text-gray-500">Không có camera lỗi.</p>
            ) : (
              <ul className="space-y-2">
                {cameras.slice(0, 10).map((c) => (
                  <li key={c.Id} className="text-sm text-gray-700">
                    {c.Name} ({c.Id}) — {c.Status}
                  </li>
                ))}
                {cameras.length > 10 && (
                  <li className="text-gray-500">... và {cameras.length - 10} camera khác</li>
                )}
              </ul>
            )}
          </div>
        );
      })()}

      {/* Camera health summary */}
      {health?.Summary && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Tình trạng camera</h3>
          <div className="flex flex-wrap gap-4">
            <span className="text-green-700">Active: {health.Summary.Active ?? 0}</span>
            <span className="text-red-600">Offline: {health.Summary.Offline ?? 0}</span>
            <span className="text-amber-600">Maintenance: {health.Summary.Maintenance ?? 0}</span>
            <span className="text-gray-600">Test: {health.Summary.TestMode ?? 0}</span>
          </div>
          {health.Summary.Note && <p className="text-xs text-gray-500 mt-2">{health.Summary.Note}</p>}
        </div>
      )}
    </div>
  );
}
