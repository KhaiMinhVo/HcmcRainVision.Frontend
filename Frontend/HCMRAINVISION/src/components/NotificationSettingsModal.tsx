/**
 * NotificationSettingsModal – đăng ký nhận thông báo theo khu vực (phường)
 * Multi-select wards, gợi ý từ khu vực yêu thích, cảnh báo khi có mưa / mưa nặng
 */

import { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { getAllWards } from '../data/mockRainData';
import { getCameraInfo } from '../data/mockRainData';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  const { settings, updateSettings, suggestedWards, setSuggestedWards } = useNotifications();
  const { favoriteIds } = useFavorites();
  const [wardIds, setWardIds] = useState<string[]>(settings.wardIds);
  const [alertOnRain, setAlertOnRain] = useState(settings.alertOnRain);
  const [alertOnHeavyRain, setAlertOnHeavyRain] = useState(settings.alertOnHeavyRain);

  const allWards = getAllWards();

  // Gợi ý phường từ cameras yêu thích
  useEffect(() => {
    const wards = new Set<string>();
    favoriteIds.forEach((id) => {
      const cam = getCameraInfo(id);
      if (cam) wards.add(cam.ward);
    });
    setSuggestedWards([...wards].sort());
  }, [favoriteIds, setSuggestedWards]);

  useEffect(() => {
    if (isOpen) {
      setWardIds(settings.wardIds);
      setAlertOnRain(settings.alertOnRain);
      setAlertOnHeavyRain(settings.alertOnHeavyRain);
    }
  }, [isOpen, settings.wardIds, settings.alertOnRain, settings.alertOnHeavyRain]);

  if (!isOpen) return null;

  const toggleWard = (ward: string) => {
    setWardIds((prev) =>
      prev.includes(ward) ? prev.filter((w) => w !== ward) : [...prev, ward]
    );
  };

  const handleSave = () => {
    updateSettings({
      wardIds,
      alertOnRain,
      alertOnHeavyRain,
    });
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[1100]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Đăng ký nhận thông báo mưa
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Chọn khu vực (phường) muốn nhận cảnh báo
              </p>
              {suggestedWards.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Gợi ý từ khu vực yêu thích của bạn:
                </p>
              )}
              {suggestedWards.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestedWards.map((ward) => (
                    <button
                      key={ward}
                      type="button"
                      onClick={() => toggleWard(ward)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        wardIds.includes(ward)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {ward}
                    </button>
                  ))}
                </div>
              )}
              <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {allWards.map((ward) => (
                    <label
                      key={ward}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={wardIds.includes(ward)}
                        onChange={() => toggleWard(ward)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{ward}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Loại cảnh báo</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertOnRain}
                  onChange={(e) => setAlertOnRain(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Cảnh báo khi có mưa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertOnHeavyRain}
                  onChange={(e) => setAlertOnHeavyRain(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Cảnh báo khi mưa nặng</span>
              </label>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
