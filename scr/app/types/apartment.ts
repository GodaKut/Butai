export interface Apartment {
  id: string;
  address: string;
  district: string;
  yearBuilt: number;
  price: number;
  imageUrl: string;
  floor?: string;
  url: string;
  status: 'interested' | 'patricija-approves' | 'to-view' | 'viewed' | 'offer';
}

export const calculateFirstInstallment = (price: number): number => {
  if (price < 2000) {
    return price * 0.15;
  }
  return price * 0.20;
};