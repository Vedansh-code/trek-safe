import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRScanner from '@/components/QRScanner';
import TouristProfile from '@/components/TouristProfile';
import PoliceControls from '@/components/PoliceControls';
import LiveMap from '@/components/LiveMap';
import { Shield, AlertCircle, Users, Activity } from 'lucide-react';

// Mock data for demonstration
const mockTourist = {
  id: "T001",
  name: "Vedansh",
  age: 19,
  gender: "Male",
  photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
  idProofType: "Aadhar",
  idProofNumber: "4968 8295 9640",
  mobileNumber: "8287296041",
  emergencyContact: {
    name: "Yanish Chawla",
    number: "9266320829"
  },
  itinerary: [
    "Day 1: Arrival",
    "Day 2: Hauz Khas",
    "Day 3: India Gate",
    "Day 4: Cannaught Place",
    "Day 5: Departure"
  ],
  status: 'safe' as 'safe' | 'danger' | 'warning',
  lastLocation: {
    lat: 18.9220,
    lng: 72.8347,
    address: "Gateway of India, Mumbai, Maharashtra 400001",
    timestamp: "2024-01-15 14:30:22"
  },
  qrCodeId: "QR_T001_2024",
  hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
};

const mockAccessLogs = [
  {
    id: "1",
    officerId: "P001",
    officerName: "Officer Singh",
    timestamp: "2024-01-15 14:25:10",
    action: "QR Code Scanned",
    location: "Gateway of India"
  },
  {
    id: "2",
    officerId: "P002",
    officerName: "Officer Patel",
    timestamp: "2024-01-15 12:15:30",
    action: "Status Check",
    location: "Colaba Police Station"
  },
  {
    id: "3",
    officerId: "P001",
    officerName: "Officer Singh",
    timestamp: "2024-01-15 10:45:15",
    action: "Initial Registration",
    location: "Mumbai Airport"
  }
];

const Index = () => {
  const [scannedTourist, setScannedTourist] = useState<typeof mockTourist | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<'safe' | 'danger' | 'warning'>('safe');

  const handleScanSuccess = (touristId: string) => {
    console.log('Scanned Tourist ID:', touristId);
    
    // Simulate API call to fetch tourist data
    setTimeout(() => {
      try {
        let parsedData;
        let actualTouristId;
        
        // Try to parse as JSON first
        try {
          parsedData = JSON.parse(touristId);
          actualTouristId = parsedData.id;
        } catch {
          // If not JSON, use the raw string as ID
          actualTouristId = touristId;
        }
        
        // Create tourist data based on scanned information
        const touristData = {
          ...mockTourist,
          id: actualTouristId,
          name: parsedData?.name || 'Unknown Tourist',
          qrCodeId: touristId,
          status: currentStatus,
          // Update hash to include the actual tourist ID
          hash: `${actualTouristId}_${Date.now()}_hash_verification`
        };
        
        setScannedTourist(touristData);
        setError('');
      } catch (error) {
        console.error('Error processing tourist data:', error);
        setError('Invalid QR code format');
        setScannedTourist(null);
      }
    }, 1000);
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
    setScannedTourist(null);
  };

  const handleMarkSafe = () => {
    setCurrentStatus('safe');
    if (scannedTourist) {
      setScannedTourist({ ...scannedTourist, status: 'safe' });
    }
  };

  const handleFlagAssistance = () => {
    setCurrentStatus('danger');
    if (scannedTourist) {
      setScannedTourist({ ...scannedTourist, status: 'danger' });
    }
  };

  const handleDownloadReport = () => {
    // Simulate PDF download
    console.log('Downloading tourist report...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg shadow-sm">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Police Dashboard</h1>
                <p className="text-sm text-muted-foreground">Tourist Safety Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Tourist Monitor
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                System Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!scannedTourist ? (
          /* Scanner View */
          <div className="max-w-md mx-auto">
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              isScanning={isScanning}
              setIsScanning={setIsScanning}
            />
          </div>
        ) : (
          /* Dashboard View */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Tourist Profile */}
            <div className="lg:col-span-1">
              <TouristProfile tourist={scannedTourist} />
            </div>

            {/* Middle Column - Map */}
            <div className="lg:col-span-1">
              <LiveMap
                touristId={scannedTourist.id}
                currentLocation={scannedTourist.lastLocation}
                status={scannedTourist.status}
              />
            </div>

            {/* Right Column - Controls */}
            <div className="lg:col-span-1">
              <PoliceControls
                touristId={scannedTourist.id}
                currentStatus={scannedTourist.status}
                accessLogs={mockAccessLogs}
                onMarkSafe={handleMarkSafe}
                onFlagAssistance={handleFlagAssistance}
                onDownloadReport={handleDownloadReport}
              />
            </div>
          </div>
        )}

        {/* Quick Scan Button */}
        {scannedTourist && (
          <div className="fixed bottom-6 left-6">
            <Card className="bg-white/95 backdrop-blur-sm shadow-elevated border">
              <CardContent className="p-4">
                <button
                  onClick={() => setScannedTourist(null)}
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Scan New Tourist
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;