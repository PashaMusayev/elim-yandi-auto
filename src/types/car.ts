export type CarStatus = 'satishda' | 'rezerv' | 'satildi';
export type FuelType = 'benzin' | 'dizel' | 'hibrid' | 'elektrik' | 'qaz_benzin';
export type GearboxType = 'avtomat' | 'mexanika' | 'robot' | 'variator';

export interface CarImage {
  id: string;
  car_id: string;
  path: string;
  thumb: string;
  position: number;
}

export interface Car {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  engine_l: number | null;
  engine_hp: number | null;
  fuel: FuelType;
  gearbox: GearboxType;
  mileage_km: number | null;
  body_type: string | null;
  color: string | null;
  drive: string | null;
  description: string | null;
  tiktok_url: string | null;
  status: CarStatus;
  is_featured: boolean;
  cover_thumb: string | null;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarWithImages extends Car {
  car_images: CarImage[];
}

export interface CarStats {
  id: string;
  brand: string;
  model: string;
  year: number;
  status: CarStatus;
  views: number;
  whatsapp_clicks: number;
  call_clicks: number;
}

export const FUEL_LABEL: Record<FuelType, string> = {
  benzin: 'Benzin',
  dizel: 'Dizel',
  hibrid: 'Hibrid',
  elektrik: 'Elektrik',
  qaz_benzin: 'Qaz-Benzin',
};

export const GEARBOX_LABEL: Record<GearboxType, string> = {
  avtomat: 'Avtomat',
  mexanika: 'Mexanika',
  robot: 'Robot',
  variator: 'Variator',
};

export const STATUS_LABEL: Record<CarStatus, string> = {
  satishda: 'Satışda',
  rezerv: 'Rezerv',
  satildi: 'Satıldı',
};
