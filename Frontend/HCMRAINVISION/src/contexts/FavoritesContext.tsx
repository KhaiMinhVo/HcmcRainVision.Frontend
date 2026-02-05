/**
 * FavoritesContext – user's favorite camera IDs (localStorage)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '../constants';

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorite: (cameraId: string) => boolean;
  toggleFavorite: (cameraId: string) => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(set: Set<string>) {
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([...set]));
}

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(loadFavorites);

  useEffect(() => {
    saveFavorites(favoriteIds);
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (cameraId: string) => favoriteIds.has(cameraId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((cameraId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(cameraId)) {
        next.delete(cameraId);
      } else {
        next.add(cameraId);
      }
      return next;
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
      favoritesCount: favoriteIds.size,
    }),
    [favoriteIds, isFavorite, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
