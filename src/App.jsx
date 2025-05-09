import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookingModal } from "@/components/booking-modal";
import { ServicesSection } from "@/components/services-section";
import { Toaster } from "@/components/ui/toaster";
import {
  Facebook,
  Instagram,
  MapPin,
  Mail,
  Phone,
  Calendar
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function App() {
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const servicesRef = useRef(null);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleScrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Inject Shapo script
  useEffect(() => {
    const scriptId = "shapo-embed-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.shapo.io/js/embed.js";
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient text-white px-4 py-16">
        <motion.div className="container max-w-xl mx-auto text-center" {...fadeIn}>
          <h1 className="text-4xl font-bold mb-4">Hair by Noora</h1>
          <p className="text-lg mb-8 opacity-90">Your luxury beauty destination in Pakenham</p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
            onClick={handleScrollToServices}
          >
            Book Now
          </Button>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="px-4 py-16 bg-secondary/10">
        <motion.div className="container max-w-xl mx-auto text-center" {...fadeIn}>
          <h2 className="text-2xl font-bold mb-6">About Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            Hair by Noora is a luxury beauty destination in Pakenham, offering personalized hair styling,
            premium coloring, elegant makeup, and precise waxing services. Whether you're here for a big event
            or a fresh new look, we make you feel radiant and confident every time.
          </p>
        </motion.div>
      </section>

      {/* Services Section */}
      <div ref={servicesRef}>
        <ServicesSection onServiceClick={handleServiceClick} />
      </div>

      {/* Gallery Section */}
      <section className="px-4 py-16 bg-secondary/30">
        <div className="container max-w-xl mx-auto">
          <motion.h2 className="text-2xl font-bold mb-8 text-center" {...fadeIn}>
            Our Work
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/faeeb62e-a0d6-4ca5-9155-cd1dfce24950/20ac78f4a45d3a4e19129d607437116e.png"
              alt="Hair transformation result"
              className="w-full aspect-square object-cover rounded-lg transition-transform hover:scale-105"
            />
            <img
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/faeeb62e-a0d6-4ca5-9155-cd1dfce24950/e8c6085ec775d27a38fb46db7c9345df.jpg"
              alt="Professional styling result"
              className="w-full aspect-square object-cover rounded-lg transition-transform hover:scale-105"
            />
            <img
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/faeeb62e-a0d6-4ca5-9155-cd1dfce24950/adc2282b8062bbb13d3b2ebae4201758.jpg"
              alt="Hair coloring result"
              className="w-full aspect-square object-cover rounded-lg transition-transform hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Reviews Section (Shapo Embed) */}
      <section className="px-4 py-16">
        <div className="container max-w-xl mx-auto">
          <motion.h2 className="text-2xl font-bold mb-8 text-center" {...fadeIn}>
            What Our Clients Say
          </motion.h2>
          <div id={`shapo-widget-${import.meta.env.VITE_SHAPO_WIDGET_ID}`} className="w-full" />
        </div>
      </section>

      {/* Book Now Section */}
      <section className="px-4 py-16 bg-primary/10">
        <div className="container max-w-xl mx-auto text-center">
          <motion.div className="space-y-6" {...fadeIn}>
            <h2 className="text-3xl font-bold">Ready for a New Look?</h2>
            <p className="text-lg text-muted-foreground">
              Book your appointment today and let us help you achieve your dream style
            </p>
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleScrollToServices}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <footer className="bg-primary text-white px-4 py-12">
        <div className="container max-w-xl mx-auto">
          <div className="grid gap-6 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-5 h-5" />
                <p>15 Kaprun Way, Pakenham 3810</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-5 h-5" />
                <a href="mailto:hello@hairbynoora.com.au" className="hover:underline">
                  hello@hairbynoora.com.au
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-5 h-5" />
                <a href="tel:0432772818" className="hover:underline">
                  0432 772 818
                </a>
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/20"
                onClick={() =>
                  window.open("https://www.facebook.com/profile.php?id=100075910677998", "_blank")
                }
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/20"
                onClick={() =>
                  window.open("https://www.instagram.com/makeup_hairbynoora/", "_blank")
                }
              >
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedService}
      />

      <Toaster />
    </div>
  );
}
