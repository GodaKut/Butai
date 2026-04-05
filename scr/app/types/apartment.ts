export interface Apartment {
  id: number;
  address: string;
  district: string;
  price: number;
  imageUrl: string;
  url: string;
  status: 'interested' | 'patricija-approves' | 'to-view' | 'viewed' | 'offer';
  floor: string;
  yearBuilt: number;
  rooms: number;
  area: string;
  currentFloor: string;
}

export const calculateFirstInstallment = (price: number): number => {
  if (price < 2000) {
    return price * 0.15;
  }
  return price * 0.20;
};