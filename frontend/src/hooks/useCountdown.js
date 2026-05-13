/**
 * Purpose: Provides a one-second real-time countdown string and parts for upcoming session cards.
 */
import { differenceInSeconds } from "date-fns";
import { useEffect, useMemo, useState } from "react";

const partsFrom = (seconds) => {
  const safe = Math.max(0, seconds);
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return { days, hours, minutes, seconds: secs };
};

export const useCountdown = (date, time = "14:00") => {
  const target = useMemo(() => {
    if (!date) return null;
    const iso = String(date).slice(0, 10);
    return new Date(`${iso}T${time}:00`);
  }, [date, time]);
  const [remaining, setRemaining] = useState(() => (target ? differenceInSeconds(target, new Date()) : 0));

  useEffect(() => {
    if (!target) return undefined;
    const tick = () => setRemaining(differenceInSeconds(target, new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const parts = partsFrom(remaining);
  return {
    ...parts,
    isPast: remaining <= 0,
    label: remaining <= 0 ? "Session time reached" : `${parts.days}d ${parts.hours}h ${parts.minutes}m`,
  };
};
