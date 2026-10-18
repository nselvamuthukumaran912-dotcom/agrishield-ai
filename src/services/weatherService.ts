import { WeatherData } from '../types';

export interface WeatherFetchResult {
  data: WeatherData | null;
  status: 'live' | 'cached' | 'unavailable' | 'not_configured' | 'access_denied' | 'timeout' | 'invalid_response';
  statusMessage: string;
  sourceAttribution: string;
  portalLinks: {
    name: string;
    url: string;
    description: string;
  }[];
  configRequired?: {
    endpointEnv: string;
    keyEnv: string;
    clientIdEnv: string;
  };
}

export const OFFICIAL_PORTALS = {
  imdMausam: {
    name: 'IMD Mausam National Weather Portal',
    url: 'https://mausam.imd.gov.in',
    description: 'Official national weather service, nowcasts, radar & satellite imagery.',
  },
  imdAgromet: {
    name: 'IMD Agromet (Gramin Krishi Mausam Sewa)',
    url: 'https://agromet.imd.gov.in',
    description: 'District and block-level agrometeorological advisory bulletins issued twice a week.',
  },
  meghdoot: {
    name: 'Meghdoot Agro Weather App (IMD-ICAR-IITM)',
    url: 'https://meghdoot.imd.gov.in',
    description: 'Official joint mobile application delivering contextual crop advisories.',
  },
  damini: {
    name: 'Damini Lightning Warning App (IITM-IMD)',
    url: 'https://damini.tropmet.res.in',
    description: 'Lightning strike early warning system for farmer safety in open fields.',
  },
};

/**
 * Fetches district weather from the server-side weather provider module (/api/weather).
 */
export async function fetchDistrictWeather(
  lat: number,
  lng: number,
  districtName: string,
  stateName: string = 'Tamil Nadu'
): Promise<WeatherFetchResult> {
  const query = new URLSearchParams({
    state: stateName,
    district: districtName,
    lat: lat.toString(),
    lng: lng.toString(),
  });

  try {
    const res = await fetch(`/api/weather?${query.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
    }

    const payload: WeatherFetchResult = await res.json();
    return payload;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network communication error';
    return {
      data: null,
      status: 'unavailable',
      statusMessage: `Live weather data unavailable: Could not reach weather provider (${errorMsg}).`,
      sourceAttribution: 'Weather Provider Offline • Check official government portals below',
      portalLinks: Object.values(OFFICIAL_PORTALS),
    };
  }
}
