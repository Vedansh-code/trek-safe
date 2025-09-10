// src/data/restrictedZones.ts
export type ZoneType = "green" | "yellow" | "red" | "restricted";

export interface RestrictedZone {
  lat: number;
  lng: number;
  radius: number; // in meters
  type: string
}

// data/restrictedZones.ts
export const restrictedZones = [
  // 🟥 Red Zone near DTU Delhi
  { lat: 28.7499, lng: 77.1170, radius: 200, type: "red" },

  // 🟨 Yellow Zone near DTU Delhi
  { lat: 28.7515, lng: 77.1150, radius: 300, type: "yellow" },

  // ⛔ Restricted Zone (dummy nearby)
  { lat: 28.7502, lng: 77.1190, radius: 250, type: "restricted" },

  // ✅ Green Zone isn’t stored — default if not in any other
];
