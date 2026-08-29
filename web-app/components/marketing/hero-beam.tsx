export function HeroBeam() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[500px] w-full max-w-3xl"
      viewBox="0 0 1100 500"
      fill="none"
      preserveAspectRatio="xMidYMin slice"
    >
      <g filter="url(#beam-blur)" style={{ mixBlendMode: "plus-lighter" }}>
        <path d="M611.5 51L495 -188H959L849.5 51H611.5Z" fill="#10B981" fillOpacity="0.12" />
      </g>
      <g filter="url(#beam-blur)" style={{ mixBlendMode: "plus-lighter" }}>
        <path d="M340 220L180 -50H520L420 220H340Z" fill="#059669" fillOpacity="0.08" />
      </g>
      <g filter="url(#beam-blur)" style={{ mixBlendMode: "plus-lighter" }}>
        <path d="M900 220L740 -50H1080L980 220H900Z" fill="#34D399" fillOpacity="0.08" />
      </g>
      <defs>
        <filter id="beam-blur" x="-200" y="-400" width="1500" height="1000" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="80" />
        </filter>
      </defs>
    </svg>
  );
}
