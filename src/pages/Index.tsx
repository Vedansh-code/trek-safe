import { useState, useEffect, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Shield,
    MapPin,
    AlertTriangle,
    Users,
    ArrowRight,
    CheckCircle,
    UserPlus,
    Map,
    Siren,
    Star,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import Chatbot from "@/components/chatbot";

// Animation variants for Framer Motion
const fadeIn = (direction = "up", delay = 0) => ({
    hidden: { opacity: 0, y: direction === "up" ? 20 : -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
});

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

interface Review {
    id: string;
    name: string;
    rating: number;
    comment: string;
    date: string;
}

const DEFAULT_REVIEWS: Review[] = [
    {
        id: "default-1",
        name: "Arjun Mehta",
        rating: 5,
        comment: "Trekking through the Parvati Valley was so much safer with IRIS active. The real-time safety zoning and automatic alerts gave my family absolute peace of mind.",
        date: "12 June 2026"
    },
    {
        id: "default-2",
        name: "Sophia Martinez",
        rating: 5,
        comment: "The SOS emergency response is lightning fast! The local police coordinates were updated instantly when we needed assistance near the restricted border zone.",
        date: "05 June 2026"
    },
    {
        id: "default-3",
        name: "Vikram Rathore",
        rating: 4,
        comment: "Excellent concept for safety. The QR-code scanning makes check-ins at entry points seamless and secure. Highly recommended for all Himalayan travelers.",
        date: "28 May 2026"
    }
];

const Index = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -400, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 400, behavior: "smooth" });
        }
    };

    useEffect(() => {
        try {
            const stored = localStorage.getItem("trek_safe_reviews");
            const parsedStored = stored ? JSON.parse(stored) : [];
            setReviews([...parsedStored, ...DEFAULT_REVIEWS]);
        } catch (error) {
            console.error("Error parsing reviews:", error);
            setReviews(DEFAULT_REVIEWS);
        }
    }, []);

    const howItWorksSteps = [
        {
            icon: <UserPlus size={32} />,
            title: "Register & Activate",
            description:
                "Quickly sign up with your travel details to generate a unique, secure profile.",
        },
        {
            icon: <Map size={32} />,
            title: "Explore with Confidence",
            description:
                "Your location is monitored in real-time within safe zones, ensuring your peace of mind.",
        },
        {
            icon: <Siren size={32} />,
            title: "Get Instant Help",
            description:
                "Use the one-tap SOS button to instantly alert authorities and our response team.",
        },
    ];

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0A0F1A] text-slate-100">
            {/* Animated Aurora Background */}
            <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
                <div className="absolute top-0 -left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl animate-blob"></div>
                <div className="absolute -top-1/4 right-0 w-96 h-96 bg-teal-600/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4">
                {/* ===== Section: Hero ===== */}
                <motion.div
                    className="text-center min-h-screen flex flex-col justify-center items-center"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn()}
                >
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <Shield className="h-14 w-14 text-indigo-400" />
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                            IRIS
                        </h1>
                    </div>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
                        Intelligent Real-time Integrated Safety
                        Real-time protection powered by intelligent monitoring
                        technology.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            asChild
                            size="lg"
                            className="mt-8 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg py-7 px-8 rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-300 cursor-pointer"
                        >
                            <ScrollLink
                                to="access"
                                spy={true}
                                smooth={true}
                                offset={65}
                                duration={800}
                            >
                                Get Started{" "}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </ScrollLink>
                        </Button>
                    </motion.div>
                </motion.div>

                {/* ===== Section: Key Statistics ===== */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center my-24"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <motion.div
                        variants={fadeIn()}
                        className="bg-slate-800/20 p-6 rounded-xl backdrop-blur-sm border border-slate-700"
                    >
                        <p className="text-slate-200 text-lg font-semibold">
                            Real-time Monitoring
                        </p>
                    </motion.div>
                    <motion.div
                        variants={fadeIn()}
                        className="bg-slate-800/20 p-6 rounded-xl backdrop-blur-sm border border-slate-700"
                    >
                        <p className="text-slate-200 text-lg font-semibold">
                            Fast Response Time
                        </p>
                    </motion.div>
                    <motion.div
                        variants={fadeIn()}
                        className="bg-slate-800/20 p-6 rounded-xl backdrop-blur-sm border border-slate-700"
                    >
                        <p className="text-slate-200 text-lg font-semibold">
                            System Reliability
                        </p>
                    </motion.div>
                </motion.div>

                {/* ===== Section: How It Works ===== */}
                <div className="my-24 py-16">
                    <motion.h2
                        variants={fadeIn()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-center mb-16"
                    >
                        How It Works
                    </motion.h2>
                    <motion.div
                        className="grid md:grid-cols-3 gap-10"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {howItWorksSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={fadeIn("up", index * 0.1)}
                                className="text-center flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-indigo-500/30 text-indigo-400">
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-semibold mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-slate-400 max-w-xs">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* ===== Section: Access Cards ===== */}
                <div id="access" className="my-24 py-16">
                    <motion.h2
                        variants={fadeIn()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-center mb-4"
                    >
                        Choose Your Interface
                    </motion.h2>
                    <motion.p
                        variants={fadeIn()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-lg text-slate-400 text-center mb-16 max-w-2xl mx-auto"
                    >
                        Whether you're a tourist seeking security or an officer
                        managing safety, we have a dedicated portal for you.
                    </motion.p>
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Tourist Card */}
                        <motion.div
                            variants={fadeIn()}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            <Card className="group h-full bg-slate-800/40 border-2 border-teal-500/20 backdrop-blur-sm hover:border-teal-400/60 transition-all duration-300 shadow-lg hover:shadow-teal-500/20 flex flex-col">
                                <CardHeader className="text-center">
                                    <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                                        <MapPin className="h-10 w-10 text-teal-400" />
                                    </div>
                                    <CardTitle className="text-3xl text-teal-400">
                                        Tourist Interface
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center flex-grow flex flex-col justify-between p-8">
                                    <ul className="text-left space-y-3 text-slate-300 mb-8">
                                        <li className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-teal-400 mr-3 flex-shrink-0" />{" "}
                                            Quick & Easy Registration
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-teal-400 mr-3 flex-shrink-0" />{" "}
                                            Real-Time Location Sharing
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-teal-400 mr-3 flex-shrink-0" />{" "}
                                            Instant Emergency SOS Button
                                        </li>
                                    </ul>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full text-lg py-6 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow-lg shadow-teal-500/30 transition-all duration-300"
                                        >
                                            <RouterLink to="/tourist">
                                                Access Tourist App
                                            </RouterLink>
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Police Card */}
                        <motion.div
                            variants={fadeIn()}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            <Card className="group h-full bg-slate-800/40 border-2 border-indigo-500/20 backdrop-blur-sm hover:border-indigo-400/60 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20 flex flex-col">
                                <CardHeader className="text-center">
                                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                        <Shield className="h-10 w-10 text-indigo-400" />
                                    </div>
                                    <CardTitle className="text-3xl text-indigo-400">
                                        Police Dashboard
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center flex-grow flex flex-col justify-between p-8">
                                    <ul className="text-left space-y-3 text-slate-300 mb-8">
                                        <li className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />{" "}
                                            Live Tourist Monitoring Map
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />{" "}
                                            Instant Alert Management
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />{" "}
                                            Coordinated Incident Response
                                        </li>
                                    </ul>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full text-lg py-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-300"
                                        >
                                            <RouterLink to="/police">
                                                Access Police Dashboard
                                            </RouterLink>
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* ===== Section: Testimonials/Reviews ===== */}
                <div className="my-24 py-16 relative">
                    <motion.h2
                        variants={fadeIn()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-center mb-16"
                    >
                        Trusted by Travelers
                    </motion.h2>

                    <div className="relative max-w-6xl mx-auto px-4 group/slider">
                        {/* Slide Buttons */}
                        <button
                            onClick={scrollLeft}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-slate-900/80 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-800 text-white rounded-full p-3 shadow-xl transition-all duration-300 opacity-80 md:opacity-0 group-hover/slider:opacity-100 flex items-center justify-center cursor-pointer"
                            aria-label="Previous reviews"
                        >
                            <ChevronLeft className="h-6 w-6 text-teal-400" />
                        </button>
                        
                        <button
                            onClick={scrollRight}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-slate-900/80 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-800 text-white rounded-full p-3 shadow-xl transition-all duration-300 opacity-80 md:opacity-0 group-hover/slider:opacity-100 flex items-center justify-center cursor-pointer"
                            aria-label="Next reviews"
                        >
                            <ChevronRight className="h-6 w-6 text-teal-400" />
                        </button>

                        {/* Sliding Container */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 px-2 no-scrollbar"
                            style={{ scrollbarWidth: "none" }}
                        >
                            {[...reviews]
                                .sort((a, b) => Number(b.id) - Number(a.id))
                                .map((review) => (
                                    <div
                                        key={review.id}
                                        className="snap-start shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.33%-16px)] bg-slate-800/20 hover:bg-slate-800/40 p-8 rounded-xl backdrop-blur-md border border-slate-700 hover:border-teal-500/40 transition-all duration-500 shadow-2xl relative overflow-hidden group/card flex flex-col justify-between min-h-[240px]"
                                    >
                                        {/* Glossy sheen effect on hover */}
                                        <div className="absolute inset-0 w-[200%] -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

                                        <div>
                                            <div className="flex text-yellow-400 mb-4 gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-5 w-5 ${
                                                            i < review.rating
                                                                ? "text-yellow-400 fill-yellow-400"
                                                                : "text-slate-600"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <blockquote className="text-slate-300 italic relative z-10 text-sm md:text-base leading-relaxed">
                                                "{review.comment}"
                                            </blockquote>
                                        </div>
                                        <div className="flex justify-between items-center mt-6 border-t border-slate-700/50 pt-4 relative z-10">
                                            <span className="font-bold text-slate-100 text-sm">- {review.name}</span>
                                            <span className="text-xs text-slate-500">{review.date}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Share Your Experience option linked to Tourist App */}
                    <div className="text-center mt-12">
                        <Button
                            asChild
                            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-teal-500/25 transition-all duration-300 cursor-pointer text-base"
                        >
                            <RouterLink to="/tourist">
                                Share Your Experience
                            </RouterLink>
                        </Button>
                    </div>
                </div>

                {/* ===== Section: Final CTA ===== */}
                <div className="text-center my-24 py-16">
                    <motion.h2
                        variants={fadeIn()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-4"
                    >
                        Ready for a Safer Journey?
                    </motion.h2>
                    <motion.p
                        variants={fadeIn("up", 0.1)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto mb-8"
                    >
                        Download the app or register today to activate your
                        personal protection.
                    </motion.p>
                    <motion.div
                        variants={fadeIn("up", 0.2)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            asChild
                            size="lg"
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg py-7 px-8 rounded-full shadow-lg shadow-teal-500/30 transition-all duration-300 cursor-pointer"
                        >
                            <ScrollLink
                                to="access"
                                spy={true}
                                smooth={true}
                                offset={65}
                                duration={800}
                            >
                                Get Access Now
                            </ScrollLink>
                        </Button>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="text-center py-8 text-slate-500 border-t border-slate-800">
                    <p>
                        © 2025 SafeGuard Systems - Advanced Emergency Response
                        Technology
                    </p>
                </div>
                {/* Chatbot Floating Widget */}
                <Chatbot />
            </div>
        </div>

    );
};

export default Index;
