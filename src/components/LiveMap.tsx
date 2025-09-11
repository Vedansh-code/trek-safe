import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle } from 'lucide-react';

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
        
        {/* Hardcoded Map (Delhi Technological University) */}
        <div className="relative h-64 rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.476107774279!2d77.11667231508384!3d28.749930882373585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d012d7f8b6d7f%3A0xd52c08cf3afc9f51!2sDelhi%20Technological%20University!5e0!3m2!1sen!2sin!4v1634130000000!5m2!1sen!2sin"
            style={{ border: 0 }}
          ></iframe>
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
