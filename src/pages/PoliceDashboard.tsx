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
    X,
    Ban,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import zone data
import { restrictedZones, RestrictedZone } from "../data/restrictedZones";

// ====================== Leaflet Icon Fix ======================
if ((L.Icon.Default.prototype as any)._getIconUrl) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
}
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
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
    inZone?: string;
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

// ====================== Helper Functions ======================
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

// ====================== Backend URL ======================
const API_BASE = "https://trek-safe-backend.onrender.com";

// ====================== Component ======================
const PoliceDashboard = () => {
    const [tourists, setTourists] = useState<Tourist[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [safetyZones, setSafetyZones] = useState<RestrictedZone[]>([]);
    const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showMap, setShowMap] = useState(false);
    const [fetchErrorShown, setFetchErrorShown] = useState(false);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const { toast } = useToast();

    // ====================== Fetch and Process Data ======================
    useEffect(() => {
        setSafetyZones(restrictedZones);

        const fetchData = async () => {
            try {
                const [touristsRes, sosRes] = await Promise.all([
                    fetch(`${API_BASE}/police/tourists`),
                    fetch(`${API_BASE}/sos_alerts`),
                ]);

                if (!touristsRes.ok || !sosRes.ok) {
                    throw new Error("Network response was not ok");
                }

                const touristsData = await touristsRes.json();
                const sosData = await sosRes.json();

                const mappedTourists: Tourist[] = touristsData.map(
                    (t: any) => ({
                        id: t.id,
                        name: t.name,
                        age: String(t.age),
                        location:
                            t.currentLat && t.currentLng
                                ? { lat: t.currentLat, lng: t.currentLng }
                                : { lat: 28.7041, lng: 77.1025 },
                        status: t.lastSOS
                            ? "emergency"
                            : t.currentLat
                            ? "safe"
                            : "warning",
                        lastUpdate: t.created_at,
                        emergencyContact: t.emergencyContact,
                    })
                );

                const sosAlerts: Alert[] = sosData.map((a: any) => ({
                    id: `SOS-${a.id}`,
                    type: "sos",
                    touristId: a.touristId,
                    touristName:
                        mappedTourists.find((t) => t.id === a.touristId)
                            ?.name || "Unknown",
                    message: "Emergency SOS alert triggered",
                    location: { lat: a.lat, lng: a.lng },
                    timestamp: a.timestamp,
                    status: "active",
                }));

                const geofenceAlerts: Alert[] = [];
                const touristsWithZoneStatus = mappedTourists.map((tourist) => {
                    let finalStatus = tourist.status;
                    let inZoneName: string | undefined = undefined;

                    for (const zone of restrictedZones) {
                        const distance = getDistanceFromLatLonInMeters(
                            tourist.location.lat,
                            tourist.location.lng,
                            zone.lat,
                            zone.lng
                        );
                        if (distance <= zone.radius) {
                            inZoneName = zone.name;
                            const zoneStatus =
                                zone.type === "red" ? "emergency" : "warning";
                            if (zoneStatus === "emergency")
                                finalStatus = "emergency";
                            else if (
                                zoneStatus === "warning" &&
                                finalStatus !== "emergency"
                            )
                                finalStatus = "warning";

                            if (
                                zone.type === "red" ||
                                zone.type === "yellow" ||
                                zone.type === "restricted"
                            ) {
                                geofenceAlerts.push({
                                    id: `GEO-${tourist.id}`,
                                    type: "geofence",
                                    touristId: tourist.id,
                                    touristName: tourist.name,
                                    message: `Entered ${zone.type} zone: ${zone.name}`,
                                    location: tourist.location,
                                    timestamp: new Date().toISOString(),
                                    status: "active",
                                });
                            }
                            break;
                        }
                    }
                    return {
                        ...tourist,
                        status: finalStatus,
                        inZone: inZoneName,
                    };
                });

                setTourists(touristsWithZoneStatus);
                const allAlerts = [...sosAlerts, ...geofenceAlerts];
                const uniqueAlerts = Array.from(
                    new Map(allAlerts.map((item) => [item.id, item])).values()
                );
                setAlerts(uniqueAlerts);
            } catch (error) {
                console.error("❌ Error fetching data:", error);
                if (!fetchErrorShown) {
                    toast({
                        title: "Failed to Fetch Live Data",
                        description:
                            "Could not retrieve real-time data. Displaying last known information.",
                        variant: "destructive",
                        duration: 3000
                    });
                    setFetchErrorShown(true);
                }
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [toast, fetchErrorShown]);

    // ====================== Map Full-Screen Fix ======================
    useEffect(() => {
        if (mapInstance && showMap) {
            setTimeout(() => {
                mapInstance.invalidateSize();
            }, 100);
        }
    }, [mapInstance, showMap]);

    // ====================== Color & Style Helpers ======================
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "safe":
                return {
                    badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
                    icon: "bg-teal-500/10 text-teal-400",
                };
            case "warning":
                return {
                    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                    icon: "bg-yellow-500/10 text-yellow-400",
                };
            case "emergency":
                return {
                    badge: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
                    icon: "bg-red-500/10 text-red-400",
                };
            default:
                return {
                    badge: "bg-slate-700 text-slate-300",
                    icon: "bg-slate-700 text-slate-300",
                };
        }
    };

    const getZoneTypeColor = (type: string) => {
        switch (type) {
            case "red":
                return "text-red-400 border-red-500/30";
            case "yellow":
                return "text-yellow-400 border-yellow-500/30";
            case "green":
                return "text-teal-400 border-teal-500/30";
            default:
                return "text-slate-400 border-slate-500/30";
        }
    };

    const getZoneColorForMap = (type: string) => {
        switch (type) {
            case "red":
                return "#ef4444";
            case "yellow":
                return "#f59e0b";
            case "green":
                return "#22c55e";
            default:
                return "#6b7280";
        }
    };

    const getAlertTypeStyles = (type: string) => {
        switch (type) {
            case "sos":
                return "bg-red-500/10 border-red-500/30";
            case "geofence":
                return "bg-yellow-500/10 border-yellow-500/30";
            default:
                return "bg-slate-700/50 border-slate-600";
        }
    };

    const resolveAlert = (alertId: string) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
        toast({
            title: "Alert Resolved",
            description: "Alert has been removed from the active list.",
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
        <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-900 text-slate-100 p-4">
            <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
                <div className="absolute top-0 -left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 container mx-auto py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Button
                        asChild
                        variant="ghost"
                        className="absolute top-4 left-4 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <Link to="/">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-12">
                        <div className="flex items-center gap-3">
                            <Shield className="h-10 w-10 text-indigo-400" />
                            <div>
                                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                    Police Dashboard
                                </h1>
                                <p className="text-slate-400">
                                    Live Safety Monitoring & Incident Response
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {activeAlerts.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-red-400 animate-pulse" />
                                    <Badge variant="destructive">
                                        {activeAlerts.length} Active Alerts
                                    </Badge>
                                </div>
                            )}
                            <div className="text-right">
                                <div className="text-sm text-slate-400">
                                    Active Tourists
                                </div>
                                <div className="text-3xl font-bold text-indigo-400">
                                    {tourists.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid lg:grid-cols-3 gap-6"
                >
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" /> Active
                                    Alerts ({activeAlerts.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                                {activeAlerts.length === 0 ? (
                                    <p className="text-slate-500 text-center py-4">
                                        No active alerts
                                    </p>
                                ) : (
                                    activeAlerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`p-3 rounded-lg border ${getAlertTypeStyles(
                                                alert.type
                                            )}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge
                                                    variant={
                                                        alert.type === "sos"
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
                                                >
                                                    {alert.type.toUpperCase()}
                                                </Badge>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(
                                                        alert.timestamp
                                                    ).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="font-medium text-white">
                                                {alert.touristName}
                                            </div>
                                            <div className="text-sm text-slate-400 mb-2">
                                                {alert.message}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    resolveAlert(alert.id)
                                                }
                                                className="w-full bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                                            >
                                                Resolve
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Ban className="h-5 w-5 text-indigo-400" />{" "}
                                    Safety Zones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                                {safetyZones.map((zone) => (
                                    <div
                                        key={zone.name}
                                        className="flex justify-between items-center text-sm p-2 rounded-md bg-slate-900/50"
                                    >
                                        <span className="text-slate-300">
                                            {zone.name}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={getZoneTypeColor(
                                                zone.type
                                            )}
                                        >
                                            {zone.type.toUpperCase()}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <QrCode className="h-5 w-5 text-indigo-400" />{" "}
                                    QR Scanner
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                                >
                                    <Link to="/pages">Open Scanner</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Users className="h-5 w-5 text-indigo-400" />{" "}
                                    Live Tourist Monitoring
                                </CardTitle>
                                <div className="flex gap-4 mt-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search tourists by name or ID..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10 bg-slate-900/80 border-slate-600 text-white focus:ring-indigo-500"
                                        />
                                    </div>
                                    <Button
                                        onClick={() => setShowMap(true)}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
                                    >
                                        <Eye className="h-4 w-4 mr-2" /> Map
                                        View
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                                {filteredTourists.length > 0 ? (
                                    filteredTourists.map((tourist) => (
                                        <div
                                            key={tourist.id}
                                            className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-slate-700/50 cursor-pointer"
                                            onClick={() => openModal(tourist)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                                                        getStatusStyles(
                                                            tourist.status
                                                        ).icon
                                                    }`}
                                                >
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">
                                                        {tourist.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-400">
                                                        {tourist.id}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                {tourist.inZone && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="hidden sm:inline-flex"
                                                    >
                                                        {tourist.inZone}
                                                    </Badge>
                                                )}
                                                <Badge
                                                    className={
                                                        getStatusStyles(
                                                            tourist.status
                                                        ).badge
                                                    }
                                                >
                                                    {tourist.status.toUpperCase()}
                                                </Badge>
                                                <div className="hidden md:flex items-center gap-1 text-sm text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(
                                                        tourist.lastUpdate
                                                    ).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-center py-8">
                                        No tourists found.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>

            {selectedTourist && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
                        isModalOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}
                    onClick={closeModal}
                >
                    <div
                        className={`bg-slate-800 rounded-xl shadow-lg max-w-lg w-full border border-slate-700 transform transition-all duration-300 ${
                            isModalOpen
                                ? "scale-100 opacity-100"
                                : "scale-95 opacity-0"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-white">
                                {selectedTourist.name}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full -mr-2"
                                    onClick={closeModal}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                ID: {selectedTourist.id}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <strong className="text-slate-400 block">
                                        Age
                                    </strong>
                                    {selectedTourist.age}
                                </div>
                                <div>
                                    <strong className="text-slate-400 block">
                                        Status
                                    </strong>
                                    <Badge
                                        className={
                                            getStatusStyles(
                                                selectedTourist.status
                                            ).badge
                                        }
                                    >
                                        {selectedTourist.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="col-span-2">
                                    <strong className="text-slate-400 block">
                                        Emergency Contact
                                    </strong>
                                    {selectedTourist.emergencyContact}
                                </div>
                                {selectedTourist.inZone && (
                                    <div className="col-span-2">
                                        <strong className="text-slate-400 block">
                                            Current Zone
                                        </strong>
                                        {selectedTourist.inZone}
                                    </div>
                                )}
                            </div>
                            <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-700">
                                <MapContainer
                                    center={[
                                        selectedTourist.location.lat,
                                        selectedTourist.location.lng,
                                    ]}
                                    zoom={14}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/>

                                    <Marker
                                        position={[
                                            selectedTourist.location.lat,
                                            selectedTourist.location.lng,
                                        ]}
                                    >
                                        <Popup>{selectedTourist.name}</Popup>
                                    </Marker>
                                    {safetyZones.map((zone) => (
                                        <Circle
                                            key={zone.name}
                                            center={[zone.lat, zone.lng]}
                                            radius={zone.radius}
                                            pathOptions={{
                                                color: getZoneColorForMap(
                                                    zone.type
                                                ),
                                                fillColor: getZoneColorForMap(
                                                    zone.type
                                                ),
                                                fillOpacity: 0.2,
                                            }}
                                        />
                                    ))}
                                </MapContainer>
                            </div>
                        </CardContent>
                    </div>
                </div>
            )}

            {showMap && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setShowMap(false)}
                >
                    <div
                        className="relative bg-slate-800 rounded-lg shadow-2xl w-full h-full border border-slate-700 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            onClick={() => setShowMap(false)}
                            className="absolute top-3 right-3 z-[1000] bg-slate-900 hover:bg-slate-800 text-white rounded-full"
                        >
                            <X className="h-4 w-4 mr-2" /> Close Map
                        </Button>
                        <MapContainer
                            ref={setMapInstance}
                            center={[28.7041, 77.1025]}
                            zoom={12}
                            className="flex-grow w-full h-full"
                        >
                            <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/>
                            {safetyZones.map((zone) => (
                                <Circle
                                    key={zone.name}
                                    center={[zone.lat, zone.lng]}
                                    radius={zone.radius}
                                    pathOptions={{
                                        color: getZoneColorForMap(zone.type),
                                        fillColor: getZoneColorForMap(
                                            zone.type
                                        ),
                                        fillOpacity: 0.2,
                                    }}
                                >
                                    <Popup>
                                        {zone.name} ({zone.type.toUpperCase()}{" "}
                                        Zone)
                                    </Popup>
                                </Circle>
                            ))}
                            {tourists.map((tourist) => (
                                <Marker
                                    key={tourist.id}
                                    position={[
                                        tourist.location.lat,
                                        tourist.location.lng,
                                    ]}
                                >
                                    <Popup>
                                        <div className="font-semibold">
                                            {tourist.name}
                                        </div>
                                        <div className="text-sm">
                                            Status:{" "}
                                            {tourist.status.toUpperCase()}
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
