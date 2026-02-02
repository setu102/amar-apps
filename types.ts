
// =====================
// CATEGORY TYPE
// =====================
export type Category =
  | 'emergency'
  | 'doctors'
  | 'hospitals'
  | 'personalities'
  | 'prayer'
  | 'holidays'
  | 'education'
  | 'trains'
  | 'map_explore'
  | 'govt_services'
  | 'notices'
  | 'jobs'
  | 'market_price';

// =====================
// SCHEMA TYPES (SDK Port)
// =====================
export enum Type {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
}

// =====================
// EMERGENCY
// =====================
export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  type: 'police' | 'fire' | 'ambulance' | 'government';
}

// =====================
// DOCTORS
// =====================
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  mobile: string;
  timing: string;
  imageUrl?: string;
}

// =====================
// HOSPITALS
// =====================
export interface Hospital {
  id: string;
  name: string;
  address: string;
  mobile: string;
  type: 'govt' | 'private' | 'diagnostic';
  imageUrl?: string;
}

// =====================
// TRAINS
// =====================
export interface Train {
  id: string;
  name: string;
  route: string;
  detailedRoute: string;
  departure: string;
  arrival?: string;
  offDay: string;
  type: 'intercity' | 'mail' | 'commuter';
}

// =====================
// AI INFERENCE
// =====================
export interface AIInference {
  delayMinutes: number;
  confidence: number;
  reason: string;
  isAI: boolean;
}

// =====================
// PERSONALITIES
// =====================
export interface Personality {
  id: string;
  name: string;
  role: string;
  contact?: string;
  imageUrl?: string;
  bio?: string;
}

// =====================
// EDUCATION
// =====================
export interface Institution {
  id: string;
  name: string;
  address: string;
  headName: string;
  mobile: string;
  type: 'school' | 'college' | 'madrasa';
}

// =====================
// HOLIDAYS
// =====================
export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
}

// =====================
// PRAYER
// =====================
export interface PrayerTime {
  id: string;
  name: string;
  time: string;
  icon?: string;
}

// =====================
// MARKET PRICE
// =====================
export interface MarketItem {
  id: string;
  name: string;
  unit: string;
  priceRange: string;
  trend?: 'up' | 'down' | 'stable';
  isAI?: boolean;
}

// =====================
// NOTICES
// =====================
export interface Notice {
  id: string;
  title: string;
  date: string;
  summary: string;
  details?: string;
  priority?: 'high' | 'normal';
}

// =====================
// JOBS
// =====================
export interface Job {
  id: string;
  title: string;
  org: string;
  deadline: string;
  eligibility?: string;
  salary?: string;
  age?: string;
  link: string;
  type?: string;
}
