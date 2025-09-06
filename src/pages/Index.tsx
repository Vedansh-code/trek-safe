import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MapPin, AlertTriangle, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-police/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Shield className="h-12 w-12 text-police" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-police to-primary bg-clip-text text-transparent">
              Smart Tourist Safety
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced monitoring and incident response system for tourist safety and emergency management
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-success/20 hover:border-success/40 transition-colors">
            <CardHeader>
              <MapPin className="h-8 w-8 text-success mb-2" />
              <CardTitle className="text-success">Live Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real-time location monitoring with geo-fencing alerts</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20 hover:border-warning/40 transition-colors">
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-warning mb-2" />
              <CardTitle className="text-warning">Emergency Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Instant SOS alerts and emergency incident management</p>
            </CardContent>
          </Card>

          <Card className="border-police/20 hover:border-police/40 transition-colors">
            <CardHeader>
              <Users className="h-8 w-8 text-police mb-2" />
              <CardTitle className="text-police">Command Center</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Centralized dashboard for monitoring and response coordination</p>
            </CardContent>
          </Card>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-success/20 hover:border-success/40">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">Tourist Interface</CardTitle>
              <CardDescription className="text-lg">
                Register, get tracked, and access emergency features
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ul className="text-left space-y-2 text-muted-foreground">
                <li>• Register with personal details</li>
                <li>• Generate unique QR code</li>
                <li>• Live location tracking</li>
                <li>• Emergency SOS button</li>
                <li>• Geo-fencing alerts</li>
              </ul>
              <Link to="/tourist" className="block">
                <Button variant="success" size="lg" className="w-full text-lg py-6">
                  Access Tourist App
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-police/20 hover:border-police/40">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-police/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-police" />
              </div>
              <CardTitle className="text-2xl text-police">Police Dashboard</CardTitle>
              <CardDescription className="text-lg">
                Monitor tourists and manage emergency responses
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ul className="text-left space-y-2 text-muted-foreground">
                <li>• Real-time tourist monitoring</li>
                <li>• Interactive map interface</li>
                <li>• Emergency alert management</li>
                <li>• QR code scanner</li>
                <li>• Incident response coordination</li>
              </ul>
              <Link to="/police" className="block">
                <Button variant="police" size="lg" className="w-full text-lg py-6">
                  Access Police Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p>© 2024 Smart Tourist Safety System - Advanced Emergency Response Technology</p>
        </div>
      </div>
    </div>
  );
};

export default Index;