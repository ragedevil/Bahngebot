export interface Leg {
  id: string;
  trainType: "ICE" | "IC" | "RE" | "RB" | "EC";
  trainNumber: string;
  departureStation: string;
  departureTime: string;
  arrivalStation: string;
  arrivalTime: string;
  duration: string;
  platform?: string;
}

export interface TrainConnection {
  id: string;
  departureTime: string;
  arrivalTime: string;
  departureStation: string;
  arrivalStation: string;
  duration: string;
  transfers: number;
  price: number;
  originalPrice?: number;
  dealTag?: "Cheapest" | "Fastest" | "Best Value" | "Secret Sparpreis";
  trainTypes: string[];
  legs: Leg[];
  punctualityScore?: number; // percentage
  ecoSaverKgCO2?: number;
  availableSeats: "High" | "Medium" | "Low";
  date: string;
}

export interface SearchFilterState {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  passengers: number;
  classType: "2nd" | "1st";
  bahnCard: "None" | "BC25" | "BC50";
  maxTransfers: number | "any";
  sortBy: "cheapest" | "fastest" | "best";
}
