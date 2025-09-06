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
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tourist {
  id: string;
  name: string;
  age: string;
  location: { lat: number; lng: number };
  status: 'safe' | 'warning' | 'emergency';
  lastUpdate: string;
  emergencyContact: string;
}

interface Alert {
  id: string;
  type: 'sos' | 'geofence' | 'inactive';
  touristId: string;
  touristName: string;
  message: string;
  location: { lat: number; lng: number };
  timestamp: string;
  status: 'active' | 'resolved';
}

const PoliceDashboard = () => {
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Simulate real-time data
  useEffect(() => {
    // Mock data
    const mockTourists: Tourist[] = [
      {
        id: 'TRS-ABC123',
        name: 'John Smith',
        age: '28',
        location: { lat: 40.7128, lng: -74.0060 },
        status: 'safe',
        lastUpdate: new Date().toISOString(),
        emergencyContact: '+1-234-567-8900'
      },
      {
        id: 'TRS-DEF456',
        name: 'Maria Garcia',
        age: '34',
        location: { lat: 40.7580, lng: -73.9855 },
        status: 'warning',
        lastUpdate: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        emergencyContact: '+1-234-567-8901'
      },
      {
        id: 'TRS-GHI789',
        name: 'David Chen',
        age: '25',
        location: { lat: 40.6892, lng: -74.0445 },
        status: 'emergency',
        lastUpdate: new Date(Date.now() - 120000).toISOString(), // 2 min ago
        emergencyContact: '+1-234-567-8902'
      }
    ];

    const mockAlerts: Alert[] = [
      {
        id: 'ALERT-001',
        type: 'sos',
        touristId: 'TRS-GHI789',
        touristName: 'David Chen',
        message: 'Emergency SOS alert triggered',
        location: { lat: 40.6892, lng: -74.0445 },
        timestamp: new Date(Date.now() - 120000).toISOString(),
        status: 'active'
      },
      {
        id: 'ALERT-002',
        type: 'geofence',
        touristId: 'TRS-DEF456',
        touristName: 'Maria Garcia',
        message: 'Entered restricted zone',
        location: { lat: 40.7580, lng: -73.9855 },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'active'
      }
    ];

    setTourists(mockTourists);
    setAlerts(mockAlerts);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTourists(prev => prev.map(tourist => ({
        ...tourist,
        location: {
          lat: tourist.location.lat + (Math.random() - 0.5) * 0.001,
          lng: tourist.location.lng + (Math.random() - 0.5) * 0.001
        },
        lastUpdate: tourist.status === 'safe' ? new Date().toISOString() : tourist.lastUpdate
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-success bg-success/10 border-success/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'emergency': return 'text-emergency bg-emergency/10 border-emergency/20';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'sos': return 'text-emergency bg-emergency/10 border-emergency/20';
      case 'geofence': return 'text-warning bg-warning/10 border-warning/20';
      case 'inactive': return 'text-muted-foreground bg-muted/50 border-muted';
      default: return 'text-muted-foreground';
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved",
    });
  };

  const filteredTourists = tourists.filter(tourist =>
    tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-police/5 via-background to-primary/5">
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
              <Shield className="h-8 w-8 text-police" />
              <div>
                <h1 className="text-3xl font-bold text-police">Police Dashboard</h1>
                <p className="text-muted-foreground">Tourist Safety Monitoring & Incident Response</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {activeAlerts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-emergency animate-pulse" />
                  <Badge variant="destructive">{activeAlerts.length} Active Alerts</Badge>
                </div>
              )}
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Active Tourists</div>
                <div className="text-2xl font-bold text-police">{tourists.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Alerts Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-emergency/30">
              <CardHeader>
                <CardTitle className="text-emergency flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts ({activeAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeAlerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No active alerts</p>
                ) : (
                  activeAlerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${getAlertTypeColor(alert.type)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={alert.type === 'sos' ? 'destructive' : 'secondary'}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="font-medium">{alert.touristName}</div>
                      <div className="text-sm text-muted-foreground mb-2">{alert.message}</div>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Scanner
                </CardTitle>
                <CardDescription>Scan tourist QR codes for profile access</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="police" className="w-full mb-4">
                  Open Scanner
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Instantly access tourist profiles and itineraries
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Map Controls */}
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
                  <Button variant="police">
                    <Eye className="h-4 w-4 mr-2" />
                    Map View
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Tourist List */}
            <div className="grid gap-4">
              {filteredTourists.map((tourist) => (
                <Card key={tourist.id} className={`transition-all duration-200 hover:shadow-md ${tourist.status === 'emergency' ? 'border-emergency/50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(tourist.status)}`}>
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{tourist.name}</h3>
                          <p className="text-muted-foreground">{tourist.id}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {tourist.location.lat.toFixed(4)}, {tourist.location.lng.toFixed(4)}
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
                          <Button size="sm" variant="outline" onClick={() => setSelectedTourist(tourist)}>
                            View Details
                          </Button>
                          {tourist.status === 'emergency' && (
                            <Button size="sm" variant="emergency">
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

            {/* Tourist Details Modal */}
            {selectedTourist && (
              <Card className="border-2 border-police/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-police">Tourist Details</CardTitle>
                    <Button variant="ghost" onClick={() => setSelectedTourist(null)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <div className={`font-medium ${getStatusColor(selectedTourist.status)}`}>
                      <strong>Status:</strong> {selectedTourist.status.toUpperCase()}
                    </div>
                    <div>
                      <strong>Emergency Contact:</strong> {selectedTourist.emergencyContact}
                    </div>
                    <div>
                      <strong>Last Update:</strong> {new Date(selectedTourist.lastUpdate).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <strong>Current Location:</strong>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      Lat: {selectedTourist.location.lat.toFixed(6)}<br />
                      Lng: {selectedTourist.location.lng.toFixed(6)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="police">Call Emergency Contact</Button>
                    <Button variant="outline">View on Map</Button>
                    <Button variant="outline">Send Message</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;