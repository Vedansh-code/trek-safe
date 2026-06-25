import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Shield, Key, ArrowLeft, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PoliceLogin = () => {
    const [policeId, setPoliceId] = useState("");
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
    const [isOtpGenerated, setIsOtpGenerated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleGenerateOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!policeId.trim()) {
            setError("Police ID is required to generate an OTP.");
            return;
        }

        setError(null);
        // Generate a random 6-digit OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setIsOtpGenerated(true);

        toast({
            title: "OTP Generated",
            description: "A demo OTP has been generated for you.",
        });
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) {
            setError("Please enter the OTP.");
            return;
        }

        if (otp === generatedOtp) {
            setError(null);
            setSuccess("Access Granted! Redirecting...");
            sessionStorage.setItem("police_authenticated", "true");

            toast({
                title: "Authentication Successful",
                description: "Welcome back, Officer.",
            });

            setTimeout(() => {
                navigate("/police");
            }, 1000);
        } else {
            setError("Invalid OTP. Please check the code and try again.");
            toast({
                title: "Authentication Failed",
                description: "The OTP entered was incorrect.",
                variant: "destructive",
            });
        }
    };

    const handleReset = () => {
        setPoliceId("");
        setOtp("");
        setGeneratedOtp(null);
        setIsOtpGenerated(false);
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0A0F1A] text-slate-100 p-4 flex items-center justify-center">
            {/* Animated Aurora Background */}
            <div className="absolute top-0 left-0 right-0 bottom-0 z-0 pointer-events-none">
                <div className="absolute top-0 -left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

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

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-slate-800/40 border-slate-700 backdrop-blur-sm shadow-2xl">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500/30">
                                <Shield className="h-8 w-8 text-indigo-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
                                Police Portal Login
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Tourist Safety Monitoring System
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2 text-sm text-red-400">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg flex items-start gap-2 text-sm text-teal-400">
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <span>{success}</span>
                                </div>
                            )}

                            {!isOtpGenerated ? (
                                <form onSubmit={handleGenerateOtp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="policeId" className="text-slate-300 font-medium">
                                            Officer/Police ID
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                                <Lock className="h-4 w-4" />
                                            </span>
                                            <Input
                                                id="policeId"
                                                type="text"
                                                required
                                                placeholder="Enter Police Badge or ID"
                                                value={policeId}
                                                onChange={(e) => setPoliceId(e.target.value)}
                                                className="bg-slate-900/60 border-slate-750 text-white placeholder-slate-550 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-lg shadow-lg shadow-indigo-600/25 transition-all duration-300"
                                    >
                                        Generate OTP
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-slate-355">
                                        <span className="font-semibold text-indigo-400 block mb-1">Generated OTP:</span>
                                        <span className="text-2xl font-bold tracking-widest text-white block my-1">{generatedOtp}</span>
                                        <span className="text-xs text-slate-400 italic">
                                            Demo Mode: The Police Dashboard is currently running in demo mode. For demonstration purposes, the generated OTP is displayed on-screen instead of being verified through the backend.
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="otp" className="text-slate-300 font-medium">
                                                Enter 6-Digit OTP
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline animate-none"
                                            >
                                                Change ID
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                                <Key className="h-4 w-4" />
                                            </span>
                                            <Input
                                                id="otp"
                                                type="text"
                                                maxLength={6}
                                                required
                                                placeholder="Enter OTP code"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                                className="bg-slate-900/60 border-slate-750 text-white placeholder-slate-550 pl-10 tracking-widest font-semibold focus:border-indigo-500 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-lg shadow-lg shadow-indigo-600/25 transition-all duration-300"
                                        disabled={!!success}
                                    >
                                        Login to Dashboard
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default PoliceLogin;
