/**
 * Type definitions for the HCMC Rain Detection System
 */

/**
 * Rain level enumeration
 * 0 = No rain
 * 1 = Light rain
 * 2 = Heavy rain
 */
export type RainLevel = 0 | 1 | 2;

/**
 * Rain data point from a camera at a specific timestamp
 */
export interface RainDataPoint {
  id: string;
  lat: number;
  lng: number;
  rainLevel: RainLevel;
  timestamp: string;
}

/**
 * Camera information
 */
export interface CameraInfo {
  id: string;
  name: string;
  address: string;
  ward: string;
  district: string;
  lat: number;
  lng: number;
}

/**
 * Rain filter options
 */
export type RainFilter = 'all' | 'rain' | 'no-rain';

