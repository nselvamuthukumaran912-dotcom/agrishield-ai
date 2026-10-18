import { CropType, GeminiAdvisoryResponse, GrowthStage, LanguageCode, WeatherData } from '../types';

export interface AdvisoryRequestPayload {
  state: string;
  district: string;
  crop: CropType;
  customCropName?: string;
  growthStage: GrowthStage;
  language: LanguageCode;
  weather: WeatherData | null;
  userQuestion?: string;
}

export async function requestGeminiAdvisory(payload: AdvisoryRequestPayload): Promise<GeminiAdvisoryResponse> {
  try {
    const res = await fetch('/api/advisory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || `Server responded with status ${res.status}`);
    }

    const data: GeminiAdvisoryResponse = await res.json();
    return data;
  } catch (err: unknown) {
    console.warn('Backend Gemini API call error, applying agronomic rule-based safety engine:', err);
    // Return an evidence-grounded fallback advisory tailored to the crop, stage & conditions
    return generateEvidenceBasedFallback(payload);
  }
}

/**
 * Agronomic rule-based fallback when server or API is unreachable,
 * ensuring the farmer always receives actionable guidance based on observed weather.
 */
function generateEvidenceBasedFallback(payload: AdvisoryRequestPayload): GeminiAdvisoryResponse {
  const crop = payload.customCropName || payload.crop;
  const isLive = Boolean(payload.weather && (payload.weather.retrievalStatus === 'live' || payload.weather.sourceType === 'imd_official_live'));
  const temp = payload.weather?.temperature;
  const rain = payload.weather?.rainfall24h;
  const humidity = payload.weather?.humidity;

  const preservedSource = isLive ? (payload.weather?.source || payload.weather?.providerName || 'India Meteorological Department (IMD) Ground Station') : '';
  const preservedTimestamp = isLive ? (payload.weather?.observationTimestamp || payload.weather?.retrievalTimestamp || new Date().toISOString()) : '';

  let evidenceText = '';
  if (isLive && temp !== undefined && rain !== undefined && humidity !== undefined) {
    evidenceText = `Observed telemetry from ${preservedSource}: ${temp}°C, 24h rainfall ${rain} mm, ${humidity}% humidity at ${new Date(preservedTimestamp).toLocaleTimeString()}.`;
  } else {
    evidenceText = 'This response is general guidance, not a current weather-based warning. Live district weather telemetry is currently not connected.';
  }

  let riskLevel: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  if (temp && temp >= 38) riskLevel = 'severe';
  else if (temp && (temp >= 35 || (rain && rain >= 20))) riskLevel = 'high';
  else if (temp && temp >= 32) riskLevel = 'moderate';

  const isRainy = Boolean(rain && rain > 10) || (payload.weather?.alerts?.some((a) => a.category === 'rainfall') ?? false);
  const isHot = Boolean(temp && temp >= 35);

  const waterConservationDetails = crop.toLowerCase().includes('paddy')
    ? {
        techniqueName: 'Alternate Wetting and Drying (AWD)',
        guidance: 'Allow field water depth to recede 5 cm below soil surface between waterings during vegetative stage to conserve up to 25% water.',
        estimatedSavings: '~25% water savings',
      }
    : crop.toLowerCase().includes('cotton')
    ? {
        techniqueName: 'Alternate Furrow Irrigation & Soil Mulch',
        guidance: 'Irrigate alternate furrows in early morning hours to conserve irrigation water while protecting root aeration.',
        estimatedSavings: '~20-30% water savings',
      }
    : {
        techniqueName: 'In-Situ Straw Mulching & Evening Micro-Irrigation',
        guidance: 'Spread crop residue or straw around plant bases to reduce surface evaporation and irrigate after sunset.',
        estimatedSavings: '~20-25% water savings',
      };

  return {
    summary: isLive
      ? `Evidence-grounded advisory for ${crop} (${payload.growthStage}) in ${payload.district}, ${payload.state}.`
      : `General agronomic advisory for ${crop} (${payload.growthStage}) in ${payload.district}, ${payload.state}. (Live telemetry unavailable).`,
    evidenceSummary: {
      hasLiveData: isLive,
      sourceName: preservedSource || 'General Agronomic Guidance',
      sourceTimestamp: preservedTimestamp,
      text: evidenceText,
      isGeneralGuidanceOnly: !isLive,
    },
    climateRiskLevel: riskLevel,
    recommendations: [
      {
        title: isRainy ? 'Maintain Surface Field Drainage' : isHot ? 'Protect Soil Moisture with Organic Mulch' : 'Maintain Soil Moisture Equilibrium',
        action: isRainy
          ? 'Inspect field bund outlets and drain standing water to prevent root suffocation. Do not apply chemical foliar sprays during rain.'
          : isHot
          ? 'Spread organic crop residue mulch around the base of plants to protect root zone moisture from midday heat.'
          : 'Conduct light irrigation during early morning or evening hours to minimize evaporative loss.',
        urgency: isRainy || isHot ? 'immediate' : 'routine',
      },
      {
        title: 'Nutrient & Spray Scheduling',
        action: isRainy
          ? 'Postpone chemical sprayings and nitrogen top-dressing until the rainfall spell clears to prevent wash-off.'
          : 'Consult your local Krishi Vigyan Kendra (KVK) or extension officer before spraying to verify appropriate district dosages.',
        urgency: 'next_24h',
      },
      {
        title: `Stage-Specific Protection (${payload.growthStage})`,
        action: `At the ${payload.growthStage} stage, monitor for pest infestation and avoid water stagnation at the root collar.`,
        urgency: 'routine',
      },
    ],
    waterConservation: waterConservationDetails,
    uncertaintyAndSource: {
      uncertaintyNote: 'Weather conditions and microclimates vary across villages. Always verify with official local bulletins.',
      officialSourceTitle: 'IMD Agromet Advisory Service',
      officialSourceUrl: 'https://agromet.imd.gov.in/',
      preservedSource,
      preservedTimestamp,
    },
    waterSavingPractices: [
      {
        title: waterConservationDetails.techniqueName,
        technique: waterConservationDetails.guidance,
        estimatedSavingsPercent: 25,
      },
    ],
    scientificExplanation: `Crop physiological demand at the ${payload.growthStage} stage requires stable root moisture without waterlogging or extreme heat stress.`,
    uncertaintyNotes: 'For decisions affected by weather warnings, verify the latest official IMD advisory and consult a local agricultural extension officer.',
    timestamp: new Date().toISOString(),
    languageCode: payload.language,
  };
}
