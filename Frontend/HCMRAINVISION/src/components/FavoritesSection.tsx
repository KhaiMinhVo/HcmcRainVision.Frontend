/**
 * FavoritesSection – list of favorite cameras (when logged in)
 */

import { useMemo } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { getCameraInfo } from '../data/mockRainData';
import type { CameraInfo } from '../types';

interface FavoritesSectionProps {
  onCameraSelect: (cameraId: string) => void;
}

export default function FavoritesSection({ onCameraSelect }: FavoritesSectionProps) {
  const { favoriteIds, favoritesCount } = useFavorites();

  const favoriteCameras = useMemo(() => {
    const list: CameraInfo[] = [];
    favoriteIds.forEach((id) => {
      const cam = getCameraInfo(id);
      if (cam) list.push(cam);
    });
    return list;
  }, [favoriteIds]);

  if (favoriteCameras.length === 0) {
    return (
      <div className="p-4 border-b border-gray-200 bg-amber-50/50">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Cameras yêu thích ({favoritesCount})
        </h3>
        <p className="text-xs text-gray-500">Chưa có camera yêu thích. Nhấn ♥ ở danh sách hoặc chi tiết camera.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-amber-50/50">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        Cameras yêu thích ({favoritesCount})
      </h3>
      <ul className="space-y-1">
        {favoriteCameras.map((cam) => (
          <li key={cam.id}>
            <button
              type="button"
              onClick={() => onCameraSelect(cam.id)}
              className="w-full text-left text-xs py-2 px-2 rounded hover:bg-amber-100 truncate"
            >
              {cam.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
