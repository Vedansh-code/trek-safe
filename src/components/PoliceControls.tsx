import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Download, 
  Clock,
  CheckCircle,
  Flag,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessLog {
  id: string;
  officerId: string;
  officerName: string;
  timestamp: string;
  action: string;
  location: string;
}

interface PoliceControlsProps {
  touristId: string;
  currentStatus: 'safe' | 'danger' | 'warning';
  accessLogs: AccessLog[];
  onMarkSafe: () => void;
  onFlagAssistance: () => void;
  onDownloadReport: () => void;
}

const PoliceControls = ({ 
  touristId, 
  currentStatus, 
  accessLogs, 
  onMarkSafe, 
  onFlagAssistance, 
  onDownloadReport 
}: PoliceControlsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleMarkSafe = async () => {
    setIsLoading('mark-safe');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onMarkSafe();
      toast({
        title: "Tourist Marked as Safe",
        description: "Status updated and logged in system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleFlagAssistance = async () => {
    setIsLoading('flag-assistance');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onFlagAssistance();
      toast({
        title: "Assistance Alert Created",
        description: "Incident alert has been logged and dispatch notified.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDownloadReport = async () => {
    setIsLoading('download-report');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate PDF generation
      onDownloadReport();
      toast({
        title: "Report Downloaded",
        description: "Tourist safety report has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      safe: { color: 'bg-status-safe', text: 'Safe' },
      danger: { color: 'bg-status-danger', text: 'SOS Alert' },
      warning: { color: 'bg-status-warning', text: 'Restricted Zone' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white border-0`}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Status
            </span>
            {getStatusBadge(currentStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-safe"></div>
              <span>Location Tracking Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-safe"></div>
              <span>Emergency Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-warning"></div>
              <span>Restricted Zone Monitor</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Police Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Police Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleMarkSafe}
            className="w-full bg-status-safe hover:bg-status-safe/90 text-white"
            size="lg"
            disabled={isLoading === 'mark-safe' || currentStatus === 'safe'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isLoading === 'mark-safe' ? 'Updating...' : 'Mark Tourist as Safe'}
          </Button>

          <Button 
            onClick={handleFlagAssistance}
            variant="destructive"
            className="w-full"
            size="lg"
            disabled={isLoading === 'flag-assistance'}
          >
            <Flag className="h-4 w-4 mr-2" />
            {isLoading === 'flag-assistance' ? 'Creating Alert...' : 'Flag for Assistance'}
          </Button>

          <Button 
            onClick={handleDownloadReport}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isLoading === 'download-report'}
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading === 'download-report' ? 'Generating PDF...' : 'Download Tourist Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Access Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Access Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent access logs available
              </p>
            ) : (
              accessLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                  <Eye className="h-4 w-4 text-primary" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{log.officerName}</span>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.action} • {log.location}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PoliceControls;