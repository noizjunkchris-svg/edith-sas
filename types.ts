
export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  season: string;
  model: string;
  productType: string;
  color: string;
  size: string;
  price: string;
  quantity: number;
  timestamp: number;
}

export type ScanStatus = 'idle' | 'scanning' | 'analyzing' | 'success' | 'error';
