"use client";

import { Globe } from "@/components/ui/globe";

const INDIA_MARKERS = [
  { location: [28.6139, 77.209] as [number, number], size: 0.06 }, // Delhi
  { location: [19.076, 72.8777] as [number, number], size: 0.08 }, // Mumbai
  { location: [12.9716, 77.5946] as [number, number], size: 0.05 }, // Bengaluru
  { location: [22.5726, 88.3639] as [number, number], size: 0.05 }, // Kolkata
  { location: [17.385, 78.4867] as [number, number], size: 0.05 }, // Hyderabad
  { location: [23.0225, 72.5714] as [number, number], size: 0.06 }, // Ahmedabad
  { location: [26.9124, 75.7873] as [number, number], size: 0.05 }, // Jaipur
  { location: [21.1458, 79.0882] as [number, number], size: 0.04 }, // Nagpur
];

export function ReachCard() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden">
      <div className="relative h-40 sm:h-48">
        <Globe
          className="!absolute !inset-0 scale-125 opacity-90"
          config={{
            width: 600,
            height: 600,
            onRender: () => {},
            devicePixelRatio: 2,
            phi: 4.6,
            theta: 0.25,
            dark: 1,
            diffuse: 0.4,
            mapSamples: 12000,
            mapBrightness: 3,
            baseColor: [0.1, 0.4, 0.3],
            markerColor: [16 / 255, 185 / 255, 129 / 255],
            glowColor: [0.06, 0.35, 0.25],
            markers: INDIA_MARKERS,
          }}
        />
      </div>
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-heading">Pan-India Reach</h3>
        <p className="mt-1 text-sm text-body">
          Sellers and buyers connected across every state, one plug-in
          vertical at a time.
        </p>
      </div>
    </div>
  );
}
