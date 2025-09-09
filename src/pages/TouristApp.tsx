import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  MapPin,
  Shield,
  QrCode,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Restricted zones import
import { restrictedZones } from "../data/restrictedZones";

// Fix default Leaflet icon
if ((L.Icon.Default.prototype as any)._getIconUrl) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface TouristData {
  id: string;
  name: string;
  age: string;
  idProof: string;
  emergencyContact: string;
  itinerary: string;
  location?: { lat: number; lng: number };
}

// ✅ Haversine distance (meters)
const getDistanceFromLatLonInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const TouristApp = () => {
  const [step, setStep] = useState<"register" | "dashboard">("register");
  const [touristData, setTouristData] = useState<TouristData>({
    id: "",
    name: "",
    age: "",
    idProof: "",
    emergencyContact: "",
    itinerary: "",
  });
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { toast } = useToast();

  // Track location
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(newLocation);
            setTouristData((prev) => ({ ...prev, location: newLocation }));

            if (checkRestrictedZone(newLocation)) {
              toast({
                title: "⚠️ Restricted Area Warning",
                description:
                  "You are entering a restricted area. Please return to safe zones.",
                variant: "destructive",
              });
            }
          },
          (error) => {
            console.error("Location error:", error);
          }
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isTracking, toast]);

  // ✅ Check restricted zone correctly
  const checkRestrictedZone = (location: { lat: number; lng: number }) => {
    return restrictedZones.some((zone) => {
      const distance = getDistanceFromLatLonInMeters(
        location.lat,
        location.lng,
        zone.lat,
        zone.lng
      );
      return distance <= zone.radius;
    });
  };

  const handleRegister = () => {
    if (
      !touristData.name ||
      !touristData.age ||
      !touristData.idProof ||
      !touristData.emergencyContact
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    const newId =
      "TRS-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    setTouristData((prev) => ({ ...prev, id: newId }));
    setStep("dashboard");
    setIsTracking(true);
    toast({
      title: "Registration Successful!",
      description: `Tourist ID: ${newId} - Location tracking activated.`,
    });
  };

const handleSOS = () => {
  if (currentLocation) {
    // Google Maps link with coordinates
    const mapsLink = `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;

    // Create SMS link with emergency contact, name, and location link
    const smsBody = encodeURIComponent(
      `🚨 SOS! This is ${touristData.name}. I need help!\nMy location: ${mapsLink}`
    );

    const smsLink = `sms:${touristData.emergencyContact}?body=${smsBody}`;

    // Open SMS app
    window.location.href = smsLink;

    // Toast for user feedback
    toast({
      title: "🚨 SOS ALERT!",
      description: `Opening SMS app to notify your emergency contact.`,
      variant: "destructive",
    });

    console.log("SOS Alert:", {
      touristId: touristData.id,
      name: touristData.name,
      location: currentLocation,
      mapsLink,
      timestamp: new Date().toISOString(),
      emergencyContact: touristData.emergencyContact,
    });
  }
};



  // ===================== REGISTER PAGE =====================
  if (step === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-8 w-8 text-success" />
              <h1 className="text-3xl font-bold text-success">
                Tourist Registration
              </h1>
            </div>
            <p className="text-muted-foreground">
              Register for safety monitoring and emergency protection
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Provide your details for emergency identification and contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={touristData.name}
                    onChange={(e) =>
                      setTouristData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={touristData.age}
                    onChange={(e) =>
                      setTouristData((prev) => ({
                        ...prev,
                        age: e.target.value,
                      }))
                    }
                    placeholder="Enter your age"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="idProof">ID Proof *</Label>
                <Input
                  id="idProof"
                  value={touristData.idProof}
                  onChange={(e) =>
                    setTouristData((prev) => ({
                      ...prev,
                      idProof: e.target.value,
                    }))
                  }
                  placeholder="Enter your ID proof number"
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  value={touristData.emergencyContact}
                  onChange={(e) =>
                    setTouristData((prev) => ({
                      ...prev,
                      emergencyContact: e.target.value,
                    }))
                  }
                  placeholder="Emergency contact phone number"
                />
              </div>

              <div>
                <Label htmlFor="itinerary">Planned Itinerary</Label>
                <Textarea
                  id="itinerary"
                  value={touristData.itinerary}
                  onChange={(e) =>
                    setTouristData((prev) => ({
                      ...prev,
                      itinerary: e.target.value,
                    }))
                  }
                  placeholder="Describe your planned activities"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleRegister}
                variant="success"
                size="lg"
                className="w-full"
              >
                Register & Start Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===================== DASHBOARD PAGE =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-emergency/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-success" />
              <div>
                <h1 className="text-3xl font-bold text-success">
                  Tourist Dashboard
                </h1>
                <p className="text-muted-foreground">ID: {touristData.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-success font-medium">Tracking Active</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Your QR Code
                </CardTitle>
                <CardDescription>
                  Show this to authorities for identification
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block shadow-inner">
                  <QRCodeSVG
                    value={JSON.stringify({
                      id: touristData.id,
                      name: touristData.name,
                    })}
                    size={180}
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Tourist ID: {touristData.id}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Name:</strong> {touristData.name}
                </div>
                <div>
                  <strong>Age:</strong> {touristData.age}
                </div>
                <div>
                  <strong>ID:</strong> {touristData.idProof}
                </div>
                <div>
                  <strong>Emergency:</strong> {touristData.emergencyContact}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle column */}
          <div className="space-y-6">
            <Card className="border-emergency/30">
              <CardHeader>
                <CardTitle className="text-emergency">
                  Emergency Controls
                </CardTitle>
                <CardDescription>
                  Use in case of immediate danger
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSOS}
                  variant="emergency"
                  size="lg"
                  className="w-full text-xl py-8 emergency-pulse"
                >
                  🚨 SOS EMERGENCY
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentLocation ? (
                  <div className="space-y-4">
                    <div>
                      <strong>Latitude:</strong>{" "}
                      {currentLocation.lat.toFixed(6)}
                    </div>
                    <div>
                      <strong>Longitude:</strong>{" "}
                      {currentLocation.lng.toFixed(6)}
                    </div>

                    <div className="flex justify-end mb-2">
                      {!isFullScreen && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsFullScreen(true)}
                        >
                          Expand Map
                        </Button>
                      )}
                    </div>

                    {/* Small map */}
                    {!isFullScreen && (
                      <MapContainer
                        center={[currentLocation.lat, currentLocation.lng]}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{ height: "300px", width: "100%" }}
                        className="rounded-lg overflow-hidden shadow-md"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[currentLocation.lat, currentLocation.lng]}>
                          <Popup>You are here!</Popup>
                        </Marker>
                        {restrictedZones.map((zone, index) => (
                          <Circle
                            key={index}
                            center={[zone.lat, zone.lng]}
                            radius={zone.radius}
                            pathOptions={{
                              color: "red",
                              fillColor: "red",
                              fillOpacity: 0.3,
                            }}
                          />
                        ))}
                      </MapContainer>
                    )}

                    {/* Fullscreen modal */}
                    {isFullScreen && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-[80%] h-[60vh] overflow-hidden">
                          {/* Close button */}
                          <button
                            onClick={() => setIsFullScreen(false)}
                            className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg shadow hover:bg-red-700"
                            style={{ zIndex: 9999 }}
                          >
                            ✕ Close
                          </button>

                          <MapContainer
                            center={[currentLocation.lat, currentLocation.lng]}
                            zoom={13}
                            scrollWheelZoom={true}
                            style={{ height: "100%", width: "100%", zIndex: 0 }}
                            className="rounded-b-2xl"
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[currentLocation.lat, currentLocation.lng]}>
                              <Popup>You are here!</Popup>
                            </Marker>
                            {restrictedZones.map((zone, i) => (
                              <Circle
                                key={i}
                                center={[zone.lat, zone.lng]}
                                radius={zone.radius}
                                pathOptions={{
                                  color: "red",
                                  fillColor: "red",
                                  fillOpacity: 0.3,
                                }}
                              />
                            ))}
                          </MapContainer>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Getting your location...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle className="text-warning flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Safety Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="font-medium text-success">All Clear</div>
                  <div className="text-sm text-muted-foreground">
                    You are in a safe zone
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                {touristData.itinerary ? (
                  <p className="text-muted-foreground">{touristData.itinerary}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No itinerary provided
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Location Tracking</span>
                  <span className="text-success font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Emergency Ready</span>
                  <span className="text-success font-medium">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Restricted Zones</span>
                  <span className="text-warning font-medium">
                    {restrictedZones.length} zones
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristApp;
