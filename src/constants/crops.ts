import { CropType, GrowthStage } from '../types';

export interface CropMetadata {
  id: CropType;
  defaultName: string;
  season: string;
  waterNeed: 'High' | 'Moderate' | 'Low / Drought-Tolerant';
  waterNeedLitersPerKgEstimate: string;
  criticalStageForWater: GrowthStage;
  primaryRisks: string[];
  icon: string;
}

export const CROPS_DATA: Record<CropType, CropMetadata> = {
  paddy: {
    id: 'paddy',
    defaultName: 'Paddy (Rice)',
    season: 'Kharif',
    waterNeed: 'High',
    waterNeedLitersPerKgEstimate: '2,500 - 3,500 L/kg',
    criticalStageForWater: 'flowering',
    primaryRisks: ['Submergence/flash flood', 'Blast disease in high humidity', 'Moisture stress during panicle initiation'],
    icon: '🌾',
  },
  maize: {
    id: 'maize',
    defaultName: 'Maize (Corn)',
    season: 'Kharif',
    waterNeed: 'Moderate',
    waterNeedLitersPerKgEstimate: '900 - 1,200 L/kg',
    criticalStageForWater: 'flowering',
    primaryRisks: ['Waterlogging at seedling stage', 'Fall armyworm in dry spells', 'Tasseling moisture stress'],
    icon: '🌽',
  },
  groundnut: {
    id: 'groundnut',
    defaultName: 'Groundnut (Peanut)',
    season: 'Kharif / Rabi',
    waterNeed: 'Low / Drought-Tolerant',
    waterNeedLitersPerKgEstimate: '1,500 - 2,000 L/kg',
    criticalStageForWater: 'grain_filling',
    primaryRisks: ['Dry soil impeding peg penetration', 'Tikka leaf spot in humid spells', 'Aflatoxin during wet harvest'],
    icon: '🥜',
  },
  cotton: {
    id: 'cotton',
    defaultName: 'Cotton',
    season: 'Kharif',
    waterNeed: 'Moderate',
    waterNeedLitersPerKgEstimate: '2,000 - 2,500 L/kg',
    criticalStageForWater: 'flowering',
    primaryRisks: ['Flower/boll shedding from heavy rainfall', 'Bollworm flare-up', 'Root rot in poor drainage'],
    icon: '🌱',
  },
  millets: {
    id: 'millets',
    defaultName: 'Millets (Ragi/Bajra/Jowar)',
    season: 'Kharif / Rainfed',
    waterNeed: 'Low / Drought-Tolerant',
    waterNeedLitersPerKgEstimate: '600 - 800 L/kg',
    criticalStageForWater: 'flowering',
    primaryRisks: ['Grain mold if rains coincide with harvest', 'Shoot fly in early seedlings', 'Cold injury at high elevation'],
    icon: '🌾',
  },
  sugarcane: {
    id: 'sugarcane',
    defaultName: 'Sugarcane',
    season: 'Perennial / Multi-season',
    waterNeed: 'High',
    waterNeedLitersPerKgEstimate: '1,800 - 2,200 L/kg',
    criticalStageForWater: 'vegetative',
    primaryRisks: ['High evaporative demand drying tillers', 'Red rot in waterlogged fields', 'Lodging under high winds'],
    icon: '🎋',
  },
  wheat: {
    id: 'wheat',
    defaultName: 'Wheat',
    season: 'Rabi',
    waterNeed: 'Moderate',
    waterNeedLitersPerKgEstimate: '1,200 - 1,500 L/kg',
    criticalStageForWater: 'flowering',
    primaryRisks: ['Terminal heat stress in March', 'Yellow rust in cold damp weather', 'Unseasonal rain/hailstorm near harvest'],
    icon: '🌾',
  },
  pulses: {
    id: 'pulses',
    defaultName: 'Pulses (Lentils/Gram/Arhar)',
    season: 'Kharif / Rabi',
    waterNeed: 'Low / Drought-Tolerant',
    waterNeedLitersPerKgEstimate: '1,000 - 1,400 L/kg',
    criticalStageForWater: 'flowering',
    primaryRisks: ['Pod borer pest flare-up', 'Wilt disease in heavy soils', 'Excessive rain during flowering causing drop'],
    icon: '🫘',
  },
  vegetables: {
    id: 'vegetables',
    defaultName: 'Vegetables',
    season: 'Zaid / Multi-season',
    waterNeed: 'Moderate',
    waterNeedLitersPerKgEstimate: '300 - 600 L/kg',
    criticalStageForWater: 'vegetative',
    primaryRisks: ['Sunscald on fruits during heatwaves', 'Damping-off in nursery', 'Powdery/downy mildew in dampness'],
    icon: '🥬',
  },
  other: {
    id: 'other',
    defaultName: 'Other Crop',
    season: 'Multi-season',
    waterNeed: 'Moderate',
    waterNeedLitersPerKgEstimate: 'Variable',
    criticalStageForWater: 'flowering',
    primaryRisks: ['Unpredictable microclimate variations', 'Pest and moisture imbalances'],
    icon: '🪴',
  },
};

export const GROWTH_STAGES: { id: GrowthStage; label: string; description: string }[] = [
  {
    id: 'sowing',
    label: 'Sowing & Germination',
    description: 'Seed emergence, delicate radical and coleoptile establishment (0–15 days).',
  },
  {
    id: 'vegetative',
    label: 'Vegetative Growth',
    description: 'Canopy expansion, stem elongation, root deepening (15–45 days).',
  },
  {
    id: 'flowering',
    label: 'Flowering & Tillering',
    description: 'Panicle initiation, pollination, fertilization; extremely vulnerable to moisture & heat stress (45–75 days).',
  },
  {
    id: 'grain_filling',
    label: 'Grain / Pod Filling',
    description: 'Milky to dough stage; critical for seed weight and yield quality (75–100 days).',
  },
  {
    id: 'harvesting',
    label: 'Maturity & Harvesting',
    description: 'Senescence, grain moisture dropping below 14–18%; vulnerable to unseasonal rain/wind lodging.',
  },
];
