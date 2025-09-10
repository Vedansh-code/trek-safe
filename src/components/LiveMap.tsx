import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
  timestamp: string;
}

interface LiveMapProps {
  touristId: string;
  currentLocation: Location;
  status: 'safe' | 'danger' | 'warning';
}

const LiveMap = ({ touristId, currentLocation, status }: LiveMapProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-status-safe';
      case 'danger': return 'bg-status-danger';
      case 'warning': return 'bg-status-warning';
      default: return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe Zone';
      case 'danger': return 'SOS Alert Active';
      case 'warning': return 'Restricted Zone';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Location
          </span>
          <Badge className={`${getStatusColor(status)} text-white border-0`}>
            {getStatusText(status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Placeholder */}
        <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="fill-current text-gray-400">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Tourist Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`relative ${getStatusColor(status)} rounded-full p-3 shadow-lg animate-pulse`}>
              <Navigation className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 bg-white text-xs px-2 py-1 rounded-full shadow">
                {touristId}
              </div>
            </div>
          </div>

          {/* Status Overlay */}
          {status === 'danger' && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-status-danger text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">SOS ALERT ACTIVE</span>
              </div>
            </div>
          )}

          {status === 'warning' && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-status-warning text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">RESTRICTED ZONE DETECTED</span>
              </div>
            </div>
          )}
        </div>

        {/* Location Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Latitude:</span>
              <div className="font-mono">{currentLocation.lat.toFixed(6)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Longitude:</span>
              <div className="font-mono">{currentLocation.lng.toFixed(6)}</div>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground">Address:</span>
            <div className="text-sm mt-1">{currentLocation.address}</div>
          </div>

          <div>
            <span className="text-muted-foreground">Last Updated:</span>
            <div className="text-sm mt-1">{currentLocation.timestamp}</div>
          </div>
        </div>

        {/* Map Controls Info */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">
            🌐 Real-time GPS tracking • 📍 Tourist ID: {touristId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveMap;