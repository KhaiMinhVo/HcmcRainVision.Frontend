export type RainLevel = 0 | 1 | 2;

export interface RainDataPoint {
  id: string;
  lat: number;
  lng: number;
  rainLevel: RainLevel;
  timestamp: string;
}

export interface CameraInfo {
  id: string;
  name: string;
  address: string;
  ward: string;
  district: string;
  lat: number;
  lng: number;
}

// Real districts and wards in Ho Chi Minh City
const DISTRICTS = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
  'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
  'Quận 11', 'Quận 12', 'Bình Thạnh', 'Tân Bình', 'Tân Phú',
  'Phú Nhuận', 'Gò Vấp', 'Bình Tân'
];

const WARDS = [
  'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
  'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
  'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'
];

const STREET_NAMES = [
  'Nguyễn Huệ', 'Lê Lợi', 'Đồng Khởi', 'Pasteur', 'Nguyễn Du',
  'Lý Tự Trọng', 'Hai Bà Trưng', 'Điện Biên Phủ', 'Võ Văn Tần',
  'Nguyễn Thị Minh Khai', 'Cách Mạng Tháng 8', 'Lê Văn Việt',
  'Hoàng Diệu', 'Trần Hưng Đạo', 'Nguyễn Trãi'
];

// Ho Chi Minh City approximate bounds
const HCMC_CENTER = { lat: 10.8231, lng: 106.6297 };
const LAT_RANGE = 0.15; // ~15km north-south
const LNG_RANGE = 0.2; // ~20km east-west

// Generate camera locations with full information
const generateCameraLocations = (): CameraInfo[] => {
  const locations: CameraInfo[] = [];
  
  for (let i = 0; i < 30; i++) {
    const id = `camera-${String(i + 1).padStart(2, '0')}`;
    const lat = HCMC_CENTER.lat + (Math.random() - 0.5) * LAT_RANGE;
    const lng = HCMC_CENTER.lng + (Math.random() - 0.5) * LNG_RANGE;
    
    const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
    const ward = WARDS[Math.floor(Math.random() * WARDS.length)];
    const street = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    
    const name = `Camera GT ${district} - ${ward}`;
    const address = `${streetNumber} ${street}, ${ward}, ${district}, TP.HCM`;
    
    locations.push({
      id,
      name,
      address,
      ward,
      district,
      lat,
      lng,
    });
  }
  
  return locations;
};

export const CAMERA_LOCATIONS: CameraInfo[] = generateCameraLocations();

// Generate timestamps for the last 2 hours (5-minute intervals)
export const generateTimestamps = (): string[] => {
  const timestamps: string[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000);
    timestamps.push(time.toISOString());
  }
  
  return timestamps;
};

// Generate random rain level (weighted: more likely to have no rain)
const getRandomRainLevel = (): RainLevel => {
  const rand = Math.random();
  if (rand < 0.5) return 0; // 50% no rain
  if (rand < 0.8) return 1; // 30% light rain
  return 2; // 20% heavy rain
};

// Generate mock data for a specific timestamp
export const getRainDataForTimestamp = (timestamp: string): RainDataPoint[] => {
  return CAMERA_LOCATIONS.map((camera) => ({
    id: camera.id,
    lat: camera.lat,
    lng: camera.lng,
    rainLevel: getRandomRainLevel(),
    timestamp,
  }));
};

// Generate all mock data for all timestamps
export const generateAllMockData = (): Record<string, RainDataPoint[]> => {
  const timestamps = generateTimestamps();
  const data: Record<string, RainDataPoint[]> = {};
  
  timestamps.forEach((timestamp) => {
    data[timestamp] = getRainDataForTimestamp(timestamp);
  });
  
  return data;
};

// Get camera info by ID
export const getCameraInfo = (id: string): CameraInfo | undefined => {
  return CAMERA_LOCATIONS.find((camera) => camera.id === id);
};

// Get all unique districts
export const getAllDistricts = (): string[] => {
  return Array.from(new Set(CAMERA_LOCATIONS.map((c) => c.district))).sort();
};

// Get all unique wards
export const getAllWards = (): string[] => {
  return Array.from(new Set(CAMERA_LOCATIONS.map((c) => c.ward))).sort();
};
