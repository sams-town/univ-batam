/**
 * Calculates the distance between two coordinates in meters using the Haversine formula
 */
export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in metres
}

/**
 * Basic heuristic to detect potential Mock Location / Fake GPS usage.
 * - Some fake GPS apps return extremely perfect numbers for accuracy (e.g. exactly 1 or exactly 5).
 * - Real GPS typically has floating point variations (e.g. 12.342...).
 * Note: This is a frontend heuristic and not 100% foolproof.
 */
export function isLikelyMockLocation(position: GeolocationPosition): boolean {
  // If altitude is exactly 0 and accuracy is suspiciously perfect integer
  if (position.coords.altitude === 0 && position.coords.accuracy % 1 === 0 && position.coords.accuracy <= 5) {
    return true;
  }
  return false;
}

export interface LocationValidationResult {
  isValid: boolean;
  error?: string;
  distance?: number;
}

/**
 * Validates the current location against the admin settings.
 */
export function validateAttendanceLocation(position: GeolocationPosition): LocationValidationResult {
  // 1. Get Settings from localStorage (fallback to defaults if none)
  const savedSettings = localStorage.getItem('unbat_system_settings');
  let settings: any = {
    enableGPSGeofence: true,
    geofenceRadius: 150,
    campusLatitude: '-6.200000',
    campusLongitude: '106.816666'
  };

  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      settings = { ...settings, ...parsed };
    } catch (e) {
      console.error('Failed to parse settings');
    }
  }

  // 2. Check for Mock Location
  if (isLikelyMockLocation(position)) {
    return {
      isValid: false,
      error: 'Peringatan: Terdeteksi menggunakan Fake GPS! Harap matikan aplikasi manipulasi lokasi Anda untuk melakukan absensi.'
    };
  }

  // 3. Distance Check if Geofence is enabled
  if (settings.enableGPSGeofence) {
    const campusLat = parseFloat(settings.campusLatitude);
    const campusLng = parseFloat(settings.campusLongitude);
    const radius = parseFloat(settings.geofenceRadius);

    if (isNaN(campusLat) || isNaN(campusLng) || isNaN(radius)) {
      return { isValid: true }; // Skip validation if config is broken
    }

    const distance = getDistanceInMeters(
      campusLat,
      campusLng,
      position.coords.latitude,
      position.coords.longitude
    );

    if (distance > radius) {
      // Return Fake GPS warning if they are completely out of bounds (as per user instruction "atau koordinat melompat jauh")
      // We will show the same fake GPS error for "melompat jauh" out of radius
      return {
        isValid: false,
        distance,
        error: `Anda berada di luar radius absensi (${Math.round(distance)}m dari kampus. Maksimal ${radius}m). Peringatan: Terdeteksi menggunakan Fake GPS atau Anda tidak berada di lokasi!`
      };
    }
  }

  return { isValid: true };
}
