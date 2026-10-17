import { TrainConnection } from "../types/connection";

export const MOCK_CONNECTIONS: TrainConnection[] = [
  {
    id: "conn-1",
    departureTime: "07:28",
    arrivalTime: "11:22",
    departureStation: "Berlin Hbf",
    arrivalStation: "München Hbf",
    duration: "3h 54m",
    transfers: 0,
    price: 19.90,
    originalPrice: 79.90,
    dealTag: "Cheapest",
    trainTypes: ["ICE Sprinter"],
    date: "2026-10-24",
    punctualityScore: 94,
    ecoSaverKgCO2: 82,
    availableSeats: "Medium",
    legs: [
      {
        id: "leg-1-1",
        trainType: "ICE",
        trainNumber: "ICE 1005",
        departureStation: "Berlin Hbf (tief)",
        departureTime: "07:28",
        arrivalStation: "München Hbf",
        arrivalTime: "11:22",
        duration: "3h 54m",
        platform: "Gl. 1"
      }
    ]
  },
  {
    id: "conn-2",
    departureTime: "08:04",
    arrivalTime: "11:58",
    departureStation: "Berlin Hbf",
    arrivalStation: "München Hbf",
    duration: "3h 54m",
    transfers: 0,
    price: 27.90,
    originalPrice: 89.00,
    dealTag: "Best Value",
    trainTypes: ["ICE"],
    date: "2026-10-24",
    punctualityScore: 96,
    ecoSaverKgCO2: 82,
    availableSeats: "High",
    legs: [
      {
        id: "leg-2-1",
        trainType: "ICE",
        trainNumber: "ICE 701",
        departureStation: "Berlin Hbf (tief)",
        departureTime: "08:04",
        arrivalStation: "München Hbf",
        arrivalTime: "11:58",
        duration: "3h 54m",
        platform: "Gl. 2"
      }
    ]
  },
  {
    id: "conn-3",
    departureTime: "09:34",
    arrivalTime: "13:42",
    departureStation: "Berlin Hbf",
    arrivalStation: "München Hbf",
    duration: "4h 08m",
    transfers: 1,
    price: 17.50,
    originalPrice: 65.00,
    dealTag: "Secret Sparpreis",
    trainTypes: ["ICE", "RE"],
    date: "2026-10-24",
    punctualityScore: 89,
    ecoSaverKgCO2: 78,
    availableSeats: "Low",
    legs: [
      {
        id: "leg-3-1",
        trainType: "ICE",
        trainNumber: "ICE 1709",
        departureStation: "Berlin Hbf",
        departureTime: "09:34",
        arrivalStation: "Nürnberg Hbf",
        arrivalTime: "12:12",
        duration: "2h 38m",
        platform: "Gl. 5"
      },
      {
        id: "leg-3-2",
        trainType: "RE",
        trainNumber: "RE 1 (Allersberg-Express)",
        departureStation: "Nürnberg Hbf",
        departureTime: "12:28",
        arrivalStation: "München Hbf",
        arrivalTime: "13:42",
        duration: "1h 14m",
        platform: "Gl. 9"
      }
    ]
  },
  {
    id: "conn-4",
    departureTime: "11:04",
    arrivalTime: "14:52",
    departureStation: "Berlin Hbf",
    arrivalStation: "München Hbf",
    duration: "3h 48m",
    transfers: 0,
    price: 34.90,
    originalPrice: 99.50,
    dealTag: "Fastest",
    trainTypes: ["ICE Sprinter"],
    date: "2026-10-24",
    punctualityScore: 92,
    ecoSaverKgCO2: 82,
    availableSeats: "High",
    legs: [
      {
        id: "leg-4-1",
        trainType: "ICE",
        trainNumber: "ICE 1009",
        departureStation: "Berlin Hbf (tief)",
        departureTime: "11:04",
        arrivalStation: "München Hbf",
        arrivalTime: "14:52",
        duration: "3h 48m",
        platform: "Gl. 1"
      }
    ]
  },
  {
    id: "conn-5",
    departureTime: "13:28",
    arrivalTime: "17:45",
    departureStation: "Berlin Hbf",
    arrivalStation: "München Hbf",
    duration: "4h 17m",
    transfers: 1,
    price: 21.90,
    originalPrice: 84.00,
    trainTypes: ["ICE", "IC"],
    date: "2026-10-24",
    punctualityScore: 91,
    ecoSaverKgCO2: 80,
    availableSeats: "Medium",
    legs: [
      {
        id: "leg-5-1",
        trainType: "ICE",
        trainNumber: "ICE 699",
        departureStation: "Berlin Hbf",
        departureTime: "13:28",
        arrivalStation: "Erfurt Hbf",
        arrivalTime: "15:05",
        duration: "1h 37m",
        platform: "Gl. 3"
      },
      {
        id: "leg-5-2",
        trainType: "IC",
        trainNumber: "IC 2063",
        departureStation: "Erfurt Hbf",
        departureTime: "15:20",
        arrivalStation: "München Hbf",
        arrivalTime: "17:45",
        duration: "2h 25m",
        platform: "Gl. 7"
      }
    ]
  },
  {
    id: "conn-6",
    departureTime: "16:04",
    arrivalTime: "20:01",
    departureStation: "Berlin Hbf",
    arrivalStation: "München Hbf",
    duration: "3h 57m",
    transfers: 0,
    price: 29.90,
    originalPrice: 112.00,
    trainTypes: ["ICE"],
    date: "2026-10-24",
    punctualityScore: 88,
    ecoSaverKgCO2: 82,
    availableSeats: "Medium",
    legs: [
      {
        id: "leg-6-1",
        trainType: "ICE",
        trainNumber: "ICE 805",
        departureStation: "Berlin Hbf",
        departureTime: "16:04",
        arrivalStation: "München Hbf",
        arrivalTime: "20:01",
        duration: "3h 57m",
        platform: "Gl. 2"
      }
    ]
  }
];

export const POPULAR_ROUTES = [
  { from: "Berlin Hbf", to: "München Hbf", price: "from €17.50", time: "3h 54m", trend: "-68%" },
  { from: "Hamburg Hbf", to: "Köln Hbf", price: "from €14.90", time: "3h 36m", trend: "-55%" },
  { from: "Frankfurt (M) Hbf", to: "Berlin Hbf", price: "from €19.90", time: "4h 05m", trend: "-60%" },
  { from: "München Hbf", to: "Wien Hbf", price: "from €24.90", time: "4h 02m", trend: "-45%" },
  { from: "Köln Hbf", to: "Amsterdam Centraal", price: "from €18.90", time: "2h 38m", trend: "-52%" },
];

export const CALENDAR_DEALS = [
  { day: "Wed 21", price: "€29", lowest: false },
  { day: "Thu 22", price: "€24", lowest: false },
  { day: "Fri 23", price: "€39", lowest: false },
  { day: "Sat 24", price: "€17.50", lowest: true },
  { day: "Sun 25", price: "€35", lowest: false },
  { day: "Mon 26", price: "€19.90", lowest: false },
  { day: "Tue 27", price: "€22", lowest: false },
];
