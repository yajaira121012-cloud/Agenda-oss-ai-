/**
 * Utility per geolocalizzazione, calcolo percorso e apertura Google Maps
 * per l'assistenza domiciliare dell'OSS.
 *
 * NOTA PRIVACY & SICUREZZA:
 * La posizione GPS dell'operatore non viene MAI salvata nel database Supabase.
 * Viene utilizzata esclusivamente in memoria locale temporanea per il calcolo
 * e l'apertura del percorso.
 */

export interface DistanceCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  formattedDistance: string;
  formattedDuration: string;
  source: 'road_routing' | 'haversine_estimate';
}

/**
 * Ottiene la posizione corrente del dispositivo dell'operatore tramite Geolocation API
 */
export function getCurrentPosition(timeoutMs = 10000): Promise<GeolocationPosition> {
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
 * Apre il percorso stradale in Google Maps dal punto attuale dell'OSS al domicilio del paziente
 */
export async function openGoogleMapsRoute(destinationAddress: string): Promise<void> {
  if (!destinationAddress || !destinationAddress.trim()) {
    throw new Error('Indirizzo del paziente non valido o mancante');
  }

  const encodedDest = encodeURIComponent(destinationAddress.trim());

  try {
    // Tentativo di ottenere la posizione attuale per il punto di partenza
    const pos = await getCurrentPosition(5000);
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    // URL universale compatibile con PC, iPhone (Apple Maps / Google Maps) e Android
    const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${encodedDest}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    // Se la geolocalizzazione è disattivata o negata, apri comunque con destinazione impostata
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}&travelmode=driving`;
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Calcola distanza stradale reale e tempo di percorrenza in auto stimato
 */
export async function calculateRouteDistanceAndTime(
  destinationAddress: string
): Promise<DistanceCalculationResult> {
  if (!destinationAddress || !destinationAddress.trim()) {
    throw new Error('Indirizzo di destinazione mancante');
  }

  // 1. Posizione attuale operatore
  const position = await getCurrentPosition(8000);
  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;

  // 2. Geocoding indirizzo del paziente tramite Nominatim OpenStreetMap (servizio gratuito e aperto)
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

  // 3. Calcolo percorso stradale tramite OSRM (Open Source Routing Machine)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=false`;
    const routeRes = await fetch(osrmUrl);

    if (routeRes.ok) {
      const routeData = await routeRes.json();
      if (routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
        const distanceMeters = routeData.routes[0].distance;
        const durationSeconds = routeData.routes[0].duration;

        const distanceKm = +(distanceMeters / 1000).toFixed(1);
        const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

        return {
          distanceKm,
          durationMinutes,
          formattedDistance: `${distanceKm.toLocaleString('it-IT')} km`,
          formattedDuration: `circa ${durationMinutes} min`,
          source: 'road_routing',
        };
      }
    }
  } catch (osrmError) {
    console.warn('OSRM routing fallback to Haversine with traffic factor:', osrmError);
  }

  // Fallback se OSRM non risponde: Haversine moltiplicato per fattore di tortuosità stradale urbana/extraurbana (~1.3x) e velocità media 35 km/h
  const straightDistanceKm = calculateHaversineDistance(userLat, userLng, destLat, destLng);
  const roadEstimatedKm = +(straightDistanceKm * 1.35).toFixed(1);
  const estimatedMin = Math.max(2, Math.round((roadEstimatedKm / 35) * 60));

  return {
    distanceKm: roadEstimatedKm,
    durationMinutes: estimatedMin,
    formattedDistance: `${roadEstimatedKm.toLocaleString('it-IT')} km`,
    formattedDuration: `circa ${estimatedMin} min`,
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
