export interface ParkingArea {
  id: string
  name: string
  address: string
  totalSlots: number
  availableSlots: number
  price: number
  rating: number
  distance: number
  features: string[]
  description: string
  openingHours: string
}

export const parkingAreas: ParkingArea[] = [
  {
    id: "chennai-central",
    name: "Chennai Central Parking Complex",
    address: "Central Railway Station, Park Town, Chennai",
    totalSlots: 120,
    availableSlots: 45,
    price: 30,
    rating: 4.8,
    distance: 0.3,
    features: ["CCTV", "24/7", "Covered", "EV Charging", "Valet"],
    description: "Premium parking facility near Chennai Central Railway Station with 24/7 security and EV charging.",
    openingHours: "24/7",
  },
  {
    id: "erode-central",
    name: "Erode Central Parking",
    address: "Near Erode Junction Railway Station, Erode",
    totalSlots: 90,
    availableSlots: 32,
    price: 25,
    rating: 4.5,
    distance: 0.4,
    features: ["CCTV", "24/7", "Covered", "Car Wash"],
    description: "Convenient parking near Erode Junction with covered facilities and car wash services.",
    openingHours: "6:00 AM – 11:00 PM",
  },
  {
    id: "madurai-meenakshi",
    name: "Madurai Meenakshi Temple Parking",
    address: "South Tower Rd, Near Meenakshi Amman Temple, Madurai",
    totalSlots: 80,
    availableSlots: 38,
    price: 25,
    rating: 4.6,
    distance: 0.5,
    features: ["CCTV", "24/7", "Covered Parking", "EV Charging"],
    description: "Secure multi-level parking facility near the historic Meenakshi Amman Temple.",
    openingHours: "6:00 AM – 11:00 PM",
  },
  {
    id: "trichy-rockfort",
    name: "Trichy Rockfort Parking",
    address: "Near Rockfort Temple, Tiruchirappalli",
    totalSlots: 120,
    availableSlots: 55,
    price: 30,
    rating: 4.7,
    distance: 0.6,
    features: ["CCTV", "24/7", "Covered", "EV Charging", "Valet"],
    description: "Spacious parking complex near the iconic Rockfort Temple with premium amenities.",
    openingHours: "5:30 AM – 10:00 PM",
  },
  {
    id: "marina-beach",
    name: "Marina Beach Parking",
    address: "Marina Beach Road, Chennai",
    totalSlots: 300,
    availableSlots: 120,
    price: 20,
    rating: 4.3,
    distance: 1.2,
    features: ["CCTV", "Open Air", "EV Charging", "Restrooms"],
    description: "Large open-air parking facility near Marina Beach, perfect for day trips and events.",
    openingHours: "6:00 AM – 8:00 PM",
  },
  {
    id: "coimbatore-city",
    name: "Coimbatore City Center Parking",
    address: "Near City Center Mall, Coimbatore",
    totalSlots: 150,
    availableSlots: 68,
    price: 35,
    rating: 4.9,
    distance: 0.8,
    features: ["CCTV", "24/7", "Covered", "EV Charging", "Valet", "Car Wash"],
    description: "Premium parking at Coimbatore's largest shopping and entertainment complex.",
    openingHours: "24/7",
  },
]
