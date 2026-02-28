"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

type LiveClockProps = {
  timezone: string | null;
};

export default function LiveClock({ timezone }: LiveClockProps) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const resolvedTimezone =
    timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formattedTime = time.toLocaleTimeString("en-US", {
    timeZone: resolvedTimezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    timeZone: resolvedTimezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [timePart, period] = formattedTime.split(" ");
  const [hours, minutes, seconds] = timePart.split(":");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 md:p-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-blue-400/70" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-slate-400">
              Local Time
            </span>
          </div>

          <div className="flex items-baseline gap-1 mb-2">
            {[hours, minutes, seconds].map((unit, i) => (
              <div key={i} className="flex items-baseline">
                <motion.span
                  key={unit + i}
                  initial={{ opacity: 0.5, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl md:text-7xl font-extralight tracking-tight text-white tabular-nums"
                >
                  {unit}
                </motion.span>

                {i < 2 && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-5xl md:text-7xl font-extralight text-blue-400/50 mx-1"
                  >
                    :
                  </motion.span>
                )}
              </div>
            ))}

            <span className="text-lg md:text-xl font-light text-slate-500 ml-2">
              {period}
            </span>
          </div>

          <p className="text-sm text-slate-400 font-light">{formattedDate}</p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.12]">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-300/80 font-medium">
              {resolvedTimezone.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
