/**
 * Utility per geolocalizzazione, calcolo percorso e apertura Google Maps
 * per l'assistenza domiciliare dell'OSS (in auto e a piedi).
 *
 * NOTA PRIVACY & SICUREZZA:
 * La posizione GPS dell'operatore non viene MAI salvata nel database Supabase.
 * Viene utilizzata esclusivamente in memoria locale temporanea per il calcolo
 * e l'apertura del percorso.
 */

export type TravelMode = 'driving' | 'walking';

export interface DistanceCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  formattedDistance: string;
  formattedDuration: string;
  walkingDistanceKm?: number;
  walkingDurationMinutes?: number;
  formattedWalkingDuration?: string;
  source: 'road_routing' | 'haversine_estimate';
}

/**
 * Genera l'URL diretto per Google Maps.
 * Se non vengono passate coordinate di origine, Google Maps usa in automatico
 * la posizione attuale del dispositivo (Your Location).
 */
export function getGoogleMapsUrl(
  destinationAddress: string,
  mode: TravelMode = 'driving',
  originCoords?: { lat: number; lng: number }
): string {
  const encodedDest = encodeURIComponent(destinationAddress.trim());
  if (originCoords) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originCoords.lat},${originCoords.lng}&destination=${encodedDest}&travelmode=${mode}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}&travelmode=${mode}`;
}

/**
 * Apre direttamente Google Maps per il domicilio specificato.
 * Viene aperto immediatamente per garantire l'apertura diretta dell'app su smartphone (iOS / Android)
 * e nel browser su PC senza blocchi popup.
 */
export function openGoogleMapsRoute(
  destinationAddress: string,
  mode: TravelMode = 'driving'
): void {
  if (!destinationAddress || !destinationAddress.trim()) {
    return;
  }

  const url = getGoogleMapsUrl(destinationAddress, mode);
  
  // Apri direttamente in una nuova finestra/tab o nell'app Google Maps nativa
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    // Fallback se popup bloccato
    window.location.href = url;
  }
}

/**
 * Ottiene la posizione corrente del dispositivo dell'operatore tramite Geolocation API
 */
export function getCurrentPosition(timeoutMs = 8000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalizzazione non supportata dal tuo browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => {
        let msg = 'Impossibile rilevare la posizione.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permesso di geolocalizzazione negato.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Posizione geografica non disponibile.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Richiesta di posizione scaduta (timeout).';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Formatta minuti in formato leggibile (es. "17 min" o "1h 15 min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins} min`;
}

/**
 * Calcola distanza e tempi di percorrenza reali (in auto e a piedi)
 */
export async function calculateRouteDistanceAndTime(
  destinationAddress: string
): Promise<DistanceCalculationResult> {
  if (!destinationAddress || !destinationAddress.trim()) {
    throw new Error('Indirizzo di destinazione mancante');
  }

  // 1. Posizione attuale operatore
  const position = await getCurrentPosition(7000);
  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;

  // 2. Geocoding indirizzo del paziente tramite Nominatim OpenStreetMap
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    destinationAddress.trim()
  )}&limit=1&addressdetails=1`;

  const geoRes = await fetch(geocodeUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!geoRes.ok) {
    throw new Error('Geocoding fallito');
  }

  const geoData = await geoRes.json();
  if (!geoData || geoData.length === 0) {
    throw new Error('Indirizzo non trovato sulla mappa');
  }

  const destLat = parseFloat(geoData[0].lat);
  const destLng = parseFloat(geoData[0].lon);

  // 3. Calcolo percorso stradale OSRM
  try {
    const osrmDrivingUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=false`;
    const driveRes = await fetch(osrmDrivingUrl);

    if (driveRes.ok) {
      const driveData = await driveRes.json();
      if (driveData.code === 'Ok' && driveData.routes && driveData.routes.length > 0) {
        const distanceMeters = driveData.routes[0].distance;
        const durationSeconds = driveData.routes[0].duration;

        const distanceKm = +(distanceMeters / 1000).toFixed(1);
        const driveDurationMinutes = Math.max(1, Math.round(durationSeconds / 60));

        // Stima tempo a piedi (media 4.5 km/h a piedi)
        const walkingMinutes = Math.max(1, Math.round((distanceKm / 4.5) * 60));

        return {
          distanceKm,
          durationMinutes: driveDurationMinutes,
          formattedDistance: `${distanceKm.toLocaleString('it-IT')} km`,
          formattedDuration: `circa ${formatDuration(driveDurationMinutes)}`,
          walkingDistanceKm: distanceKm,
          walkingDurationMinutes: walkingMinutes,
          formattedWalkingDuration: `circa ${formatDuration(walkingMinutes)}`,
          source: 'road_routing',
        };
      }
    }
  } catch (osrmError) {
    console.warn('OSRM routing fallback to Haversine with traffic factor:', osrmError);
  }

  // Fallback Haversine con fattore stradale 1.35
  const straightDistanceKm = calculateHaversineDistance(userLat, userLng, destLat, destLng);
  const roadEstimatedKm = +(straightDistanceKm * 1.35).toFixed(1);
  const estimatedDriveMin = Math.max(2, Math.round((roadEstimatedKm / 35) * 60));
  const estimatedWalkMin = Math.max(2, Math.round((roadEstimatedKm / 4.5) * 60));

  return {
    distanceKm: roadEstimatedKm,
    durationMinutes: estimatedDriveMin,
    formattedDistance: `${roadEstimatedKm.toLocaleString('it-IT')} km`,
    formattedDuration: `circa ${formatDuration(estimatedDriveMin)}`,
    walkingDistanceKm: roadEstimatedKm,
    walkingDurationMinutes: estimatedWalkMin,
    formattedWalkingDuration: `circa ${formatDuration(estimatedWalkMin)}`,
    source: 'haversine_estimate',
  };
}

/**
 * Formula dell'emisenoverso (Haversine) per distanza tra due coordinate
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raggio terrestre in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
