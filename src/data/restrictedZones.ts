// src/data/restrictedZones.ts

export interface RestrictedZone {
  lat: number;
  lng: number;
  radius: number; // in meters
}

export const restrictedZones: RestrictedZone[] = [
    
  { lat: 28.749952086016066, lng: 77.11751671585728, radius: 45 },   // dtu oat zone
  { lat: 28.738712, lng: 779.116145, radius: 500 }, // Another zone
  { lat: 34.0522, lng: -118.2437, radius: 1200 },  // Los Angeles zone
  { lat: 51.5074, lng: -0.1278, radius: 800 },    // London zone
];
  