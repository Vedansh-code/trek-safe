import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  AlertTriangle, 
  MapPin, 
  Calendar,
  Shield,
  FileText,
  Clock
} from 'lucide-react';

interface Tourist {
  id: string;
  name: string;
  age: number;
  gender: string;
  photo: string;
  idProofType: string;
  idProofNumber: string;
  mobileNumber: string;
  emergencyContact: {
    name: string;
    number: string;
  };
  itinerary: string[];
  status: 'safe' | 'danger' | 'warning';
  lastLocation: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  qrCodeId: string;
  hash: string;
}

interface TouristProfileProps {
  tourist: Tourist;
}

const StatusBadge = ({ status }: { status: Tourist['status'] }) => {
  const statusConfig = {
    safe: { color: 'bg-status-safe', icon: Shield, text: 'Safe' },
    danger: { color: 'bg-status-danger', icon: AlertTriangle, text: 'SOS Alert' },
    warning: { color: 'bg-status-warning', icon: AlertTriangle, text: 'Restricted Zone' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} text-white border-0`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

const TouristProfile = ({ tourist }: TouristProfileProps) => {
  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tourist Profile
            </span>
            <StatusBadge status={tourist.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={tourist.photo} alt={tourist.name} />
              <AvatarFallback>{tourist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-semibold">{tourist.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <span>Age: {tourist.age}</span>
                <span>Gender: {tourist.gender}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Details
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Mobile:</span>
                  <span className="ml-2 font-mono">{tourist.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Emergency Contact:</span>
                  <div className="ml-2">
                    <div>{tourist.emergencyContact.name}</div>
                    <div className="font-mono">{tourist.emergencyContact.number}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                ID Verification
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">ID Type:</span>
                  <span className="ml-2">{tourist.idProofType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ID Number:</span>
                  <span className="ml-2 font-mono">{tourist.idProofNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">QR Code ID:</span>
                  <span className="ml-2 font-mono">{tourist.qrCodeId}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itinerary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planned Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tourist.itinerary.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Address:</span>
            <span className="ml-2">{tourist.lastLocation.address}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Coordinates:</span>
              <div className="font-mono text-xs">
                {tourist.lastLocation.lat.toFixed(6)}, {tourist.lastLocation.lng.toFixed(6)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Updated:
              </span>
              <div className="text-xs">{tourist.lastLocation.timestamp}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Hash */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Blockchain Integrity Hash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-xs bg-muted p-2 rounded break-all">
            {tourist.hash}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TouristProfile;