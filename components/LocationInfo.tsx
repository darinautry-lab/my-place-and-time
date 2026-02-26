"use client";

import { motion } from "framer-motion";
import { Navigation, Globe, Compass, Map } from "lucide-react";

type LocationData = {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
};

type LocationInfoProps = {
  locationData: LocationData | null;
  loading: boolean;
};

export default function LocationInfo({
  locationData,
  loading,
}: LocationInfoProps) {
  const items = [
    {
      icon: Navigation,
      label: "City",
      value: locationData?.city || "—",
    },
    {
      icon: Globe,
      label: "Region",
      value: locationData?.region || "—",
    },
    {
      icon: Compass,
      label: "Country",
      value: locationData?.country || "—",
    },
    {
      icon: Map,
      label: "Coordinates",
      value:
        locationData?.lat && locationData?.lng
          ? `${locationData.lat.toFixed(2)}°, ${locationData.lng.toFixed(2)}°`
          : "—",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 md:p-10">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-4 h-4 text-blue-400/70" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-slate-400">
            Location Details
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-3 p-3 rounded-2xl transition-colors hover:bg-white/[0.03]">
                <div className="mt-0.5 w-8 h-8 rounded-xl bg-blue-500/[0.08] border border-blue-500/[0.1] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-3.5 h-3.5 text-blue-400/70" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-wider uppercase text-slate-500 mb-0.5">
                    {item.label}
                  </p>

                  {loading ? (
                    <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <p className="text-sm font-light text-white truncate">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
