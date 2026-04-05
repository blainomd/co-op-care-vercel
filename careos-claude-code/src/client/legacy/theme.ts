export const C = {
  bg: "#FAF8F4",
  cream: "#F5F0E7",
  sand: "#EDE8DF",
  warm: "#F8F4ED",
  card: "#FFFFFF",
  dark: "#2B2720",
  dk2: "#3B3730",
  t1: "#2B2720",
  t2: "#5A5345",
  t3: "#8F8A80",
  t4: "#B5B0A6",
  border: "#E5E0D6",
  sage: "#4F7A5E",
  sageLt: "#E5EFEA",
  sageD: "#3A5E46",
  sageBg: "#F0F6F2",
  copper: "#B07A4F",
  copperLt: "#F8EDE3",
  copperBg: "#FDF6F0",
  gold: "#C49B40",
  goldLt: "#FBF5E5",
  blue: "#4A6FA5",
  blueLt: "#EBF0FA",
  purple: "#7A5CB8",
  purpleLt: "#F3EEFA",
  rose: "#A84A6E",
  roseLt: "#FAECF0",
  red: "#A84040",
  redLt: "#FAECEC",
  stone: "#7A8B8B",
  stoneLt: "#EDF1F1",
  w: "#FFFFFF",
};

export const ff = "'Literata','Georgia',serif";
export const fs = "'DM Sans','system-ui',sans-serif";
export const fm = "'SF Mono','Fira Code','Courier New',monospace";

import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
