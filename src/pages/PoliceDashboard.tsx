import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  MapPin,
  AlertTriangle,
  Users,
  QrCode,
  ArrowLeft,
  Search,
  Bell,
  Eye,
  Clock,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet icon fix
if ((L.Icon.Default.prototype as any)._getIconUrl) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ====================== Interfaces ======================
interface Tourist {
  id: string;
  name: string;
  age: string;
  location: { lat: number; lng: number };
  status: "safe" | "warning" | "emergency";
  lastUpdate: string;
  emergencyContact: string;
}

interface Alert {
  id: string;
  type: "sos" | "geofence" | "inactive";
  touristId: string;
  touristName: string;
  message: string;
  location: { lat: number; lng: number };
  timestamp: string;
  status: "active" | "resolved";
}

// ====================== Backend URL ======================
const API_BASE = import.meta.env.VITE_API_BASE || "https://trek-safe-backend.onrender.com";

// ====================== Component ======================
const PoliceDashboard = () => {
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();

  // ====================== Fetch Data ======================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tourists (with latest location + SOS)
        const res = await fetch(`${API_BASE}/police/tourists`);
        const data = await res.json();

        const mappedTourists: Tourist[] = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          age: String(t.age),
          location:
            t.currentLat && t.currentLng
              ? { lat: t.currentLat, lng: t.currentLng }
              : { lat: 0, lng: 0 },
          status: t.lastSOS
            ? "emergency"
            : t.currentLat
            ? "safe"
            : "warning",
          lastUpdate: t.created_at,
          emergencyContact: t.emergencyContact,
        }));

        setTourists(mappedTourists);

        // SOS Alerts
        const sosRes = await fetch(`${API_BASE}/sos_alerts`);
        const sosData = await sosRes.json();

        const mappedAlerts: Alert[] = sosData.map((a: any) => ({
          id: `ALERT-${a.id}`,
          type: "sos",
          touristId: a.touristId,
          touristName:
            mappedTourists.find((t) => t.id === a.touristId)?.name ||
            "Unknown",
          message: "Emergency SOS alert triggered",
          location: { lat: a.lat, lng: a.lng },
          timestamp: a.timestamp,
          status: "active",
        }));

        setAlerts(mappedAlerts);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // ====================== Helpers ======================
  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-green-600 bg-green-100 border-green-300";
      case "warning":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      case "emergency":
        return "text-red-600 bg-red-100 border-red-300";
      default:
        return "text-muted-foreground";
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "sos":
        return "text-red-600 bg-red-100 border-red-300";
      case "geofence":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      case "inactive":
        return "text-gray-500 bg-gray-100 border-gray-300";
      default:
        return "text-muted-foreground";
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved" } : alert
      )
    );
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved",
    });
  };

  const filteredTourists = tourists.filter(
    (tourist) =>
      tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tourist.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeAlerts = alerts.filter((alert) => alert.status === "active");

  const openModal = (tourist: Tourist) => setSelectedTourist(tourist);

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTourist(null), 300);
  };

  useEffect(() => {
    if (selectedTourist) {
      setIsModalOpen(false);
      setTimeout(() => setIsModalOpen(true), 10);
    }
  }, [selectedTourist]);

  // ====================== Render ======================
  return (
    <div className="min-h-screen bg-gradient-to-br from-police/5 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-police" />
              <div>
                <h1 className="text-3xl font-bold text-police">
                  Police Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Tourist Safety Monitoring & Incident Response
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {activeAlerts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600 animate-pulse" />
                  <Badge variant="destructive">
                    {activeAlerts.length} Active Alerts
                  </Badge>
                </div>
              )}
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Active Tourists
                </div>
                <div className="text-2xl font-bold text-police">
                  {tourists.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Alerts */}
            <Card className="border-red-300">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts ({activeAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeAlerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No active alerts
                  </p>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getAlertTypeColor(
                        alert.type
                      )}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            alert.type === "sos" ? "destructive" : "secondary"
                          }
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="font-medium">{alert.touristName}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                        className="w-full"
                      >
                        Resolve
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* QR Scanner Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Scanner
                </CardTitle>
                <CardDescription>
                  Scan tourist QR codes for profile access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/pages" className="block">
                <Button variant="police" className="w-full mb-4">
                  Open Scanner
                </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center">
                  Instantly access tourist profiles and itineraries
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Live Tourist Monitoring
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tourists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="police" onClick={() => setShowMap(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Map View
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Tourists List */}
            <div className="grid gap-4">
              {filteredTourists.map((tourist) => (
                <Card
                  key={tourist.id}
                  className={`transition-all duration-200 hover:shadow-md ${
                    tourist.status === "emergency" ? "border-red-400" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(
                            tourist.status
                          )}`}
                        >
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {tourist.name}
                          </h3>
                          <p className="text-muted-foreground">{tourist.id}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {tourist.location.lat.toFixed(4)},{" "}
                              {tourist.location.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(tourist.status)}>
                          {tourist.status.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(tourist.lastUpdate).toLocaleTimeString()}
                        </div>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal(tourist)}
                          >
                            View Details
                          </Button>
                          {tourist.status === "emergency" && (
                            <Button size="sm" variant="destructive">
                              Respond
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tourist Modal */}
      {selectedTourist && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
            isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeModal}
        >
          <div
            className={`bg-background rounded-xl shadow-lg max-w-lg w-full p-6 transform transition-all duration-300 ${
              isModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-police">Tourist Details</h2>
              <Button variant="ghost" onClick={closeModal}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong> {selectedTourist.name}
                </div>
                <div>
                  <strong>Age:</strong> {selectedTourist.age}
                </div>
                <div>
                  <strong>Tourist ID:</strong> {selectedTourist.id}
                </div>
                <div
                  className={`font-medium ${getStatusColor(
                    selectedTourist.status
                  )}`}
                >
                  <strong>Status:</strong>{" "}
                  {selectedTourist.status.toUpperCase()}
                </div>
                <div>
                  <strong>Emergency Contact:</strong>{" "}
                  {selectedTourist.emergencyContact}
                </div>
                <div>
                  <strong>Last Update:</strong>{" "}
                  {new Date(selectedTourist.lastUpdate).toLocaleString()}
                </div>
              </div>

              {/* Mini map */}
              <div>
                <strong>Current Location:</strong>
                <div className="mt-2 h-64 w-full rounded-lg overflow-hidden border">
                  <MapContainer
                    center={[
                      selectedTourist.location.lat,
                      selectedTourist.location.lng,
                    ]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[
                        selectedTourist.location.lat,
                        selectedTourist.location.lng,
                      ]}
                    >
                      <Popup>
                        {selectedTourist.name} (
                        {selectedTourist.status.toUpperCase()})
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="police">Call Emergency Contact</Button>
                <Button variant="outline">Send Message</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Popup */}
      {showMap && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowMap(false)}
        >
          <div
            className="relative bg-background rounded-2xl shadow-xl w-[95%] max-w-5xl h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="absolute top-3 right-3 z-[1000]">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur hover:bg-white"
                onClick={() => setShowMap(false)}
              >
                <X className="h-5 w-5 text-black" />
              </Button>
            </div>

            {/* Map */}
            <MapContainer
              center={[40.7128, -74.006]}
              zoom={12}
              className="flex-1 w-full h-full rounded-b-2xl"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {tourists.map((tourist) => (
                <Marker
                  key={tourist.id}
                  position={[tourist.location.lat, tourist.location.lng]}
                >
                  <Popup>

              <div className="font-semibold">{tourist.name}</div>
              <div className="text-sm text-muted-foreground">
                Status: {tourist.status.toUpperCase()}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  </div>
)}

    </div>
  );
};

export default PoliceDashboard;
