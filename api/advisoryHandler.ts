import { GoogleGenAI } from '@google/genai';

export async function handleAdvisoryGeneration(reqBody: any) {
  const {
    state = 'Tamil Nadu',
    district = 'Madurai',
    crop = 'paddy',
    customCropName,
    growthStage = 'vegetative',
    language = 'en',
    weather,
    userQuestion,
  } = reqBody;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const cropName = customCropName || crop;
  const isLive = Boolean(weather && (weather.retrievalStatus === 'live' || weather.sourceType === 'imd_official_live'));
  const preservedSource = isLive ? (weather.source || weather.providerName || 'India Meteorological Department (IMD) Ground Station Network') : '';
  const preservedTimestamp = isLive ? (weather.observationTimestamp || weather.retrievalTimestamp || new Date().toISOString()) : '';

  let evidencePromptSection = '';
  if (isLive) {
    evidencePromptSection = `VERIFIED LIVE WEATHER TELEMETRY IS AVAILABLE:
- Source: ${preservedSource}
- Observation Timestamp: ${preservedTimestamp}
- Observed Temperature: ${weather.temperature}°C (Min ${weather.tempMin}°C, Max ${weather.tempMax}°C)
- 24-Hour Precipitation: ${weather.rainfall24h} mm
- Relative Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h
- Surface Condition: ${weather.weatherDescription || 'Observed'}
- Verified Official Alerts: ${
      weather.alerts && weather.alerts.length > 0
        ? weather.alerts.map((a: any) => `[${a.severity.toUpperCase()} ALERT: ${a.title} - ${a.description}]`).join('; ')
        : 'None active'
    }`;
  } else {
    evidencePromptSection = `LIVE WEATHER DATA IS UNAVAILABLE / NOT CONNECTED:
- No verified live weather telemetry is currently connected for ${district}, ${state}.
- STRICT MANDATORY REQUIREMENT: You MUST state explicitly that this advisory is general guidance, not a current weather-based warning.
- Under NO circumstances should you invent current temperature, rainfall mm, official weather alerts, soil conditions, or short-range forecasts.`;
  }

  const systemInstruction = `You are AgriShield AI, a trusted evidence-aware agricultural adviser for smallholder farmers across India.

MANDATORY RESPONSE STRUCTURE (4 SECTIONS):
Your advisory MUST have exactly these four components:
1. Brief summary of the available evidence:
   - If verified live data is available, summarize the observed temperature, rainfall, and humidity, and preserve the source name and timestamp.
   - If live data is missing, explicitly state: "This response is general guidance, not a current weather-based warning."
2. Three practical actions the farmer can consider:
   - Provide exactly 3 short, practical, prioritized actions.
   - Tailored to the crop "${cropName}" at the "${growthStage}" growth stage.
3. Water-conservation guidance relevant to the crop and stage:
   - Provide specific water-saving techniques for ${cropName} during the ${growthStage} stage (e.g., Alternate Wetting and Drying for paddy, ridge and furrow, straw mulching, night micro-irrigation).
4. A clear uncertainty note and an official source link:
   - State weather/microclimate uncertainty clearly.
   - Provide the official link to IMD Mausam (https://mausam.imd.gov.in/) or IMD Agromet (https://agromet.imd.gov.in/).
   - Preserve the source name and timestamp when real data was used.

STRICT EVIDENCE & SAFETY RULES:
- Never invent current weather, rainfall, district warnings, soil conditions or a forecast.
- If live data is missing, explicitly say that the response is general guidance, not a current weather-based warning.
- Do not attribute local conditions solely to El Niño.
- Do not guarantee yield, income, drought prevention or crop survival.
- Avoid dangerous or highly specific pesticide/chemical fertilizer instructions without adequate context (advise consulting the local Krishi Vigyan Kendra or agricultural extension officer).
- Reply entirely in the selected language (Language code: ${language}) and keep the wording short, simple, and easy to understand for farmers.
- Preserve the source name and timestamp when real data is used.

Output strictly valid JSON matching this schema:
{
  "evidenceSummary": {
    "hasLiveData": boolean,
    "sourceName": "string",
    "sourceTimestamp": "string",
    "text": "Brief summary of available evidence in the requested language. If live data is missing, MUST state this is general guidance, not a current weather warning.",
    "isGeneralGuidanceOnly": boolean
  },
  "recommendations": [
    {
      "title": "Action 1 title in requested language",
      "action": "First practical step in requested language",
      "urgency": "immediate" | "next_24h" | "routine"
    },
    {
      "title": "Action 2 title in requested language",
      "action": "Second practical step in requested language",
      "urgency": "immediate" | "next_24h" | "routine"
    },
    {
      "title": "Action 3 title in requested language",
      "action": "Third practical step in requested language",
      "urgency": "immediate" | "next_24h" | "routine"
    }
  ],
  "waterConservation": {
    "techniqueName": "Name of water conservation technique in requested language",
    "guidance": "Detailed practical execution steps for this crop and stage in requested language",
    "estimatedSavings": "~20-30% water savings"
  },
  "uncertaintyAndSource": {
    "uncertaintyNote": "Clear uncertainty note stating localized weather variations in requested language",
    "officialSourceTitle": "India Meteorological Department (IMD) Agromet Portal",
    "officialSourceUrl": "https://agromet.imd.gov.in/",
    "preservedSource": "${preservedSource}",
    "preservedTimestamp": "${preservedTimestamp}"
  },
  "summary": "1-2 sentence key takeaway in requested language",
  "climateRiskLevel": "low" | "moderate" | "high" | "severe",
  "waterSavingPractices": [
    {
      "title": "Technique name",
      "technique": "Execution details",
      "estimatedSavingsPercent": 25
    }
  ],
  "scientificExplanation": "Simple reasoning why these actions assist the crop at this stage in requested language",
  "uncertaintyNotes": "Statement of forecast uncertainty in requested language"
}`;

  const userPrompt = `FARMER PROFILE & QUERY:
- Location: ${district}, ${state}, India
- Crop: ${cropName}
- Current Growth Stage: ${growthStage}
- Requested Language Code: ${language}
${userQuestion ? `- Specific Farmer Question: "${userQuestion}"` : ''}

EVIDENCE CONTEXT:
${evidencePromptSection}

Generate the 4-part evidence-aware advisory adhering strictly to the JSON schema and safety rules.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const text = response.text || '{}';
  try {
    const cleanJson = text.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson);
    parsed.timestamp = new Date().toISOString();
    parsed.languageCode = language;

    // Guarantee backward compatibility and safety fallbacks
    if (!parsed.waterSavingPractices || !parsed.waterSavingPractices.length) {
      if (parsed.waterConservation) {
        parsed.waterSavingPractices = [
          {
            title: parsed.waterConservation.techniqueName || 'Crop-Stage Water Conservation',
            technique: parsed.waterConservation.guidance || 'Adopt localized micro-irrigation or mulching.',
            estimatedSavingsPercent: 25,
          },
        ];
      }
    }
    if (!parsed.scientificExplanation) {
      parsed.scientificExplanation = parsed.summary || 'Agronomic guidance grounded in crop development stage requirements.';
    }
    if (!parsed.uncertaintyNotes) {
      parsed.uncertaintyNotes = parsed.uncertaintyAndSource?.uncertaintyNote || 'Local weather can fluctuate; corroborate with official IMD district advisories.';
    }

    return parsed;
  } catch (parseErr) {
    console.error('Failed to parse Gemini response JSON:', text);
    throw new Error('Could not parse Gemini agricultural advisory JSON response.');
  }
}
