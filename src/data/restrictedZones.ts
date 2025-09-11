// src/data/restrictedZones.ts

export type ZoneType = "green" | "yellow" | "red" | "restricted";

// INTERFACE: Defines the required shape for a zone object.
export interface RestrictedZone {
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  type: ZoneType;
}

// ARRAY: Contains the specific safety zones for the DTU campus.
export const restrictedZones: RestrictedZone[] = [
  {
    name: "DTU OAT (High Risk)",
    lat: 28.749960,  // Approximate coordinates for the Open Air Theatre
    lng: 77.117455,
    radius: 100,   // A 200-meter high-risk radius
    type: "red",
  },
  {
    name: "DTU Academic Block (Caution)",
    lat: 28.75003691728533,  // Approximate coordinates for the main Academic Blocks
    lng: 77.11463442082062,
    radius: 100,   // A wider 300-meter caution radius
    type: "yellow",
  },
  {
    name: "DTU Girls Hostel (Restricted)",
    lat: 28.748183178535093,  // Approximate coordinates for the girls' hostel area
    lng: 77.11916869539957,
    radius: 100,   // A 250-meter restricted access zone
    type: "restricted",
  },
];