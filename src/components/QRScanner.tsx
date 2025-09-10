import { useState, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import QrScanner from 'qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Camera, Scan, Upload, FileImage } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRScannerProps {
  onScanSuccess: (touristId: string) => void;
  onScanError: (error: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

const QRScanner = ({ onScanSuccess, onScanError, isScanning, setIsScanning }: QRScannerProps) => {
  const [error, setError] = useState<string>('');
  const [scanMode, setScanMode] = useState<'camera' | 'file'>('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResult = (result: any, error: any) => {
    if (result && result.text) {
      try {
        // Extract tourist ID from QR code
        const touristId = result.text.trim();
        setError('');
        setIsScanning(false);
        onScanSuccess(touristId);
      } catch (err) {
        setError('Invalid QR code format');
        onScanError('Invalid QR code format');
      }
    }

    if (error) {
      console.error('QR Scanner Error:', error);
    }
  };

  const handleError = (error: any) => {
    console.error('Camera Error:', error);
    setError('Camera access denied or unavailable');
    onScanError('Camera access denied or unavailable');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      // Create image element from file
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      
      image.onload = async () => {
        try {
          // Use QrScanner to scan the image
          const result = await QrScanner.scanImage(image, {
            returnDetailedScanResult: true,
          });
          
          const touristId = result.data.trim();
          setError('');
          onScanSuccess(touristId);
          
          // Clean up
          URL.revokeObjectURL(imageUrl);
        } catch (err) {
          console.error('QR scan error:', err);
          setError('No QR code found in the image');
          onScanError('No QR code found in the image');
          URL.revokeObjectURL(imageUrl);
        } finally {
          setIsProcessing(false);
        }
      };

      image.onerror = () => {
        setError('Failed to load image');
        onScanError('Failed to load image');
        setIsProcessing(false);
        URL.revokeObjectURL(imageUrl);
      };

      image.src = imageUrl;
    } catch (err) {
      console.error('File processing error:', err);
      setError('Failed to process file');
      onScanError('Failed to process file');
      setIsProcessing(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          QR Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={scanMode} onValueChange={(value) => setScanMode(value as 'camera' | 'file')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            {!isScanning ? (
              <div className="text-center space-y-4">
                <div className="p-8 border-2 border-dashed border-muted rounded-lg">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Click below to start scanning tourist QR codes with camera
                  </p>
                </div>
                <Button 
                  onClick={() => setIsScanning(true)}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <QrReader
                    onResult={handleResult}
                    constraints={{ 
                      facingMode: 'environment',
                      width: 300,
                      height: 300
                    }}
                    className="w-full"
                    videoStyle={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px'
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsScanning(false)}
                  variant="outline"
                  className="w-full"
                >
                  Stop Scanning
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="p-8 border-2 border-dashed border-muted rounded-lg">
                <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Upload an image containing a QR code to scan
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPG, PNG, WEBP formats
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button 
                onClick={handleUploadClick}
                className="w-full"
                size="lg"
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing Image...' : 'Choose Image File'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;