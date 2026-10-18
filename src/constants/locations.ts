import { LocationInfo } from '../types';

export interface StateData {
  state: string;
  districts: LocationInfo[];
}

export const INDIAN_LOCATIONS: StateData[] = [
  {
    state: 'Tamil Nadu',
    districts: [
      {
        state: 'Tamil Nadu',
        district: 'Madurai',
        lat: 9.9252,
        lng: 78.1198,
        agroZone: 'Southern Dry Zone (TN-6)',
        majorSoil: 'Red sandy loam & Clayey black soil',
      },
      {
        state: 'Tamil Nadu',
        district: 'Thanjavur',
        lat: 10.787,
        lng: 79.1378,
        agroZone: 'Cauvery Delta Zone (TN-4)',
        majorSoil: 'Alluvial & Deep clayey deltaic soil',
      },
      {
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        lat: 11.0168,
        lng: 76.9558,
        agroZone: 'Western Zone (TN-3)',
        majorSoil: 'Black cotton soil & Red loamy soil',
      },
      {
        state: 'Tamil Nadu',
        district: 'Tirunelveli',
        lat: 8.7139,
        lng: 77.7567,
        agroZone: 'Southern Zone (TN-7)',
        majorSoil: 'Deep black soils & Red sandy soils',
      },
      {
        state: 'Tamil Nadu',
        district: 'Salem',
        lat: 11.6643,
        lng: 78.146,
        agroZone: 'North Western Zone (TN-2)',
        majorSoil: 'Red gravelly & Sandy loam',
      },
      {
        state: 'Tamil Nadu',
        district: 'Dindigul',
        lat: 10.3673,
        lng: 77.9803,
        agroZone: 'Southern Zone (TN-6)',
        majorSoil: 'Red soil & Calcareous black soil',
      },
      {
        state: 'Tamil Nadu',
        district: 'Theni',
        lat: 10.0104,
        lng: 77.4768,
        agroZone: 'Southern High Rainfall / Hill Zone',
        majorSoil: 'Alluvial & Porous loamy soil',
      },
      {
        state: 'Tamil Nadu',
        district: 'Tiruchirappalli',
        lat: 10.7905,
        lng: 78.7047,
        agroZone: 'Cauvery Basin Zone',
        majorSoil: 'Alluvial & Red sandy soil',
      },
    ],
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      {
        state: 'Andhra Pradesh',
        district: 'Guntur',
        lat: 16.3067,
        lng: 80.4365,
        agroZone: 'Krishna-Godavari Zone',
        majorSoil: 'Black cotton soil & Coastal alluvial',
      },
      {
        state: 'Andhra Pradesh',
        district: 'Kurnool',
        lat: 15.8281,
        lng: 78.0373,
        agroZone: 'Scarce Rainfall Zone',
        majorSoil: 'Black calcareous soil',
      },
      {
        state: 'Andhra Pradesh',
        district: 'Anantapur',
        lat: 14.6819,
        lng: 77.6006,
        agroZone: 'Arid Rayalaseema Zone',
        majorSoil: 'Red sandy soil & Skeletal soils',
      },
    ],
  },
  {
    state: 'Karnataka',
    districts: [
      {
        state: 'Karnataka',
        district: 'Dharwad',
        lat: 15.4589,
        lng: 75.0078,
        agroZone: 'Northern Transitional Zone',
        majorSoil: 'Medium to deep black soils',
      },
      {
        state: 'Karnataka',
        district: 'Mandya',
        lat: 12.524,
        lng: 76.897,
        agroZone: 'Southern Dry Zone',
        majorSoil: 'Red sandy loam & Clay loam',
      },
      {
        state: 'Karnataka',
        district: 'Belagavi',
        lat: 15.8497,
        lng: 74.4977,
        agroZone: 'Northern Transitional & Hilly',
        majorSoil: 'Black soil & Lateritic soil',
      },
    ],
  },
  {
    state: 'Maharashtra',
    districts: [
      {
        state: 'Maharashtra',
        district: 'Nashik',
        lat: 19.9975,
        lng: 73.7898,
        agroZone: 'Western Ghat / Scarcity Transition',
        majorSoil: 'Medium black & Coarse shallow soil',
      },
      {
        state: 'Maharashtra',
        district: 'Nagpur',
        lat: 21.1458,
        lng: 79.0882,
        agroZone: 'Eastern Vidarbha Zone',
        majorSoil: 'Deep black clayey (Regur)',
      },
      {
        state: 'Maharashtra',
        district: 'Solapur',
        lat: 17.6599,
        lng: 75.9064,
        agroZone: 'Drought Prone Scarcity Zone',
        majorSoil: 'Medium to deep black soil',
      },
    ],
  },
  {
    state: 'Punjab',
    districts: [
      {
        state: 'Punjab',
        district: 'Ludhiana',
        lat: 30.901,
        lng: 75.8573,
        agroZone: 'Central Plain Zone',
        majorSoil: 'Coarse to fine loamy alluvial',
      },
      {
        state: 'Punjab',
        district: 'Bathinda',
        lat: 30.211,
        lng: 74.9455,
        agroZone: 'South-Western Semi-Arid Zone',
        majorSoil: 'Sierozem & Desert soils',
      },
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      {
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        lat: 25.3176,
        lng: 82.9739,
        agroZone: 'Eastern Plain Agro-Climatic Zone',
        majorSoil: 'Gangetic alluvial loam',
      },
      {
        state: 'Uttar Pradesh',
        district: 'Gorakhpur',
        lat: 26.7606,
        lng: 83.3732,
        agroZone: 'North Eastern Plain Zone',
        majorSoil: 'Calcareous alluvial soil',
      },
    ],
  },
  {
    state: 'West Bengal',
    districts: [
      {
        state: 'West Bengal',
        district: 'Burdwan',
        lat: 23.2324,
        lng: 87.8615,
        agroZone: 'Old Alluvial Zone',
        majorSoil: 'Gangetic silt loam & Clay',
      },
      {
        state: 'West Bengal',
        district: 'Murshidabad',
        lat: 24.1759,
        lng: 88.2802,
        agroZone: 'New Alluvial Zone',
        majorSoil: 'Deep fertile alluvial soil',
      },
    ],
  },
  {
    state: 'Gujarat',
    districts: [
      {
        state: 'Gujarat',
        district: 'Rajkot',
        lat: 22.3039,
        lng: 70.8022,
        agroZone: 'North Saurashtra Agro-Climatic Zone',
        majorSoil: 'Medium black & Skeletal soil',
      },
      {
        state: 'Gujarat',
        district: 'Anand',
        lat: 22.5645,
        lng: 72.9289,
        agroZone: 'Middle Gujarat Agro-Climatic Zone',
        majorSoil: 'Goradu (sandy loam) & Deep black',
      },
    ],
  },
];

export const DEFAULT_LOCATION: LocationInfo = {
  state: 'Tamil Nadu',
  district: 'Madurai',
  lat: 9.9252,
  lng: 78.1198,
  agroZone: 'Southern Dry Zone (TN-6)',
  majorSoil: 'Red sandy loam & Clayey black soil',
};
