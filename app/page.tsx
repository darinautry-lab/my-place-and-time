"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Crosshair, AlertCircle } from "lucide-react";
import LiveClock from "@/components/LiveClock";
import LocationInfo from "@/components/LocationInfo";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
});

type Coordinates = {
  lat: number;
  lng: number;
};

type LocationData = {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
};

export default function Home() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchLocationFromIP = async () => {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    setLocation({ lat: data.latitude, lng: data.longitude });

    setLocationData({
      city: data.city,
      region: data.region,
      country: data.country_name,
      lat: data.latitude,
      lng: data.longitude,
    });

    setTimezone(data.timezone);
    setLoading(false);
  };

  const requestGeolocation = useCallback(() => {
    setLoading(true);
    setPermissionDenied(false);

    if (!navigator.geolocation) {
      fetchLocationFromIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setLocation({ lat: latitude, lng: longitude });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`,
        );

        const data = await res.json();
        const addr = data.address || {};

        setLocationData({
          city:
            addr.city || addr.town || addr.village || addr.hamlet || "Unknown",
          region: addr.state || addr.county || "",
          country: addr.country || "",
          lat: latitude,
          lng: longitude,
        });

        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        setLoading(false);
      },
      (err) => {
        if (err.code === 1) {
          setPermissionDenied(true);
        }

        fetchLocationFromIP();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      requestGeolocation();
    });
  }, [requestGeolocation]);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white selection:bg-blue-500/30">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 md:px-12 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex items-center justify-between max-w-7xl mx-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Crosshair className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-white">
                Where You Are Today!
              </span>
            </div>

            {permissionDenied && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/[0.1] border border-amber-500/[0.2]">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-300">
                  Using approximate location
                </span>
              </div>
            )}
          </motion.div>
        </header>

        {/* Hero */}
        <section className="px-6 md:px-12 pt-8 md:pt-16 pb-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mb-12 md:mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extralight leading-[1.1] tracking-tight mb-4">
              Your world{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                pinpointed
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 font-light leading-relaxed max-w-lg">
              Real-time location intelligence. See exactly where you are, your
              local time, and explore the mile around you.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <LiveClock timezone={timezone} />
              <LocationInfo locationData={locationData} loading={loading} />
            </div>

            <div>
              <LocationMap
                lat={location?.lat ?? null}
                lng={location?.lng ?? null}
                loading={loading}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-8 mt-8 border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              Location data is processed locally and never stored.
            </p>

            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500">
                All systems operational
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
