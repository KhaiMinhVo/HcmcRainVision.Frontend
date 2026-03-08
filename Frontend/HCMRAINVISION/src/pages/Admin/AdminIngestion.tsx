/**
 * Admin – ingestion jobs list, detail, stats.
 */
import { useState, useEffect } from 'react';
import { getIngestionJobs, getIngestionJobDetail, getIngestionStats } from '../../services/adminApi';
import type { IngestionJobsResponseDto, IngestionJobDetailDto, IngestionStatsDto } from '../../types/api';
import { ADMIN_LOADING_TEXT, getApiErrorMessage } from './adminShared';
import AdminErrorMessage from './AdminErrorMessage';

export default function AdminIngestion() {
  const [stats, setStats] = useState<IngestionStatsDto | null>(null);
  const [jobs, setJobs] = useState<IngestionJobsResponseDto | null>(null);
  const [detail, setDetail] = useState<IngestionJobDetailDto | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setError(null);
      setLoading(true);
      getIngestionStats(7)
        .then(setStats)
        .catch((e) => setError(getApiErrorMessage(e, 'Tải stats thất bại')))
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    getIngestionJobs({ page, pageSize: 20 })
      .then(setJobs)
      .catch((e) => setError(getApiErrorMessage(e, 'Tải jobs thất bại')));
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!detailId) {
        setDetail(null);
        return;
      }
      getIngestionJobDetail(detailId)
        .then(setDetail)
        .catch(() => setDetail(null));
    }, 0);
    return () => clearTimeout(t);
  }, [detailId]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Ingestion jobs</h2>
      {error && <AdminErrorMessage message={error} />}

      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-800 mb-2">Thống kê (7 ngày)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>Jobs: {stats.Jobs?.Total ?? 0} (Success: {stats.Jobs?.SuccessRate ?? 0}%)</div>
            <div>Attempts: {stats.Attempts?.Total ?? 0} (Success: {stats.Attempts?.SuccessRate ?? 0}%)</div>
            <div>Avg latency: {stats.Attempts?.AvgLatency ?? 0} ms</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h3 className="p-4 font-medium text-gray-800">Danh sách jobs</h3>
        {loading && !jobs ? (
          <p className="p-4 text-gray-500">{ADMIN_LOADING_TEXT}</p>
        ) : jobs ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">JobId</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(jobs.Jobs ?? []).map((j) => (
                  <tr key={j.JobId}>
                    <td className="px-4 py-2 text-sm text-gray-900 font-mono">{String(j.JobId).slice(0, 8)}…</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{j.Status}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{new Date(j.StartedAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{j.Duration != null ? `${j.Duration.toFixed(1)}s` : '—'}</td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => setDetailId(j.JobId)} className="text-blue-600 hover:underline text-sm">Chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.TotalPages > 1 && (
              <div className="p-4 flex gap-2">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
                <span className="py-1 text-sm text-gray-600">Trang {page} / {jobs.TotalPages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(jobs.TotalPages, p + 1))} disabled={page >= jobs.TotalPages} className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {detail && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800">Chi tiết job {String(detail.JobId).slice(0, 8)}…</h3>
            <button type="button" onClick={() => setDetailId(null)} className="text-gray-500 hover:text-gray-700">Đóng</button>
          </div>
          <p className="text-sm text-gray-600 mb-2">Status: {detail.Status}, Duration: {detail.Duration != null ? `${detail.Duration.toFixed(1)}s` : '—'}</p>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left">CameraId</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Latency</th>
                <th className="px-2 py-1 text-left">AttemptAt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(detail.Attempts ?? []).map((a) => (
                <tr key={a.AttemptId}>
                  <td className="px-2 py-1">{a.CameraId}</td>
                  <td className="px-2 py-1">{a.Status}</td>
                  <td className="px-2 py-1">{a.LatencyMs} ms</td>
                  <td className="px-2 py-1">{new Date(a.AttemptAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
