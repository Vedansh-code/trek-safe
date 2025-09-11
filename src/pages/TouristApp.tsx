import { useState, useEffect, useCallback } from "react";
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
    Expand,
    Minimize,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

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

const API_BASE = "https://trek-safe-backend.onrender.com";

interface TouristData {
    id: string;
    name: string;
    age: string;
    idProof: string;
    emergencyContact: string;
    itinerary: string;
    location?: { lat: number; lng: number };
}

// Helper function to get color based on zone type
const getZoneColor = (type: "green" | "yellow" | "red" | "restricted") => {
    switch (type) {
        case "green":
            return "#22c55e"; // green-500
        case "yellow":
            return "#facc15"; // yellow-400
        case "red":
            return "#ef4444"; // red-500
        case "restricted":
            return "#6b7280"; // gray-500
        default:
            return "#22c55e";
    }
};

const getSafetyAlertInfo = (
    zone: "green" | "yellow" | "red" | "restricted"
) => {
    switch (zone) {
        case "green":
            return {
                text: "All Clear",
                description: "You are in a safe zone.",
                color: "teal-400",
                borderColor: "teal-500/30",
                bgColor: "teal-500/10",
            };
        case "yellow":
            return {
                text: "Caution Zone",
                description: "Stay alert and follow guidelines.",
                color: "yellow-400",
                borderColor: "yellow-500/30",
                bgColor: "yellow-500/10",
            };
        case "red":
            return {
                text: "Danger Zone",
                description: "High risk area. Evacuate if advised.",
                color: "red-500",
                borderColor: "red-500/30",
                bgColor: "red-500/10",
            };
        case "restricted":
            return {
                text: "Restricted Zone",
                description: "Access is not permitted.",
                color: "slate-400",
                borderColor: "slate-500/30",
                bgColor: "slate-500/10",
            };
        default:
            return {
                text: "Unknown",
                description: "",
                color: "slate-500",
                borderColor: "slate-500/30",
                bgColor: "slate-500/10",
            };
    }
};

// Haversine distance (meters)
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
    const [loading, setLoading] = useState(false);
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
    const [inRestrictedZone, setInRestrictedZone] = useState<
        "green" | "yellow" | "red" | "restricted"
    >("green");

    const checkRestrictedZone = useCallback(
        (location: {
            lat: number;
            lng: number;
        }): "green" | "yellow" | "red" | "restricted" => {
            for (const zone of restrictedZones) {
                const distance = getDistanceFromLatLonInMeters(
                    location.lat,
                    location.lng,
                    zone.lat,
                    zone.lng
                );
                if (distance <= zone.radius) {
                    return zone.type;
                }
            }
            return "green";
        },
        []
    );

    useEffect(() => {
        if (isTracking && touristData.id) {
            const interval = setInterval(() => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const newLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setCurrentLocation(newLocation);

                        try {
                            await fetch(
                                `${API_BASE}/tourists/${touristData.id}/location`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(newLocation),
                                }
                            );
                        } catch (err) {
                            console.error("Location update failed:", err);
                        }

                        const zoneType = checkRestrictedZone(newLocation);
                        if (zoneType !== inRestrictedZone) {
                            setInRestrictedZone(zoneType);
                            // Toast logic remains the same
                        }
                    },
                    (error) => {
                        console.error("Location error:", error);
                    }
                );
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [
        isTracking,
        touristData.id,
        inRestrictedZone,
        toast,
        checkRestrictedZone,
    ]);

    const handleRegister = async () => {
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
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/tourists`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(touristData),
            });
            if (!res.ok) throw new Error("Failed to register tourist");
            const data = await res.json();
            setTouristData(data);
            setStep("dashboard");
            setIsTracking(true);
            toast({
                title: "Registration Successful!",
                description: `Tourist ID: ${data.id} - Location tracking activated.`,
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Registration Failed",
                description: "Could not connect to server.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSOS = async () => {
        if (!currentLocation || !touristData.id) return;
        const mapsLink = `http://googleusercontent.com/maps/google.com/0{currentLocation.lat},${currentLocation.lng}`;
        const smsBody = encodeURIComponent(
            `🚨 SOS! This is ${touristData.name}. I need help!\nMy location: ${mapsLink}`
        );
        const smsLink = `sms:${touristData.emergencyContact}?body=${smsBody}`;
        try {
            await fetch(`${API_BASE}/tourists/${touristData.id}/sos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentLocation),
            });
            window.location.href = smsLink;
            toast({
                title: "🚨 SOS Sent!",
                description:
                    "Authorities and your emergency contact have been notified.",
                variant: "destructive",
            });
        } catch (err) {
            console.error("SOS failed:", err);
            toast({
                title: "❌ SOS Failed",
                description:
                    "Could not notify authorities. Please call emergency services.",
                variant: "destructive",
            });
        }
    };

    if (step === "register") {
        return (
            <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-white p-4 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="absolute top-4 left-4">
                        <Button
                            asChild
                            variant="ghost"
                            className="text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            <Link to="/">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to
                                Home
                            </Link>
                        </Button>
                    </div>
                    <div className="text-center mb-8 mt-16">
                        <div className="flex justify-center items-center gap-3 mb-4">
                            <MapPin className="h-8 w-8 text-teal-400" />
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                Tourist Registration
                            </h1>
                        </div>
                        <p className="text-slate-400">
                            Register for safety monitoring and emergency
                            protection.
                        </p>
                    </div>

                    <Card className="max-w-2xl mx-auto bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Personal Information
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Provide your details for emergency
                                identification.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label
                                        htmlFor="name"
                                        className="text-slate-300"
                                    >
                                        Full Name *
                                    </Label>
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
                                        className="bg-slate-900/80 border-slate-600 text-white focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="age"
                                        className="text-slate-300"
                                    >
                                        Age *
                                    </Label>
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
                                        className="bg-slate-900/80 border-slate-600 text-white focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label
                                    htmlFor="idProof"
                                    className="text-slate-300"
                                >
                                    ID Proof (Passport, etc.) *
                                </Label>
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
                                    className="bg-slate-900/80 border-slate-600 text-white focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="emergencyContact"
                                    className="text-slate-300"
                                >
                                    Emergency Contact *
                                </Label>
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
                                    className="bg-slate-900/80 border-slate-600 text-white focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="itinerary"
                                    className="text-slate-300"
                                >
                                    Planned Itinerary
                                </Label>
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
                                    rows={3}
                                    className="bg-slate-900/80 border-slate-600 text-white focus:ring-teal-500"
                                />
                            </div>
                            <Button
                                onClick={handleRegister}
                                size="lg"
                                className="w-full text-lg py-6 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow-lg shadow-teal-500/30 transition-all duration-300"
                                disabled={loading}
                            >
                                {loading
                                    ? "Registering..."
                                    : "Register & Start Tracking"}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const alertInfo = getSafetyAlertInfo(inRestrictedZone);
    return (
        <div className="min-h-screen w-full bg-slate-900 text-white p-4">
            <div className="absolute top-4 left-4 z-20">
                <Button
                    asChild
                    variant="ghost"
                    className="text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                    <Link to="/">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                    </Link>
                </Button>
            </div>
            <div className="container mx-auto py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 text-center"
                >
                    <div className="flex justify-center items-center gap-3">
                        <Shield className="h-8 w-8 text-teal-400" />
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            Tourist Dashboard
                        </h1>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-3 py-1 rounded-full">
                        <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">Tracking Active</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    <div className="space-y-6">
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <QrCode className="h-5 w-5 text-teal-400" />{" "}
                                    Your QR Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="bg-slate-200 p-4 rounded-lg inline-block shadow-inner">
                                    <QRCodeSVG
                                        value={JSON.stringify({
                                            id: touristData.id,
                                            name: touristData.name,
                                        })}
                                        size={180}
                                    />
                                </div>
                                <p className="mt-4 text-sm text-slate-500">
                                    ID: {touristData.id}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <strong className="text-slate-300">
                                        Name:
                                    </strong>{" "}
                                    <span>{touristData.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <strong className="text-slate-300">
                                        Age:
                                    </strong>{" "}
                                    <span>{touristData.age}</span>
                                </div>
                                <div className="flex justify-between">
                                    <strong className="text-slate-300">
                                        ID Proof:
                                    </strong>{" "}
                                    <span>{touristData.idProof}</span>
                                </div>
                                <div className="flex justify-between">
                                    <strong className="text-slate-300">
                                        Emergency:
                                    </strong>{" "}
                                    <span>{touristData.emergencyContact}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-red-500/10 border-2 border-red-500/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-red-400">
                                    Emergency Controls
                                </CardTitle>
                                <CardDescription className="text-red-400/70">
                                    Use only in case of immediate danger.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={handleSOS}
                                    size="lg"
                                    className="w-full text-xl py-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold emergency-pulse shadow-lg shadow-red-500/20"
                                >
                                    🚨 SOS EMERGENCY
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-teal-400" />{" "}
                                        Current Location
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsFullScreen(true)}
                                        className="bg-transparent border-slate-600 hover:bg-slate-700 hover:text-white"
                                    >
                                        <Expand className="h-4 w-4 mr-2" />{" "}
                                        Expand Map
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentLocation ? (
                                    <MapContainer
                                        center={[
                                            currentLocation.lat,
                                            currentLocation.lng,
                                        ]}
                                        zoom={13}
                                        scrollWheelZoom={false}
                                        style={{
                                            height: "300px",
                                            width: "100%",
                                        }}
                                        className="rounded-lg overflow-hidden border-2 border-slate-700"
                                    >
                                        <TileLayer
                                            attribution='© <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>, © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
                                            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                        />
                                        <Marker
                                            position={[
                                                currentLocation.lat,
                                                currentLocation.lng,
                                            ]}
                                        >
                                            <Popup>You are here!</Popup>
                                        </Marker>
                                        {restrictedZones.map((zone, i) => (
                                            <Circle
                                                key={i}
                                                center={[zone.lat, zone.lng]}
                                                radius={zone.radius}
                                                pathOptions={{
                                                    color: getZoneColor(
                                                        zone.type
                                                    ),
                                                    fillColor: getZoneColor(
                                                        zone.type
                                                    ),
                                                    fillOpacity: 0.2,
                                                }}
                                            />
                                        ))}
                                    </MapContainer>
                                ) : (
                                    <p className="text-slate-400">
                                        Getting your location...
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card
                            className={`bg-slate-800/50 border-slate-700 backdrop-blur-sm border-2 border-${alertInfo.borderColor}`}
                        >
                            <CardHeader>
                                <CardTitle
                                    className={`flex items-center gap-2 text-${alertInfo.color}`}
                                >
                                    <AlertTriangle className="h-5 w-5" /> Safety
                                    Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`p-4 rounded-lg bg-${alertInfo.bgColor} border border-${alertInfo.borderColor}`}
                                >
                                    <div
                                        className={`font-medium text-${alertInfo.color}`}
                                    >
                                        {alertInfo.text}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {alertInfo.description}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    Itinerary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {touristData.itinerary ? (
                                    <p className="text-slate-300">
                                        {touristData.itinerary}
                                    </p>
                                ) : (
                                    <p className="text-slate-500 italic">
                                        No itinerary provided
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    System Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300">
                                        Location Tracking
                                    </span>
                                    <span className="text-teal-400 font-medium">
                                        Active
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300">
                                        Emergency Ready
                                    </span>
                                    <span className="text-teal-400 font-medium">
                                        Ready
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300">
                                        Monitored Zones
                                    </span>
                                    <span className="text-yellow-400 font-medium">
                                        {restrictedZones.length} zones
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
                {isFullScreen && currentLocation && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
                        <div className="relative bg-slate-800 rounded-lg shadow-2xl w-full h-full border border-slate-700 overflow-hidden">
                            <Button
                                onClick={() => setIsFullScreen(false)}
                                className="absolute top-3 right-3 z-[1000] bg-slate-900 hover:bg-slate-800 text-white rounded-full"
                            >
                                <Minimize className="h-4 w-4 mr-2" /> Collapse
                            </Button>
                            <MapContainer
                                center={[
                                    currentLocation.lat,
                                    currentLocation.lng,
                                ]}
                                zoom={14}
                                scrollWheelZoom={true}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    attribution='© <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>, © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
                                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                />
                                <Marker
                                    position={[
                                        currentLocation.lat,
                                        currentLocation.lng,
                                    ]}
                                >
                                    <Popup>You are here!</Popup>
                                </Marker>
                                {restrictedZones.map((zone, i) => (
                                    <Circle
                                        key={i}
                                        center={[zone.lat, zone.lng]}
                                        radius={zone.radius}
                                        pathOptions={{
                                            color: getZoneColor(zone.type),
                                            fillColor: getZoneColor(zone.type),
                                            fillOpacity: 0.2,
                                        }}
                                    />
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TouristApp;
